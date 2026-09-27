import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  DatabaseService,
  ProductEntity,
} from '../../database/database.service.js';
import { CreateProductDto, UpdateStockDto } from './dto/create-product.dto.js';
import { ProductCategory } from '../../common/enums/product-category.enum.js';

@Injectable()
export class ProductsService {
  constructor(private readonly db: DatabaseService) {}

  findAll(query?: {
    categoria?: ProductCategory;
    aptoEnvioNacional?: boolean;
    destacado?: boolean;
    busqueda?: string;
  }) {
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

  findById(id: string): ProductEntity {
    const prod = this.db.products.find(
      (p) => p.id === id || p.codigoSku === id,
    );
    if (!prod) {
      throw new NotFoundException(
        `Producto con ID o SKU '${id}' no encontrado`,
      );
    }
    return prod;
  }

  getProductWithStock(id: string, sucursalId?: string) {
    const product = this.findById(id);
    let stockEntries = this.db.stock.filter((s) => s.productoId === product.id);

    if (sucursalId) {
      stockEntries = stockEntries.filter((s) => s.sucursalId === sucursalId);
    }

    const stockPorSucursal = stockEntries.map((stk) => {
      const branch = this.db.branches.find((b) => b.id === stk.sucursalId);
      return {
        sucursalId: stk.sucursalId,
        sucursalNombre: branch?.nombre || stk.sucursalId,
        departamento: branch?.departamento,
        cantidadDisponible: stk.cantidadDisponible,
        alertaBajoStock: stk.cantidadDisponible <= stk.cantidadMinimaAlerta,
      };
    });

    const stockTotalBolivia = stockEntries.reduce(
      (sum, s) => sum + s.cantidadDisponible,
      0,
    );

    return {
      ...product,
      stockTotalBolivia,
      stockPorSucursal,
    };
  }

  create(dto: CreateProductDto): ProductEntity {
    const existing = this.db.products.find(
      (p) => p.codigoSku.toUpperCase() === dto.codigoSku.toUpperCase(),
    );
    if (existing) {
      throw new ConflictException(
        `Ya existe un producto con SKU ${dto.codigoSku}`,
      );
    }

    const newProduct: ProductEntity = {
      id: `prod-${uuidv4().substring(0, 8)}`,
      codigoSku: dto.codigoSku.toUpperCase(),
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      categoria: dto.categoria,
      precioBs: dto.precioBs,
      unidadMedida: dto.unidadMedida,
      tiempoVidaUtilHoras: dto.tiempoVidaUtilHoras,
      aptoEnvioNacional: dto.aptoEnvioNacional,
      horarioRecomendado: dto.horarioRecomendado,
      ingredientesPrincipales: dto.ingredientesPrincipales,
      imagenUrl: dto.imagenUrl,
      destacado: dto.destacado || false,
      activo: true,
    };

    this.db.products.push(newProduct);

    // Inicializar stock en todas las sucursales existentes
    for (const b of this.db.branches) {
      this.db.stock.push({
        id: `stk-${b.id}-${newProduct.id}`,
        productoId: newProduct.id,
        sucursalId: b.id,
        cantidadDisponible: 40,
        cantidadMinimaAlerta: 10,
        ultimaActualizacion: new Date().toISOString(),
      });
    }

    this.db.save();
    return newProduct;
  }

  updateStock(productId: string, dto: UpdateStockDto) {
    this.findById(productId);
    let stockItem = this.db.stock.find(
      (s) => s.productoId === productId && s.sucursalId === dto.sucursalId,
    );

    if (!stockItem) {
      stockItem = {
        id: `stk-${dto.sucursalId}-${productId}`,
        productoId: productId,
        sucursalId: dto.sucursalId,
        cantidadDisponible: dto.cantidadDisponible,
        cantidadMinimaAlerta: 10,
        ultimaActualizacion: new Date().toISOString(),
      };
      this.db.stock.push(stockItem);
    } else {
      stockItem.cantidadDisponible = dto.cantidadDisponible;
      stockItem.ultimaActualizacion = new Date().toISOString();
    }

    this.db.save();
    return stockItem;
  }
}
