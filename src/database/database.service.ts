import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '../common/enums/role.enum.js';
import { ProductCategory, BakingShift } from '../common/enums/product-category.enum.js';
import { OrderStatus, DeliveryType } from '../common/enums/order-status.enum.js';
import { PaymentMethod, PaymentStatus } from '../common/enums/payment-method.enum.js';
import { DepartamentoBolivia } from '../common/constants/bolivia-regions.constant.js';

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
  capacidadProduccionDiaria: number; // unidades de pan al día
  activa: boolean;
}

export interface ProductEntity {
  id: string;
  codigoSku: string;
  nombre: string;
  descripcion: string;
  categoria: ProductCategory;
  precioBs: number;
  unidadMedida: 'unidad' | 'docena' | 'kilo' | 'canasta' | 'porción';
  tiempoVidaUtilHoras: number;
  aptoEnvioNacional: boolean; // si resiste viaje interdepartamental o es solo consumo local caliente
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

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly dbFilePath = path.join(process.cwd(), 'data', 'sistema-panaderia-db.json');

  public users: UserEntity[] = [];
  public branches: BranchEntity[] = [];
  public products: ProductEntity[] = [];
  public stock: StockBranchEntity[] = [];
  public rawMaterials: RawMaterialEntity[] = [];
  public productionBatches: ProductionBatchEntity[] = [];
  public orders: OrderEntity[] = [];
  public invoices: InvoiceEntity[] = [];

  async onModuleInit() {
    this.ensureDataDirectory();
    if (fs.existsSync(this.dbFilePath)) {
      try {
        const raw = fs.readFileSync(this.dbFilePath, 'utf8');
        const data = JSON.parse(raw);
        this.users = data.users || [];
        this.branches = data.branches || [];
        this.products = data.products || [];
        this.stock = data.stock || [];
        this.rawMaterials = data.rawMaterials || [];
        this.productionBatches = data.productionBatches || [];
        this.orders = data.orders || [];
        this.invoices = data.invoices || [];
        this.logger.log(`Base de datos cargada exitosamente desde ${this.dbFilePath}`);
      } catch (err) {
        this.logger.error('Error al parsear base de datos JSON existente. Se inicializarán datos semilla.', err);
        await this.seedInitialData();
      }
    } else {
      await this.seedInitialData();
    }
  }

