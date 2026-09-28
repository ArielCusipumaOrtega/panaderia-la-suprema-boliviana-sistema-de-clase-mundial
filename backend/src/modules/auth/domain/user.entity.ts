import { UserRole } from '../../../common/enums/role.enum.js';
import { DepartamentoBolivia } from '../../../common/constants/bolivia-regions.constant.js';

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  nombreCompleto: string;
  telefono: string;
  ciNit: string;
  departamento: DepartamentoBolivia;
  ciudad: string;
  direccion: string;
  role: UserRole;
  sucursalId?: string;
  activo: boolean;
  creadoEn: string;
}
