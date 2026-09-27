import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  DatabaseService,
  ProductionBatchEntity,
} from '../../database/database.service.js';
import { CreateBatchDto, FinishBatchDto } from './dto/create-batch.dto.js';

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);

  constructor(private readonly db: DatabaseService) {}

  findAll(sucursalId?: string) {
    let list = this.db.productionBatches;
    if (sucursalId) {
      list = list.filter((b) => b.sucursalId === sucursalId);
    }
    return list.map((b) => {
      const prod = this.db.products.find((p) => p.id === b.productoId);
      const suc = this.db.branches.find((s) => s.id === b.sucursalId);
      return {
        ...b,
        productoNombre: prod?.nombre || b.productoId,
        sucursalNombre: suc?.nombre || b.sucursalId,
        departamento: suc?.departamento,
      };
    });
  }

  getRawMaterials(sucursalId?: string) {
    if (sucursalId) {
      return this.db.rawMaterials.filter((m) => m.sucursalId === sucursalId);
    }
    return this.db.rawMaterials;
  }

  createBatch(dto: CreateBatchDto): ProductionBatchEntity {
    const prod = this.db.products.find((p) => p.id === dto.productoId);
    if (!prod) {
      throw new NotFoundException(`Producto ${dto.productoId} no encontrado`);
    }

    const suc = this.db.branches.find((s) => s.id === dto.sucursalId);
    if (!suc) {
      throw new NotFoundException(`Sucursal ${dto.sucursalId} no encontrada`);
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const codigoLote = `LOT-${dateStr}-${dto.turno.substring(0, 3)}-${uuidv4().substring(0, 4).toUpperCase()}`;

    const newBatch: ProductionBatchEntity = {
      id: `batch-${uuidv4().substring(0, 8)}`,
      codigoLote,
      sucursalId: dto.sucursalId,
      productoId: dto.productoId,
      turno: dto.turno,
      cantidadPlaneada: dto.cantidadPlaneada,
      cantidadObtenida: 0,
      mermaUnidades: 0,
      temperaturaHornoC: dto.temperaturaHornoC,
      maestroPanadero: dto.maestroPanadero,
      iniciadoEn: new Date().toISOString(),
      estado: 'EN_HORNEADA',
    };

    this.db.productionBatches.unshift(newBatch);
    this.db.save();

    this.logger.log(
      `Hornada iniciada: ${codigoLote} - ${dto.cantidadPlaneada} unidades de ${prod.nombre} en ${suc.nombre}`,
    );
    return newBatch;
  }

  finishBatch(batchId: string, dto: FinishBatchDto): ProductionBatchEntity {
    const batch = this.db.productionBatches.find((b) => b.id === batchId);
    if (!batch) {
      throw new NotFoundException(
        `Lote de producción ${batchId} no encontrado`,
      );
    }

    if (
      batch.estado === 'FINALIZADO_CONFORME' ||
      batch.estado === 'OBSERVADO'
    ) {
      throw new BadRequestException(
        'Este lote ya ha sido finalizado previamente',
      );
    }

    batch.cantidadObtenida = dto.cantidadObtenida;
    batch.mermaUnidades = dto.mermaUnidades;
    batch.motivoMerma = dto.motivoMerma;
    batch.finalizadoEn = new Date().toISOString();
    batch.estado =
      dto.mermaUnidades > batch.cantidadPlaneada * 0.1
        ? 'OBSERVADO'
        : 'FINALIZADO_CONFORME';

    // Aumentar el stock de producto terminado en la sucursal correspondiente
    let stockItem = this.db.stock.find(
      (s) =>
        s.productoId === batch.productoId && s.sucursalId === batch.sucursalId,
    );
    if (stockItem) {
      stockItem.cantidadDisponible += dto.cantidadObtenida;
      stockItem.ultimaActualizacion = new Date().toISOString();
    } else {
      this.db.stock.push({
        id: `stk-${batch.sucursalId}-${batch.productoId}`,
        productoId: batch.productoId,
        sucursalId: batch.sucursalId,
        cantidadDisponible: dto.cantidadObtenida,
        cantidadMinimaAlerta: 15,
        ultimaActualizacion: new Date().toISOString(),
      });
    }

    this.db.save();

    this.logger.log(
      `Hornada finalizada: ${batch.codigoLote} -> ${dto.cantidadObtenida} ingresadas al stock. Merma: ${dto.mermaUnidades}`,
    );

    return batch;
  }
}