  private ensureDataDirectory() {
    const dir = path.dirname(this.dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  public save() {
    try {
      this.ensureDataDirectory();
      const payload = {
        users: this.users,
        branches: this.branches,
        products: this.products,
        stock: this.stock,
        rawMaterials: this.rawMaterials,
        productionBatches: this.productionBatches,
        orders: this.orders,
        invoices: this.invoices,
        lastPersistedAt: new Date().toISOString(),
      };
      fs.writeFileSync(this.dbFilePath, JSON.stringify(payload, null, 2), 'utf8');
    } catch (error) {
      this.logger.error('Error al guardar datos en disco', error);
    }
  }

  private async seedInitialData() {
    this.logger.log('Inicializando semillas de Panadería Boliviana de Clase Mundial...');

    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('Admin123!', salt);
    const panaderoPass = await bcrypt.hash('Panadero123!', salt);
    const clientePass = await bcrypt.hash('Cliente123!', salt);

    // 1. SUCURSALES (Multi-departamental en toda Bolivia)
    this.branches = [
      {
        id: 'suc-scz-01',
        codigo: 'SCZ-01',
        nombre: 'Sucursal Equipetrol (Casa Matriz)',
        departamento: DepartamentoBolivia.SANTA_CRUZ,
        ciudad: 'Santa Cruz de la Sierra',
        direccion: 'Av. San Martín esq. Calle 7 Oeste, Equipetrol',
        telefono: '+591 3 345-6789',
        horarioAtencion: 'Lunes a Domingo 06:00 - 22:00',
        esMatriz: true,
        capacidadProduccionDiaria: 8000,
        activa: true,
      },
      {
        id: 'suc-lpz-01',
        codigo: 'LPZ-01',
        nombre: 'Sucursal Sopocachi Gourmet',
        departamento: DepartamentoBolivia.LA_PAZ,
        ciudad: 'La Paz',
        direccion: 'Av. 20 de Octubre #1820 esq. Aspiazu',
        telefono: '+591 2 243-1234',
        horarioAtencion: 'Lunes a Sábado 06:00 - 21:30, Domingo 06:30 - 14:00',
        esMatriz: false,
        capacidadProduccionDiaria: 6500,
        activa: true,
      },
      {
        id: 'suc-lpz-02',
        codigo: 'LPZ-02',
        nombre: 'Sucursal Calacoto Zona Sur',
        departamento: DepartamentoBolivia.LA_PAZ,
        ciudad: 'La Paz',
        direccion: 'Calle 15 de Calacoto #800, Torre Empresarial',
        telefono: '+591 2 279-1122',
        horarioAtencion: 'Lunes a Domingo 06:30 - 21:00',
        esMatriz: false,
        capacidadProduccionDiaria: 4500,
        activa: true,
      },
      {
        id: 'suc-cbb-01',
        codigo: 'CBB-01',
        nombre: 'Sucursal Cala Cala Tradición',
        departamento: DepartamentoBolivia.COCHABAMBA,
        ciudad: 'Cochabamba',
        direccion: 'Av. Libertador Bolívar #520, Zona Cala Cala',
        telefono: '+591 4 429-9887',
        horarioAtencion: 'Lunes a Domingo 06:00 - 21:30',
        esMatriz: false,
        capacidadProduccionDiaria: 5000,
        activa: true,
      },
      {
        id: 'suc-chq-01',
        codigo: 'CHQ-01',
        nombre: 'Sucursal Sucre Ciudad Blanca',
        departamento: DepartamentoBolivia.CHUQUISACA,
        ciudad: 'Sucre',
        direccion: 'Calle Calvo #110 a media cuadra de Plaza 25 de Mayo',
        telefono: '+591 4 645-1234',
        horarioAtencion: 'Lunes a Domingo 06:30 - 21:00',
        esMatriz: false,
        capacidadProduccionDiaria: 3500,
        activa: true,
      },
      {
        id: 'suc-tja-01',
        codigo: 'TJA-01',
        nombre: 'Sucursal Tarija El Tejar',
        departamento: DepartamentoBolivia.TARIJA,
        ciudad: 'Tarija',
        direccion: 'Calle Colón #340, Barrio El Molino',
        telefono: '+591 4 664-1234',
        horarioAtencion: 'Lunes a Sábado 06:30 - 21:00',
        esMatriz: false,
        capacidadProduccionDiaria: 3000,
        activa: true,
      },
      {
        id: 'suc-oru-01',
        codigo: 'ORU-01',
        nombre: 'Sucursal Oruro Pagador',
        departamento: DepartamentoBolivia.ORURO,
        ciudad: 'Oruro',
        direccion: 'Calle Bolívar #670 esq. 6 de Octubre',
        telefono: '+591 2 525-1234',
        horarioAtencion: 'Lunes a Sábado 06:00 - 20:30',
        esMatriz: false,
        capacidadProduccionDiaria: 3000,
        activa: true,
      },
      {
        id: 'suc-pot-01',
        codigo: 'POT-01',
        nombre: 'Sucursal Potosí Imperial',
        departamento: DepartamentoBolivia.POTOSI,
        ciudad: 'Potosí',
        direccion: 'Calle Quijarro #85, Centro Histórico',
        telefono: '+591 2 622-1234',
        horarioAtencion: 'Lunes a Domingo 06:30 - 20:00',
        esMatriz: false,
        capacidadProduccionDiaria: 2500,
        activa: true,
      },
      {
        id: 'suc-ben-01',
        codigo: 'BEN-01',
        nombre: 'Sucursal Trinidad Moxos',
        departamento: DepartamentoBolivia.BENI,
        ciudad: 'Trinidad',
        direccion: 'Av. 6 de Agosto #210',
        telefono: '+591 3 462-1234',
        horarioAtencion: 'Lunes a Domingo 06:00 - 21:00',
        esMatriz: false,
        capacidadProduccionDiaria: 2500,
        activa: true,
      },
      {
        id: 'suc-pan-01',
        codigo: 'PAN-01',
        nombre: 'Sucursal Cobija Amazonía',
        departamento: DepartamentoBolivia.PANDO,
        ciudad: 'Cobija',
        direccion: 'Av. 9 de Febrero #300',
        telefono: '+591 3 842-1234',
        horarioAtencion: 'Lunes a Domingo 06:30 - 20:30',
        esMatriz: false,
        capacidadProduccionDiaria: 2000,
        activa: true,
      },
    ];

    // 2. USUARIOS CON ROLES DE CLASE MUNDIAL
    this.users = [
      {
        id: 'usr-admin-01',
        email: 'admin@panaderia.bo',
        passwordHash: adminPass,
        nombreCompleto: 'Lic. Gonzalo Céspedes (Director General)',
        telefono: '+591 77012345',
        ciNit: '4876211-1K',
        departamento: DepartamentoBolivia.SANTA_CRUZ,
        ciudad: 'Santa Cruz de la Sierra',
        direccion: 'Condominio La Riviera, Equipetrol',
        role: UserRole.ADMIN,
        sucursalId: 'suc-scz-01',
        activo: true,
        creadoEn: new Date().toISOString(),
      },
      {
        id: 'usr-panadero-01',
        email: 'panadero@panaderia.bo',
        passwordHash: panaderoPass,
        nombreCompleto: 'Maestro Don Saturnino Mamani',
        telefono: '+591 71598765',
        ciNit: '3498112-LP',
        departamento: DepartamentoBolivia.LA_PAZ,
        ciudad: 'La Paz',
        direccion: 'Zona Miraflores Calle Puerto Rico #34',
        role: UserRole.MAESTRO_PANADERO,
        sucursalId: 'suc-lpz-01',
        activo: true,
        creadoEn: new Date().toISOString(),
      },
      {
        id: 'usr-cajero-01',
        email: 'cajero@panaderia.bo',
        passwordHash: adminPass,
        nombreCompleto: 'Valeria Justiniano Suárez',
        telefono: '+591 76044321',
        ciNit: '8876123-SC',
        departamento: DepartamentoBolivia.SANTA_CRUZ,
        ciudad: 'Santa Cruz de la Sierra',
        direccion: 'Barrio Sirari Calle 2',
        role: UserRole.CAJERO,
        sucursalId: 'suc-scz-01',
        activo: true,
        creadoEn: new Date().toISOString(),
      },
      {
        id: 'usr-cliente-01',
        email: 'cliente@gmail.com',
        passwordHash: clientePass,
        nombreCompleto: 'Andrea Villarroel Rojas',
        telefono: '+591 70765432',
        ciNit: '5543210-CB',
        departamento: DepartamentoBolivia.COCHABAMBA,
        ciudad: 'Cochabamba',
        direccion: 'Av. América Este #780',
        role: UserRole.CLIENTE,
        activo: true,
        creadoEn: new Date().toISOString(),
      },
    ];

    // 3. PRODUCTOS DE CLASE MUNDIAL (Bolivia & Artesanales)
    this.products = [
      {
        id: 'prod-001',
        codigoSku: 'PAN-MARR-01',
        nombre: 'Marraqueta Paceña Tradicional (Crocante de Piso)',
        descripcion: 'El pan insignia de Bolivia. Corteza ultracrocante y miga tierna cocida a la piedra con inyección de vapor. Receta de tradición paceña.',
        categoria: ProductCategory.PANES_TRADICIONALES,
        precioBs: 0.80,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 16,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.MADRUGADA,
        ingredientesPrincipales: ['Harina de Trigo 000', 'Agua de vertiente', 'Levadura viva', 'Sal marina', 'Poco azúcar'],
        imagenUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-002',
        codigoSku: 'PAN-SARN-02',
        nombre: 'Sarnita Caliente con Queso Criollo',
        descripcion: 'Pan redondo suave con costra dorada de queso criollo derretido y una pizca de manteca en la superficie.',
        categoria: ProductCategory.PANES_TRADICIONALES,
        precioBs: 1.20,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 24,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.MADRUGADA,
        ingredientesPrincipales: ['Harina de Trigo', 'Queso Criollo del Valle', 'Manteca vegetal', 'Azúcar', 'Huevo'],
        imagenUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-003',
        codigoSku: 'PAN-CUNA-03',
        nombre: 'Cuñapé Cruceño Horneado Especial',
        descripcion: 'Auténtico cuñapé con doble ración de queso chaqueño y almidón de yuca seleccionado. Crocante por fuera y elástico por dentro.',
        categoria: ProductCategory.EMPANADAS_MASAS_CALIENTES,
        precioBs: 3.50,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 18,
        aptoEnvioNacional: true,
        horarioRecomendado: BakingShift.TARDE,
        ingredientesPrincipales: ['Almidón de Yuca Beniana', 'Queso Chaqueño Maduro', 'Leche entera', 'Huevo de campo', 'Mantequilla'],
        imagenUrl: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-004',
        codigoSku: 'PAN-ARAN-04',
        nombre: 'Pan de Arani Cochabambino con Canela y Queso',
        descripcion: 'La legendaria hogaza del Valle Alto de Cochabamba. Miga dulce aromática con canela de Ceilán y costra de queso criollo.',
        categoria: ProductCategory.PANES_TRADICIONALES,
        precioBs: 15.00,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 72,
        aptoEnvioNacional: true,
        horarioRecomendado: BakingShift.MADRUGADA,
        ingredientesPrincipales: ['Harina de Trigo con Salvado', 'Canela molida', 'Queso de Punata', 'Chancaca', 'Manteca'],
        imagenUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-005',
        codigoSku: 'PAN-LAJA-05',
        nombre: 'Pan de Laja Tradicional Altiplánico',
        descripcion: 'Pan plano tostado en hornos de barro centenarios de Laja. Larga conservación natural y textura única para untar.',
        categoria: ProductCategory.PANES_TRADICIONALES,
        precioBs: 1.50,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 96,
        aptoEnvioNacional: true,
        horarioRecomendado: BakingShift.MADRUGADA,
        ingredientesPrincipales: ['Harina de trigo entera', 'Agua de vertiente', 'Grasa seleccionada', 'Sal y azúcar morena'],
        imagenUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=600&q=80',
        destacado: false,
        activo: true,
      },
      {
        id: 'prod-006',
        codigoSku: 'PAN-MADR-06',
        nombre: 'Campesino de Masa Madre Silvestre (24h Fermentación)',
        descripcion: 'Pan rústico de alta hidratación fermentado lentamente con masa madre propia de 5 años. Corteza caramelizada y alveolado amplio.',
        categoria: ProductCategory.MASA_MADRE_ARTESANAL,
        precioBs: 22.00,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 72,
        aptoEnvioNacional: true,
        horarioRecomendado: BakingShift.NOCTURNO,
        ingredientesPrincipales: ['Harina de fuerza', 'Harina de centeno', 'Masa madre viva', 'Agua filtrada', 'Sal marina de Uyuni'],
        imagenUrl: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-007',
        codigoSku: 'PAN-BAGU-07',
        nombre: 'Baguette Francesa Clásica',
        descripcion: 'Elaborada según la tradición parisina con masa madre y cocción sobre piedra refractaria. Corteza dorada y crujiente.',
        categoria: ProductCategory.MASA_MADRE_ARTESANAL,
        precioBs: 8.50,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 20,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.MADRUGADA,
        ingredientesPrincipales: ['Harina T65', 'Levadura fresca', 'Agua pura', 'Sal marina'],
        imagenUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        destacado: false,
        activo: true,
      },
      {
        id: 'prod-008',
        codigoSku: 'PAN-QUIN-08',
        nombre: 'Hogaza de Quinua Real de Uyuni & Chía Chiquitana',
        descripcion: 'Superalimento andino-oriental. Pan 100% nutritivo con harina de quinua real tostada, semillas de chía y semillas de girasol.',
        categoria: ProductCategory.LINEA_SALUDABLE_ANDINA,
        precioBs: 19.50,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 72,
        aptoEnvioNacional: true,
        horarioRecomendado: BakingShift.NOCTURNO,
        ingredientesPrincipales: ['Quinua Real Orgánica', 'Chía Chiquitana', 'Harina Integral 100%', 'Miel del Chaco', 'Masa Madre'],
        imagenUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-009',
        codigoSku: 'PAS-SELV-09',
        nombre: 'Torta Selva Negra con Macerado de Singani San Pedro',
        descripcion: 'Bizcocho húmedo de cacao orgánico boliviano bañado en reducción de singani de altura, cerezas ácidas y crema chantilly fresca.',
        categoria: ProductCategory.PASTELERIA_REPOSTERIA,
        precioBs: 185.00,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 48,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.NOCTURNO,
        ingredientesPrincipales: ['Cacao del Alto Beni', 'Singani boliviano San Pedro', 'Crema de leche fresca', 'Cerezas', 'Chocolate amargo 70%'],
        imagenUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-010',
        codigoSku: 'PAS-TRES-10',
        nombre: 'Torta Tres Leches Suprema al Toque de Vainilla',
        descripcion: 'Clásica torta empapada en tres variedades de leche con toque de canela cochabambina y merengue tostado.',
        categoria: ProductCategory.PASTELERIA_REPOSTERIA,
        precioBs: 145.00,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 48,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.NOCTURNO,
        ingredientesPrincipales: ['Leche evaporada', 'Leche condensada', 'Crema espesa', 'Bizcochuelo esponjoso', 'Canela molida'],
        imagenUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80',
        destacado: false,
        activo: true,
      },
      {
        id: 'prod-011',
        codigoSku: 'PAS-EMPB-11',
        nombre: 'Empanada Blasonada de Queso y Ají Dulce',
        descripcion: 'Masa hojaldrada suave rellena de abundante queso criollo fundente con toque de cebolla caramelizada y ají amarillo dulce.',
        categoria: ProductCategory.EMPANADAS_MASAS_CALIENTES,
        precioBs: 4.50,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 24,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.MADRUGADA,
        ingredientesPrincipales: ['Harina de trigo', 'Mantequilla artesanal', 'Queso Chaqueño', 'Ají dulce', 'Huevo'],
        imagenUrl: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
        destacado: false,
        activo: true,
      },
      {
        id: 'prod-012',
        codigoSku: 'CAN-DESA-12',
        nombre: 'Canasta Familiar "Desayuno Paceño Imperial"',
        descripcion: 'Incluye: 12 Marraquetas crocantes, 6 Sarnitas calientes, 250g de Queso Criollo artesanal, 1 Frasco de Miel de los Yungas y 1 Pan de Arani.',
        categoria: ProductCategory.COMBOS_CANASTAS,
        precioBs: 65.00,
        unidadMedida: 'canasta',
        tiempoVidaUtilHoras: 24,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.MADRUGADA,
        ingredientesPrincipales: ['Panes surtidos', 'Queso fresco', 'Miel pura de abeja', 'Empaque ecológico'],
        imagenUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-013',
        codigoSku: 'CAN-CAMB-13',
        nombre: 'Canasta Gourmet "Lonche Camba Tradicional"',
        descripcion: 'Incluye: 10 Cuñapés crujientes recién horneados, 4 Masacos de plátano con queso, 6 Rollitos de queso y té de hojas aromatizadas.',
        categoria: ProductCategory.COMBOS_CANASTAS,
        precioBs: 60.00,
        unidadMedida: 'canasta',
        tiempoVidaUtilHoras: 24,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.TARDE,
        ingredientesPrincipales: ['Cuñapés', 'Masaco de Plátano y Yuca', 'Queso Chaqueño', 'Empaque rústico'],
        imagenUrl: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-014',
        codigoSku: 'CAN-NACI-14',
        nombre: 'Caja Regalo "Sabores de Toda Bolivia" (Apta Envíos a todo el País)',
        descripcion: 'Especial para envíos interdepartamentales: 2 Panes de Arani envasados con atmósfera protegida, Galletas de Canela y Singani, Rosquetes de Punata, Cuñapés deshidratados crocantes y Pan de Laja tradicional.',
        categoria: ProductCategory.COMBOS_CANASTAS,
        precioBs: 110.00,
        unidadMedida: 'canasta',
        tiempoVidaUtilHoras: 240,
        aptoEnvioNacional: true,
        horarioRecomendado: BakingShift.NOCTURNO,
        ingredientesPrincipales: ['Pan de Arani', 'Galletas de Canela', 'Rosquetes', 'Cuñapés crocantes', 'Caja de madera premium'],
        imagenUrl: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
    ];

    // 4. STOCK INICIAL EN CADA SUCURSAL
    this.stock = [];
    for (const b of this.branches) {
      for (const p of this.products) {
        this.stock.push({
          id: `stk-${b.id}-${p.id}`,
          productoId: p.id,
          sucursalId: b.id,
          cantidadDisponible: Math.floor(Math.random() * 80) + 40,
          cantidadMinimaAlerta: 15,
          ultimaActualizacion: new Date().toISOString(),
        });
      }
    }

    // 5. MATERIA PRIMA (Harina, Levadura, etc.)
    this.rawMaterials = [
      {
        id: 'raw-01',
        nombre: 'Harina de Trigo Especial 000 (Industria Nacional)',
        unidad: 'kg',
        stockActual: 1500,
        stockMinimoAlerta: 300,
        sucursalId: 'suc-scz-01',
        costoUnitarioBs: 6.50,
      },
      {
        id: 'raw-02',
        nombre: 'Almidón de Yuca Beniano Seleccionado',
        unidad: 'kg',
        stockActual: 600,
        stockMinimoAlerta: 100,
        sucursalId: 'suc-scz-01',
        costoUnitarioBs: 12.00,
      },
      {
        id: 'raw-03',
        nombre: 'Queso Chaqueño Maduro para Cuñapé',
        unidad: 'kg',
        stockActual: 450,
        stockMinimoAlerta: 80,
        sucursalId: 'suc-scz-01',
        costoUnitarioBs: 28.00,
      },
      {
        id: 'raw-04',
        nombre: 'Levadura Fresca Activa',
        unidad: 'kg',
        stockActual: 120,
        stockMinimoAlerta: 25,
        sucursalId: 'suc-scz-01',
        costoUnitarioBs: 18.00,
      },
      {
        id: 'raw-05',
        nombre: 'Quinua Real de Uyuni Grano Tostado',
        unidad: 'kg',
        stockActual: 300,
        stockMinimoAlerta: 50,
        sucursalId: 'suc-scz-01',
        costoUnitarioBs: 22.00,
      },
      {
        id: 'raw-06',
        nombre: 'Manteca Vegetal de Palma Purificada',
        unidad: 'kg',
        stockActual: 400,
        stockMinimoAlerta: 60,
        sucursalId: 'suc-scz-01',
        costoUnitarioBs: 14.50,
      },
    ];

    // 6. LOTES DE PRODUCCIÓN RECIENTES (Turno mañana y tarde)
    this.productionBatches = [
      {
        id: 'batch-001',
        codigoLote: 'LOT-20260926-M01',
        sucursalId: 'suc-lpz-01',
        productoId: 'prod-001',
        turno: BakingShift.MADRUGADA,
        cantidadPlaneada: 1200,
        cantidadObtenida: 1185,
        mermaUnidades: 15,
        motivoMerma: 'Cocción un poco tostada en borde de piso',
        temperaturaHornoC: 240,
        maestroPanadero: 'Don Saturnino Mamani',
        iniciadoEn: '2026-09-26T04:30:00.000Z',
        finalizadoEn: '2026-09-26T06:15:00.000Z',
        estado: 'FINALIZADO_CONFORME',
      },
      {
        id: 'batch-002',
        codigoLote: 'LOT-20260926-M02',
        sucursalId: 'suc-scz-01',
        productoId: 'prod-003',
        turno: BakingShift.TARDE,
        cantidadPlaneada: 800,
        cantidadObtenida: 795,
        mermaUnidades: 5,
        temperaturaHornoC: 210,
        maestroPanadero: 'Eustaquio Roca',
        iniciadoEn: '2026-09-26T15:00:00.000Z',
        finalizadoEn: '2026-09-26T16:20:00.000Z',
        estado: 'FINALIZADO_CONFORME',
      },
    ];

    // 7. PEDIDOS DE EJEMPLO
    this.orders = [
      {
        id: 'ord-1001',
        codigoPedido: 'BOL-PED-1001',
        clienteId: 'usr-cliente-01',
        clienteNombre: 'Andrea Villarroel Rojas',
        clienteTelefono: '+591 70765432',
        clienteCiNit: '5543210-CB',
        razonSocialFactura: 'Andrea Villarroel Rojas',
        departamentoDestino: DepartamentoBolivia.COCHABAMBA,
        ciudadDestino: 'Cochabamba',
        direccionEntrega: 'Av. América Este #780, Edif. Los Robles Dpto 4B',
        referenciaDireccion: 'Frente al Parque Fidel Anze',
        tipoEntrega: DeliveryType.EXPRESS_LOCAL,
        sucursalOrigenId: 'suc-cbb-01',
        items: [
          {
            productoId: 'prod-004',
            nombreProducto: 'Pan de Arani Cochabambino con Canela y Queso',
            cantidad: 2,
            precioUnitarioBs: 15.00,
            subtotalBs: 30.00,
          },
          {
            productoId: 'prod-003',
            nombreProducto: 'Cuñapé Cruceño Horneado Especial',
            cantidad: 10,
            precioUnitarioBs: 3.50,
            subtotalBs: 35.00,
          },
        ],
        subtotalBs: 65.00,
        costoEnvioBs: 10.00,
        descuentoBs: 0.00,
        totalBs: 75.00,
        metodoPago: PaymentMethod.QR_SIMPLE,
        estadoPago: PaymentStatus.PAGADO,
        estado: OrderStatus.EN_CAMINO,
        observaciones: 'Por favor entregar bien calientito los cuñapés.',
        facturaId: 'fac-1001',
        creadoEn: '2026-09-26T16:00:00.000Z',
        actualizadoEn: '2026-09-26T16:30:00.000Z',
      },
      {
        id: 'ord-1002',
        codigoPedido: 'BOL-PED-1002',
        clienteNombre: 'Roberto Torrico Baldivieso',
        clienteTelefono: '+591 72199887',
        clienteCiNit: '10293847012',
        razonSocialFactura: 'TORRICO INGENIERIA S.R.L.',
        departamentoDestino: DepartamentoBolivia.TARIJA,
        ciudadDestino: 'Tarija',
        direccionEntrega: 'Calle Sucre #440',
        tipoEntrega: DeliveryType.ENVIO_NACIONAL,
        sucursalOrigenId: 'suc-scz-01',
        items: [
          {
            productoId: 'prod-014',
            nombreProducto: 'Caja Regalo "Sabores de Toda Bolivia" (Apta Envíos a todo el País)',
            cantidad: 2,
            precioUnitarioBs: 110.00,
            subtotalBs: 220.00,
          },
        ],
        subtotalBs: 220.00,
        costoEnvioBs: 30.00,
        descuentoBs: 10.00,
        totalBs: 240.00,
        metodoPago: PaymentMethod.QR_SIMPLE,
        estadoPago: PaymentStatus.PAGADO,
        estado: OrderStatus.EMPACADO,
        observaciones: 'Despacho interdepartamental por Transporte San Roque Tarija.',
        facturaId: 'fac-1002',
        creadoEn: '2026-09-26T14:10:00.000Z',
        actualizadoEn: '2026-09-26T15:00:00.000Z',
      },
    ];

    // 8. FACTURAS SIAT COMPUTARIZADAS EN LÍNEA
    this.invoices = [
      {
        id: 'fac-1001',
        numeroFactura: 4890,
        cuf: '9A8B7C6D5E4F3A2B1C0D9E8F7A6B5C4D3E2F1A0B',
        cufd: 'CUFD-20260926-SCZ-001',
        nitEmisor: '3049182019',
        razonSocialEmisor: 'PANADERIA & PASTELERIA ARTESANAL BOLIVIA S.R.L.',
        sucursalNombre: 'Sucursal Cala Cala Tradición',
        departamento: DepartamentoBolivia.COCHABAMBA,
        nitCiCliente: '5543210-CB',
        razonSocialCliente: 'Andrea Villarroel Rojas',
        fechaEmision: '2026-09-26T16:05:00.000Z',
        montoTotalBs: 75.00,
        montoSujetoCreditoFiscalBs: 75.00,
        qrSiatDataUri: '',
        leyendaFiscal: 'Ley N° 453: Los servicios deben prestarse en condiciones de inocuidad, calidad y seguridad.',
        pedidoId: 'ord-1001',
      },
    ];

    this.save();
    this.logger.log('Semillas iniciales de panadería boliviana cargadas y persistidas con éxito.');
  }
}
