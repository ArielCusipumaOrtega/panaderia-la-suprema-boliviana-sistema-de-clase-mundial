import { DepartamentoBolivia } from '../../../common/constants/bolivia-regions.constant.js';

export interface BranchEntity {
  id: string;
  codigo: string;
  nombre: string;
  departamento: DepartamentoBolivia;
  ciudad: string;
  direccion: string;
  telefono: string;
  horarioAtencion: string;
  esMatriz: boolean;
  capacidadProduccionDiaria: number;
  activa: boolean;
}
