import { DepartamentoBolivia } from '../../../common/constants/bolivia-regions.constant.js';

export interface InvoiceEntity {
  id: string;
  numeroFactura: number;
  cuf: string;
  cufd: string;
  nitEmisor: string;
  razonSocialEmisor: string;
  sucursalNombre: string;
  departamento: DepartamentoBolivia;
  nitCiCliente: string;
  razonSocialCliente: string;
  fechaEmision: string;
  montoTotalBs: number;
  montoSujetoCreditoFiscalBs: number;
  qrSiatDataUri: string;
  leyendaFiscal: string;
  pedidoId: string;
}
