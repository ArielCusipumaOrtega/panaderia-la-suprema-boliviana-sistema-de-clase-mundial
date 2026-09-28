import { ProductEntity, StockBranchEntity } from './product.entity.js';
import { ProductCategory } from '../../../common/enums/product-category.enum.js';

export interface ProductFilterQuery {
  categoria?: ProductCategory;
  aptoEnvioNacional?: boolean;
  destacado?: boolean;
  busqueda?: string;
}

export abstract class ProductsRepository {
  abstract findAll(query?: ProductFilterQuery): ProductEntity[];
  abstract findById(id: string): ProductEntity | null;
  abstract findBySku(sku: string): ProductEntity | null;
  abstract create(product: ProductEntity): ProductEntity;
  abstract update(id: string, updates: Partial<ProductEntity>): ProductEntity;
  abstract getStock(
    productId: string,
    sucursalId?: string,
  ): StockBranchEntity[];
  abstract updateStock(
    sucursalId: string,
    productId: string,
    nuevaCantidad: number,
  ): StockBranchEntity;
  abstract decrementStock(
    sucursalId: string,
    productId: string,
    cantidad: number,
  ): StockBranchEntity;
}
