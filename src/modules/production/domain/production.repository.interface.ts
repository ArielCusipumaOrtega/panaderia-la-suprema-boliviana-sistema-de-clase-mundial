import {
  ProductionBatchEntity,
  RawMaterialEntity,
} from './production.entity.js';
import { BakingShift } from '../../../common/enums/product-category.enum.js';

export interface BatchFilterQuery {
  sucursalId?: string;
  productoId?: string;
  turno?: BakingShift;
}

export abstract class ProductionRepository {
  abstract findAllBatches(query?: BatchFilterQuery): ProductionBatchEntity[];
  abstract findBatchById(id: string): ProductionBatchEntity | null;
  abstract createBatch(batch: ProductionBatchEntity): ProductionBatchEntity;
  abstract updateBatch(
    id: string,
    updates: Partial<ProductionBatchEntity>,
  ): ProductionBatchEntity;
  abstract findAllRawMaterials(sucursalId?: string): RawMaterialEntity[];
  abstract findRawMaterialById(id: string): RawMaterialEntity | null;
  abstract updateRawMaterialStock(
    id: string,
    nuevoStock: number,
  ): RawMaterialEntity;
}
