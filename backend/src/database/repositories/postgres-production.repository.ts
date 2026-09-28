import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ProductionRepository,
  BatchFilterQuery,
} from '../../modules/production/domain/production.repository.interface.js';
import {
  ProductionBatchEntity,
  RawMaterialEntity,
} from '../../modules/production/domain/production.entity.js';
import { DatabaseService } from '../database.service.js';

@Injectable()
export class PostgresProductionRepository implements ProductionRepository {
  constructor(private readonly db: DatabaseService) {}

  findAllBatches(query?: BatchFilterQuery): ProductionBatchEntity[] {
    let list = this.db.productionBatches;

    if (query?.sucursalId) {
      list = list.filter((b) => b.sucursalId === query.sucursalId);
    }
    if (query?.productoId) {
      list = list.filter((b) => b.productoId === query.productoId);
    }
    if (query?.turno) {
      list = list.filter((b) => b.turno === query.turno);
    }

    return list;
  }

  findBatchById(id: string): ProductionBatchEntity | null {
    return (
      this.db.productionBatches.find(
        (b) => b.id === id || b.codigoLote === id,
      ) || null
    );
  }

  createBatch(batch: ProductionBatchEntity): ProductionBatchEntity {
    this.db.productionBatches.push(batch);
    this.db.save();
    return batch;
  }

  updateBatch(
    id: string,
    updates: Partial<ProductionBatchEntity>,
  ): ProductionBatchEntity {
    const idx = this.db.productionBatches.findIndex(
      (b) => b.id === id || b.codigoLote === id,
    );
    if (idx === -1) {
      throw new NotFoundException(`Lote '${id}' no encontrado`);
    }
    this.db.productionBatches[idx] = {
      ...this.db.productionBatches[idx],
      ...updates,
    };
    this.db.save();
    return this.db.productionBatches[idx];
  }

  findAllRawMaterials(sucursalId?: string): RawMaterialEntity[] {
    if (sucursalId) {
      return this.db.rawMaterials.filter((r) => r.sucursalId === sucursalId);
    }
    return this.db.rawMaterials;
  }

  findRawMaterialById(id: string): RawMaterialEntity | null {
    return this.db.rawMaterials.find((r) => r.id === id) || null;
  }

  updateRawMaterialStock(id: string, nuevoStock: number): RawMaterialEntity {
    const raw = this.findRawMaterialById(id);
    if (!raw) {
      throw new NotFoundException(`Insumo '${id}' no encontrado`);
    }
    raw.stockActual = Math.max(0, nuevoStock);
    this.db.save();
    return raw;
  }
}
