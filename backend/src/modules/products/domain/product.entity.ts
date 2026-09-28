import {
  ProductCategory,
  BakingShift,
} from '../../../common/enums/product-category.enum.js';

export interface ProductEntity {
  id: string;
  codigoSku: string;
  nombre: string;
  descripcion: string;
  categoria: ProductCategory;
  precioBs: number;
  unidadMedida: 'unidad' | 'docena' | 'kilo' | 'canasta' | 'porción';
  tiempoVidaUtilHoras: number;
  aptoEnvioNacional: boolean;
  horarioRecomendado: BakingShift;
  ingredientesPrincipales: string[];
  imagenUrl: string;
  destacado: boolean;
  activo: boolean;
}

export interface StockBranchEntity {
  id: string;
  productoId: string;
  sucursalId: string;
  cantidadDisponible: number;
  cantidadMinimaAlerta: number;
  ultimaActualizacion: string;
}
