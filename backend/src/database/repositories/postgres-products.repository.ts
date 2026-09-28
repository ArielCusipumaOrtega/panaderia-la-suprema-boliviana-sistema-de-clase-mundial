import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ProductsRepository,
  ProductFilterQuery,
} from '../../modules/products/domain/products.repository.interface.js';
import {
  ProductEntity,
  StockBranchEntity,
} from '../../modules/products/domain/product.entity.js';
import { DatabaseService } from '../database.service.js';

@Injectable()
export class PostgresProductsRepository implements ProductsRepository {
  constructor(private readonly db: DatabaseService) {}

  findAll(query?: ProductFilterQuery): ProductEntity[] {
    let list = this.db.products.filter((p) => p.activo);

    if (query?.categoria) {
      list = list.filter((p) => p.categoria === query.categoria);
    }
    if (query?.aptoEnvioNacional !== undefined) {
      list = list.filter(
        (p) => p.aptoEnvioNacional === query.aptoEnvioNacional,
      );
    }
    if (query?.destacado !== undefined) {
      list = list.filter((p) => p.destacado === query.destacado);
    }
    if (query?.busqueda) {
      const q = query.busqueda.toLowerCase();
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          p.codigoSku.toLowerCase().includes(q),
      );
    }

    return list;
  }

  findById(id: string): ProductEntity | null {
    return (
      this.db.products.find((p) => p.id === id || p.codigoSku === id) || null
    );
  }

  findBySku(sku: string): ProductEntity | null {
    return (
      this.db.products.find(
        (p) => p.codigoSku.toLowerCase() === sku.toLowerCase(),
      ) || null
    );
  }

  create(product: ProductEntity): ProductEntity {
    this.db.products.push(product);
    // Inicializar stock en todas las sucursales existentes
    for (const b of this.db.branches) {
      this.db.stock.push({
        id: `stk-${b.id}-${product.id}`,
        productoId: product.id,
        sucursalId: b.id,
        cantidadDisponible: 0,
        cantidadMinimaAlerta: 10,
        ultimaActualizacion: new Date().toISOString(),
      });
    }
    this.db.save();
    return product;
  }

  update(id: string, updates: Partial<ProductEntity>): ProductEntity {
    const idx = this.db.products.findIndex((p) => p.id === id);
    if (idx === -1) {
      throw new NotFoundException(
        `Producto '${id}' no encontrado para actualizar`,
      );
    }
    this.db.products[idx] = { ...this.db.products[idx], ...updates };
    this.db.save();
    return this.db.products[idx];
  }

  getStock(productId: string, sucursalId?: string): StockBranchEntity[] {
    let stockEntries = this.db.stock.filter((s) => s.productoId === productId);
    if (sucursalId) {
      stockEntries = stockEntries.filter((s) => s.sucursalId === sucursalId);
    }
    return stockEntries;
  }

  updateStock(
    sucursalId: string,
    productId: string,
    nuevaCantidad: number,
  ): StockBranchEntity {
    let entry = this.db.stock.find(
      (s) => s.productoId === productId && s.sucursalId === sucursalId,
    );

    if (!entry) {
      entry = {
        id: `stk-${sucursalId}-${productId}`,
        productoId: productId,
        sucursalId,
        cantidadDisponible: nuevaCantidad,
        cantidadMinimaAlerta: 10,
        ultimaActualizacion: new Date().toISOString(),
      };
      this.db.stock.push(entry);
    } else {
      entry.cantidadDisponible = nuevaCantidad;
      entry.ultimaActualizacion = new Date().toISOString();
    }

    this.db.save();
    return entry;
  }

  decrementStock(
    sucursalId: string,
    productId: string,
    cantidad: number,
  ): StockBranchEntity {
    const entry = this.db.stock.find(
      (s) => s.productoId === productId && s.sucursalId === sucursalId,
    );

    if (!entry) {
      throw new NotFoundException(
        `Registro de stock para producto '${productId}' en sucursal '${sucursalId}' no encontrado`,
      );
    }

    entry.cantidadDisponible = Math.max(0, entry.cantidadDisponible - cantidad);
    entry.ultimaActualizacion = new Date().toISOString();
    this.db.save();
    return entry;
  }
}
