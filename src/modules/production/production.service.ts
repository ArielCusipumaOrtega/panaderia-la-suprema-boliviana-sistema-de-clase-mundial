import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ProductionRepository } from './domain/production.repository.interface.js';
import {
  ProductionBatchEntity,
  RawMaterialEntity,
} from './domain/production.entity.js';
import { ProductsRepository } from '../products/domain/products.repository.interface.js';
import { BranchesRepository } from '../branches/domain/branches.repository.interface.js';
import { CreateBatchDto, FinishBatchDto } from './dto/create-batch.dto.js';

@Injectable()
export class ProductionService {
  private readonly logger = new Logger(ProductionService.name);

  constructor(
    private readonly productionRepo: ProductionRepository,
    private readonly productsRepo: ProductsRepository,
    private readonly branchesRepo: BranchesRepository,
  ) {}

  findAll(sucursalId?: string) {
    const list = this.productionRepo.findAllBatches(
      sucursalId ? { sucursalId } : undefined,
    );
    return list.map((b) => {
      const prod = this.productsRepo.findById(b.productoId);
      const suc = this.branchesRepo.findById(b.sucursalId);
      return {
        ...b,
        productoNombre: prod?.nombre || b.productoId,
        sucursalNombre: suc?.nombre || b.sucursalId,
        departamento: suc?.departamento,
      };
    });
  }

  getRawMaterials(sucursalId?: string): RawMaterialEntity[] {
    return this.productionRepo.findAllRawMaterials(sucursalId);
  }

  createBatch(dto: CreateBatchDto): ProductionBatchEntity {
    const prod = this.productsRepo.findById(dto.productoId);
    if (!prod) {
      throw new NotFoundException(`Producto ${dto.productoId} no encontrado`);
    }

    const suc = this.branchesRepo.findById(dto.sucursalId);
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

    const created = this.productionRepo.createBatch(newBatch);

    this.logger.log(
      `Hornada iniciada: ${codigoLote} - ${dto.cantidadPlaneada} unidades de ${prod.nombre} en ${suc.nombre}`,
    );
    return created;
  }

  finishBatch(batchId: string, dto: FinishBatchDto): ProductionBatchEntity {
    const batch = this.productionRepo.findBatchById(batchId);
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

    const updates: Partial<ProductionBatchEntity> = {
      cantidadObtenida: dto.cantidadObtenida,
      mermaUnidades: dto.mermaUnidades,
      motivoMerma: dto.motivoMerma,
      finalizadoEn: new Date().toISOString(),
      estado:
        dto.mermaUnidades > batch.cantidadPlaneada * 0.1
          ? 'OBSERVADO'
          : 'FINALIZADO_CONFORME',
    };

    const updated = this.productionRepo.updateBatch(batchId, updates);

    // Aumentar el stock de producto terminado en la sucursal correspondiente
    const currentStock = this.productsRepo.getStock(
      batch.productoId,
      batch.sucursalId,
    );
    const existingQuantity =
      currentStock.length > 0 ? currentStock[0].cantidadDisponible : 0;
    this.productsRepo.updateStock(
      batch.sucursalId,
      batch.productoId,
      existingQuantity + dto.cantidadObtenida,
    );

    this.logger.log(
      `Hornada finalizada: ${updated.codigoLote} -> ${dto.cantidadObtenida} ingresadas al stock. Merma: ${dto.mermaUnidades}`,
    );

    return updated;
  }
}
