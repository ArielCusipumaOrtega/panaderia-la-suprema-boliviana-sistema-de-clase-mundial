export type DepartamentoBolivia =
  | 'La Paz'
  | 'Santa Cruz'
  | 'Cochabamba'
  | 'Chuquisaca'
  | 'Oruro'
  | 'Potosí'
  | 'Tarija'
  | 'Beni'
  | 'Pando';

export interface Product {
  id: string;
  codigoSku: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precioBs: number;
  unidadMedida: string;
  tiempoVidaUtilHoras: number;
  aptoEnvioNacional: boolean;
  horarioRecomendado: 'MADRUGADA' | 'TARDE' | 'NOCTURNO';
  ingredientesPrincipales: string[];
  imagenUrl: string;
  destacado: boolean;
  activo: boolean;
}

export interface Branch {
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

export interface CartItem {
  producto: Product;
  cantidad: number;
}

export interface User {
  id: string;
  email: string;
  nombreCompleto: string;
  role: 'ADMIN' | 'GERENTE_SUCURSAL' | 'MAESTRO_PANADERO' | 'CAJERO' | 'REPARTIDOR' | 'CLIENTE';
  ciNit?: string;
  telefono?: string;
  departamento?: string;
  ciudad?: string;
  direccion?: string;
  sucursalId?: string;
}

export interface ShippingQuote {
  departamentoDestino: string;
  ciudadDestino: string;
  tipoEntrega: 'EXPRESS_LOCAL' | 'PROGRAMADO' | 'DESPACHO_INTERDEPARTAMENTAL';
  costoEnvioBs: number;
  tiempoEstimado: string;
  despachoDesdeSucursal: string;
  advertenciaFrescura?: string;
}

export interface OrderItem {
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitarioBs: number;
  subtotalBs: number;
}

export interface Order {
  id: string;
  codigoPedido: string;
  clienteNombre: string;
  clienteTelefono: string;
  clienteCiNit: string;
  razonSocialFactura?: string;
  departamentoDestino: DepartamentoBolivia;
  ciudadDestino: string;
  direccionEntrega: string;
  referenciaDireccion?: string;
  tipoEntrega: 'EXPRESS_LOCAL' | 'PROGRAMADO' | 'DESPACHO_INTERDEPARTAMENTAL';
  sucursalOrigenId: string;
  items: OrderItem[];
  subtotalBs: number;
  costoEnvioBs: number;
  totalBs: number;
  metodoPago: 'QR_SIMPLE' | 'TIGO_MONEY' | 'EFECTIVO_CONTRAENTREGA' | 'TARJETA';
  estadoPago: 'PENDIENTE' | 'PAGADO' | 'RECHAZADO';
  qrSimpleDataUri?: string;
  estado: 'PENDIENTE' | 'CONFIRMADO' | 'EN_HORNEADA' | 'EMPACADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  creadoEn: string;
  facturaId?: string;
}

export interface Invoice {
  id: string;
  numeroFactura: number;
  cuf: string;
  cufd: string;
  nitEmisor: string;
  razonSocialEmisor: string;
  sucursalNombre: string;
  departamento: string;
  nitCiCliente: string;
  razonSocialCliente: string;
  fechaEmision: string;
  montoTotalBs: number;
  montoSujetoCreditoFiscalBs: number;
  qrSiatDataUri: string;
  leyendaFiscal: string;
  pedidoId: string;
}

export interface DashboardMetrics {
  fechaReporte: string;
  moneda: string;
  totalVentasBs: number;
  totalPedidosRegistrados: number;
  totalSucursalesActivas: number;
  ventasPorDepartamento: Record<string, number>;
  ventasPorMetodoPago: Record<string, number>;
  topProductos: Array<{
    productoId: string;
    nombre: string;
    unidadesVendidas: number;
    totalRecaudadoBs: number;
  }>;
  produccion: {
    totalPiezasPlaneadas: number;
    totalPiezasObtenidas: number;
    totalMermas: number;
    porcentajeMerma: string;
    estadoEficiencia: string;
  };
  alertasStockCritico: any[];
}
