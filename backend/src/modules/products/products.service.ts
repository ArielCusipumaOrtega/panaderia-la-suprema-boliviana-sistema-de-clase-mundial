import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  ProductsRepository,
  ProductFilterQuery,
} from './domain/products.repository.interface.js';
import { ProductEntity, StockBranchEntity } from './domain/product.entity.js';
import { BranchesRepository } from '../branches/domain/branches.repository.interface.js';
import { CreateProductDto, UpdateStockDto } from './dto/create-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly branchesRepo: BranchesRepository,
  ) {}

  findAll(query?: ProductFilterQuery): ProductEntity[] {
    return this.productsRepo.findAll(query);
  }

  findById(id: string): ProductEntity {
    const prod = this.productsRepo.findById(id);
    if (!prod) {
      throw new NotFoundException(
        `Producto con ID o SKU '${id}' no encontrado`,
      );
    }
    return prod;
  }

  getProductWithStock(id: string, sucursalId?: string) {
    const product = this.findById(id);
    const stockEntries = this.productsRepo.getStock(product.id, sucursalId);

    const stockPorSucursal = stockEntries.map((stk: StockBranchEntity) => {
      const branch = this.branchesRepo.findById(stk.sucursalId);
      return {
        sucursalId: stk.sucursalId,
        sucursalNombre: branch?.nombre || stk.sucursalId,
        departamento: branch?.departamento,
        cantidadDisponible: stk.cantidadDisponible,
        alertaBajoStock: stk.cantidadDisponible <= stk.cantidadMinimaAlerta,
      };
    });

    const stockTotalBolivia = stockEntries.reduce(
      (sum: number, s: StockBranchEntity) => sum + s.cantidadDisponible,
      0,
    );

    return {
      ...product,
      stockTotalBolivia,
      stockPorSucursal,
    };
  }

  create(dto: CreateProductDto): ProductEntity {
    const existing = this.productsRepo.findBySku(dto.codigoSku);
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

    return this.productsRepo.create(newProduct);
  }

  updateStock(productId: string, dto: UpdateStockDto): StockBranchEntity {
    this.findById(productId);
    return this.productsRepo.updateStock(
      dto.sucursalId,
      productId,
      dto.cantidadDisponible,
    );
  }
}
