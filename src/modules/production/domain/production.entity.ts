import { BakingShift } from '../../../common/enums/product-category.enum.js';

export interface RawMaterialEntity {
  id: string;
  nombre: string;
  unidad: 'kg' | 'litros' | 'unidades';
  stockActual: number;
  stockMinimoAlerta: number;
  sucursalId: string;
  costoUnitarioBs: number;
}

export interface ProductionBatchEntity {
  id: string;
  codigoLote: string;
  sucursalId: string;
  productoId: string;
  turno: BakingShift;
  cantidadPlaneada: number;
  cantidadObtenida: number;
  mermaUnidades: number;
  motivoMerma?: string;
  temperaturaHornoC: number;
  maestroPanadero: string;
  iniciadoEn: string;
  finalizadoEn?: string;
  estado: 'PROGRAMADO' | 'EN_HORNEADA' | 'FINALIZADO_CONFORME' | 'OBSERVADO';
}
