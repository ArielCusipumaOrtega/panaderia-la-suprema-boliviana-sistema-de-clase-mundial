import { DepartamentoBolivia } from '../../../common/constants/bolivia-regions.constant.js';
import {
  OrderStatus,
  DeliveryType,
} from '../../../common/enums/order-status.enum.js';
import {
  PaymentMethod,
  PaymentStatus,
} from '../../../common/enums/payment-method.enum.js';

export interface OrderItemEntity {
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitarioBs: number;
  subtotalBs: number;
}

export interface OrderEntity {
  id: string;
  codigoPedido: string;
  clienteId?: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteCiNit: string;
  razonSocialFactura: string;
  departamentoDestino: DepartamentoBolivia;
  ciudadDestino: string;
  direccionEntrega: string;
  referenciaDireccion?: string;
  tipoEntrega: DeliveryType;
  sucursalOrigenId: string;
  items: OrderItemEntity[];
  subtotalBs: number;
  costoEnvioBs: number;
  descuentoBs: number;
  totalBs: number;
  metodoPago: PaymentMethod;
  estadoPago: PaymentStatus;
  comprobantePagoUrl?: string;
  qrSimpleDataUri?: string;
  estado: OrderStatus;
  observaciones?: string;
  facturaId?: string;
  creadoEn: string;
  actualizadoEn: string;
}
