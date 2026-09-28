import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { UserRole } from '../common/enums/role.enum.js';
import {
  ProductCategory,
  BakingShift,
} from '../common/enums/product-category.enum.js';
import {
  OrderStatus,
  DeliveryType,
} from '../common/enums/order-status.enum.js';
import {
  PaymentMethod,
  PaymentStatus,
} from '../common/enums/payment-method.enum.js';
import { DepartamentoBolivia } from '../common/constants/bolivia-regions.constant.js';

export type { UserEntity } from '../modules/auth/domain/user.entity.js';
export type { BranchEntity } from '../modules/branches/domain/branch.entity.js';
export type {
  ProductEntity,
  StockBranchEntity,
} from '../modules/products/domain/product.entity.js';
export type {
  RawMaterialEntity,
  ProductionBatchEntity,
} from '../modules/production/domain/production.entity.js';
export type {
  OrderItemEntity,
  OrderEntity,
} from '../modules/orders/domain/order.entity.js';
export type { InvoiceEntity } from '../modules/billing/domain/invoice.entity.js';

import type { UserEntity } from '../modules/auth/domain/user.entity.js';
import type { BranchEntity } from '../modules/branches/domain/branch.entity.js';
import type {
  ProductEntity,
  StockBranchEntity,
} from '../modules/products/domain/product.entity.js';
import type {
  RawMaterialEntity,
  ProductionBatchEntity,
} from '../modules/production/domain/production.entity.js';
import type { OrderEntity } from '../modules/orders/domain/order.entity.js';
import type { InvoiceEntity } from '../modules/billing/domain/invoice.entity.js';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly dbFilePath = path.join(
    process.cwd(),
    'data',
    'sistema-panaderia-db.json',
  );

  public pool: Pool | null = null;
  public isPostgresConnected = false;

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

    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '5432', 10);
    const user = process.env.DB_USERNAME || 'usr_panaderia_la_suprema';
    const password = process.env.DB_PASSWORD || '123456';
    const database = process.env.DB_NAME || 'panaderia_la_suprema';

    try {
      this.pool = new Pool({
        host,
        port,
        user,
        password,
        database,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      // Validar conexión con un cliente
      const client = await this.pool.connect();
      client.release();
      this.isPostgresConnected = true;
      this.logger.log(
        `🐘 Conexión exitosa a PostgreSQL: ${user}@${host}:${port}/${database}`,
      );

      // Inicializar tablas y sincronizar datos
      await this.initializePostgresTables();
      await this.loadFromPostgresOrSeed();
    } catch (error) {
      this.isPostgresConnected = false;
      this.logger.warn(
        `⚠️ No se pudo conectar a PostgreSQL (${(error as Error).message}). Modo de contingencia con almacenamiento JSON local activado.`,
      );
      await this.loadFromJsonOrSeed();
    }
  }

  async onModuleDestroy() {
    this.isPostgresConnected = false;
    if (this.pool && !(this.pool as { ended?: boolean }).ended) {
      try {
        await this.pool.end();
        this.logger.log('Conexión con PostgreSQL cerrada limpiamente.');
      } catch (err) {
        this.logger.error('Error al cerrar el pool de PostgreSQL:', err);
      }
    }
  }

  private ensureDataDirectory() {
    const dir = path.dirname(this.dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // ============================================================================
  // TABLAS POSTGRESQL (DDL)
  // ============================================================================
  private async initializePostgresTables() {
    if (!this.pool || !this.isPostgresConnected) return;

    this.logger.log(
      'Verificando y creando esquemas de tablas en PostgreSQL...',
    );

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        nombre_completo VARCHAR(255) NOT NULL,
        telefono VARCHAR(50) NOT NULL,
        ci_nit VARCHAR(50) NOT NULL,
        departamento VARCHAR(50) NOT NULL,
        ciudad VARCHAR(100) NOT NULL,
        direccion TEXT NOT NULL,
        role VARCHAR(50) NOT NULL,
        sucursal_id VARCHAR(64),
        activo BOOLEAN DEFAULT true,
        creado_en VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS branches (
        id VARCHAR(64) PRIMARY KEY,
        codigo VARCHAR(50) NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        departamento VARCHAR(50) NOT NULL,
        ciudad VARCHAR(100) NOT NULL,
        direccion TEXT NOT NULL,
        telefono VARCHAR(50) NOT NULL,
        horario_atencion VARCHAR(150) NOT NULL,
        es_matriz BOOLEAN DEFAULT false,
        capacidad_produccion_diaria INTEGER NOT NULL,
        activa BOOLEAN DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        codigo_sku VARCHAR(50) NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        precio_bs NUMERIC(10, 2) NOT NULL,
        unidad_medida VARCHAR(50) NOT NULL,
        tiempo_vida_util_horas INTEGER NOT NULL,
        apto_envio_nacional BOOLEAN DEFAULT false,
        horario_recomendado VARCHAR(100) NOT NULL,
        ingredientes_principales JSONB NOT NULL DEFAULT '[]',
        imagen_url TEXT NOT NULL,
        destacado BOOLEAN DEFAULT false,
        activo BOOLEAN DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS stock (
        id VARCHAR(64) PRIMARY KEY,
        producto_id VARCHAR(64) NOT NULL,
        sucursal_id VARCHAR(64) NOT NULL,
        cantidad_disponible INTEGER NOT NULL,
        cantidad_minima_alerta INTEGER NOT NULL,
        ultima_actualizacion VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS raw_materials (
        id VARCHAR(64) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        unidad VARCHAR(50) NOT NULL,
        stock_actual NUMERIC(10, 2) NOT NULL,
        stock_minimo_alerta NUMERIC(10, 2) NOT NULL,
        sucursal_id VARCHAR(64) NOT NULL,
        costo_unitario_bs NUMERIC(10, 2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS production_batches (
        id VARCHAR(64) PRIMARY KEY,
        codigo_lote VARCHAR(50) NOT NULL,
        sucursal_id VARCHAR(64) NOT NULL,
        producto_id VARCHAR(64) NOT NULL,
        turno VARCHAR(50) NOT NULL,
        cantidad_planeada INTEGER NOT NULL,
        cantidad_obtenida INTEGER NOT NULL,
        merma_unidades INTEGER NOT NULL,
        motivo_merma TEXT,
        temperatura_horno_c INTEGER NOT NULL,
        maestro_panadero VARCHAR(255) NOT NULL,
        iniciado_en VARCHAR(50) NOT NULL,
        finalizado_en VARCHAR(50),
        estado VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        codigo_pedido VARCHAR(50) NOT NULL,
        cliente_id VARCHAR(64),
        cliente_nombre VARCHAR(255) NOT NULL,
        cliente_telefono VARCHAR(50) NOT NULL,
        cliente_ci_nit VARCHAR(50) NOT NULL,
        razon_social_factura VARCHAR(255) NOT NULL,
        departamento_destino VARCHAR(50) NOT NULL,
        ciudad_destino VARCHAR(100) NOT NULL,
        direccion_entrega TEXT NOT NULL,
        referencia_direccion TEXT,
        tipo_entrega VARCHAR(50) NOT NULL,
        sucursal_origen_id VARCHAR(64) NOT NULL,
        items JSONB NOT NULL DEFAULT '[]',
        subtotal_bs NUMERIC(10, 2) NOT NULL,
        costo_envio_bs NUMERIC(10, 2) NOT NULL,
        descuento_bs NUMERIC(10, 2) NOT NULL,
        total_bs NUMERIC(10, 2) NOT NULL,
        metodo_pago VARCHAR(50) NOT NULL,
        estado_pago VARCHAR(50) NOT NULL,
        comprobante_pago_url TEXT,
        qr_simple_data_uri TEXT,
        estado VARCHAR(50) NOT NULL,
        observaciones TEXT,
        factura_id VARCHAR(64),
        creado_en VARCHAR(50) NOT NULL,
        actualizado_en VARCHAR(50) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(64) PRIMARY KEY,
        numero_factura BIGINT NOT NULL,
        cuf VARCHAR(100) NOT NULL,
        cufd VARCHAR(100) NOT NULL,
        nit_emisor VARCHAR(50) NOT NULL,
        razon_social_emisor VARCHAR(255) NOT NULL,
        sucursal_nombre VARCHAR(255) NOT NULL,
        departamento VARCHAR(50) NOT NULL,
        nit_ci_cliente VARCHAR(50) NOT NULL,
        razon_social_cliente VARCHAR(255) NOT NULL,
        fecha_emision VARCHAR(50) NOT NULL,
        monto_total_bs NUMERIC(10, 2) NOT NULL,
        monto_sujeto_credito_fiscal_bs NUMERIC(10, 2) NOT NULL,
        qr_siat_data_uri TEXT,
        leyenda_fiscal TEXT NOT NULL,
        pedido_id VARCHAR(64) NOT NULL
      );
    `);

    this.logger.log(
      '✅ Esquemas de tablas en PostgreSQL verificados correctamente.',
    );
  }

  // ============================================================================
  // CARGA DE DATOS DESDE POSTGRESQL O SEMILLAS
  // ============================================================================
  private async loadFromPostgresOrSeed() {
    if (!this.pool || !this.isPostgresConnected) return;

    try {
      const userCountRes = await this.pool.query(
        'SELECT COUNT(*) AS total FROM users',
      );
      const totalUsers = parseInt(userCountRes.rows[0].total, 10);

      if (totalUsers === 0) {
        this.logger.log(
          'PostgreSQL no contiene datos previos. Sembrando datos iniciales de Panadería Boliviana...',
        );
        await this.seedInitialData();
        await this.saveToPostgres();
        this.saveJsonBackup();
        this.logger.log(
          '✅ Datos iniciales sembrados y persistidos en PostgreSQL exitosamente.',
        );
      } else {
        await this.loadAllFromPostgres();
        this.saveJsonBackup();
        this.logger.log(
          `✅ Datos cargados desde PostgreSQL: ${this.users.length} usuarios, ${this.branches.length} sucursales, ${this.products.length} productos, ${this.orders.length} pedidos.`,
        );
      }
    } catch (err) {
      this.logger.error('Error al cargar datos desde PostgreSQL:', err);
      await this.loadFromJsonOrSeed();
    }
  }

  private async loadAllFromPostgres() {
    if (!this.pool) return;

    // 1. Usuarios
    const uRes = await this.pool.query('SELECT * FROM users');
    this.users = uRes.rows.map((r) => ({
      id: r.id,
      email: r.email,
      passwordHash: r.password_hash,
      nombreCompleto: r.nombre_completo,
      telefono: r.telefono,
      ciNit: r.ci_nit,
      departamento: r.departamento as DepartamentoBolivia,
      ciudad: r.ciudad,
      direccion: r.direccion,
      role: r.role as UserRole,
      sucursalId: r.sucursal_id || undefined,
      activo: Boolean(r.activo),
      creadoEn: r.creado_en,
    }));

    // 2. Sucursales
    const bRes = await this.pool.query('SELECT * FROM branches');
    this.branches = bRes.rows.map((r) => ({
      id: r.id,
      codigo: r.codigo,
      nombre: r.nombre,
      departamento: r.departamento as DepartamentoBolivia,
      ciudad: r.ciudad,
      direccion: r.direccion,
      telefono: r.telefono,
      horarioAtencion: r.horario_atencion,
      esMatriz: Boolean(r.es_matriz),
      capacidadProduccionDiaria: parseInt(r.capacidad_produccion_diaria, 10),
      activa: Boolean(r.activa),
    }));

    // 3. Productos
    const pRes = await this.pool.query('SELECT * FROM products');
    this.products = pRes.rows.map((r) => ({
      id: r.id,
      codigoSku: r.codigo_sku,
      nombre: r.nombre,
      descripcion: r.descripcion,
      categoria: r.categoria as ProductCategory,
      precioBs: parseFloat(r.precio_bs),
      unidadMedida: r.unidad_medida,
      tiempoVidaUtilHoras: parseInt(r.tiempo_vida_util_horas, 10),
      aptoEnvioNacional: Boolean(r.apto_envio_nacional),
      horarioRecomendado: r.horario_recomendado as BakingShift,
      ingredientesPrincipales: Array.isArray(r.ingredientes_principales)
        ? r.ingredientes_principales
        : typeof r.ingredientes_principales === 'string'
          ? JSON.parse(r.ingredientes_principales)
          : [],
      imagenUrl: r.imagen_url,
      destacado: Boolean(r.destacado),
      activo: Boolean(r.activo),
    }));

    // 4. Stock
    const sRes = await this.pool.query('SELECT * FROM stock');
    this.stock = sRes.rows.map((r) => ({
      id: r.id,
      productoId: r.producto_id,
      sucursalId: r.sucursal_id,
      cantidadDisponible: parseInt(r.cantidad_disponible, 10),
      cantidadMinimaAlerta: parseInt(r.cantidad_minima_alerta, 10),
      ultimaActualizacion: r.ultima_actualizacion,
    }));

    // 5. Materia Prima
    const rawRes = await this.pool.query('SELECT * FROM raw_materials');
    this.rawMaterials = rawRes.rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      unidad: r.unidad,
      stockActual: parseFloat(r.stock_actual),
      stockMinimoAlerta: parseFloat(r.stock_minimo_alerta),
      sucursalId: r.sucursal_id,
      costoUnitarioBs: parseFloat(r.costo_unitario_bs),
    }));

    // 6. Lotes de Producción
    const batchRes = await this.pool.query('SELECT * FROM production_batches');
    this.productionBatches = batchRes.rows.map((r) => ({
      id: r.id,
      codigoLote: r.codigo_lote,
      sucursalId: r.sucursal_id,
      productoId: r.producto_id,
      turno: r.turno as BakingShift,
      cantidadPlaneada: parseInt(r.cantidad_planeada, 10),
      cantidadObtenida: parseInt(r.cantidad_obtenida, 10),
      mermaUnidades: parseInt(r.merma_unidades, 10),
      motivoMerma: r.motivo_merma || undefined,
      temperaturaHornoC: parseInt(r.temperatura_horno_c, 10),
      maestroPanadero: r.maestro_panadero,
      iniciadoEn: r.iniciado_en,
      finalizadoEn: r.finalizado_en || undefined,
      estado: r.estado,
    }));

    // 7. Pedidos
    const oRes = await this.pool.query('SELECT * FROM orders');
    this.orders = oRes.rows.map((r) => ({
      id: r.id,
      codigoPedido: r.codigo_pedido,
      clienteId: r.cliente_id || undefined,
      clienteNombre: r.cliente_nombre,
      clienteTelefono: r.cliente_telefono,
      clienteCiNit: r.cliente_ci_nit,
      razonSocialFactura: r.razon_social_factura,
      departamentoDestino: r.departamento_destino as DepartamentoBolivia,
      ciudadDestino: r.ciudad_destino,
      direccionEntrega: r.direccion_entrega,
      referenciaDireccion: r.referencia_direccion || undefined,
      tipoEntrega: r.tipo_entrega as DeliveryType,
      sucursalOrigenId: r.sucursal_origen_id,
      items: Array.isArray(r.items)
        ? r.items
        : typeof r.items === 'string'
          ? JSON.parse(r.items)
          : [],
      subtotalBs: parseFloat(r.subtotal_bs),
      costoEnvioBs: parseFloat(r.costo_envio_bs),
      descuentoBs: parseFloat(r.descuento_bs),
      totalBs: parseFloat(r.total_bs),
      metodoPago: r.metodo_pago as PaymentMethod,
      estadoPago: r.estado_pago as PaymentStatus,
      comprobantePagoUrl: r.comprobante_pago_url || undefined,
      qrSimpleDataUri: r.qr_simple_data_uri || undefined,
      estado: r.estado as OrderStatus,
      observaciones: r.observaciones || undefined,
      facturaId: r.factura_id || undefined,
      creadoEn: r.creado_en,
      actualizadoEn: r.actualizado_en,
    }));

    // 8. Facturas
    const invRes = await this.pool.query('SELECT * FROM invoices');
    this.invoices = invRes.rows.map((r) => ({
      id: r.id,
      numeroFactura: parseInt(r.numero_factura, 10),
      cuf: r.cuf,
      cufd: r.cufd,
      nitEmisor: r.nit_emisor,
      razonSocialEmisor: r.razon_social_emisor,
      sucursalNombre: r.sucursal_nombre,
      departamento: r.departamento as DepartamentoBolivia,
      nitCiCliente: r.nit_ci_cliente,
      razonSocialCliente: r.razon_social_cliente,
      fechaEmision: r.fecha_emision,
      montoTotalBs: parseFloat(r.monto_total_bs),
      montoSujetoCreditoFiscalBs: parseFloat(r.monto_sujeto_credito_fiscal_bs),
      qrSiatDataUri: r.qr_siat_data_uri || '',
      leyendaFiscal: r.leyenda_fiscal,
      pedidoId: r.pedido_id,
    }));
  }

  // ============================================================================
  // PERSISTENCIA EN POSTGRESQL (UPSERT)
  // ============================================================================
  public async saveToPostgres(): Promise<void> {
    if (
      !this.pool ||
      !this.isPostgresConnected ||
      (this.pool as { ended?: boolean }).ended
    )
      return;

    try {
      // 1. Users
      for (const u of this.users) {
        await this.pool.query(
          `INSERT INTO users (id, email, password_hash, nombre_completo, telefono, ci_nit, departamento, ciudad, direccion, role, sucursal_id, activo, creado_en)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO UPDATE SET
             email = EXCLUDED.email,
             password_hash = EXCLUDED.password_hash,
             nombre_completo = EXCLUDED.nombre_completo,
             telefono = EXCLUDED.telefono,
             ci_nit = EXCLUDED.ci_nit,
             departamento = EXCLUDED.departamento,
             ciudad = EXCLUDED.ciudad,
             direccion = EXCLUDED.direccion,
             role = EXCLUDED.role,
             sucursal_id = EXCLUDED.sucursal_id,
             activo = EXCLUDED.activo,
             creado_en = EXCLUDED.creado_en`,
          [
            u.id,
            u.email,
            u.passwordHash,
            u.nombreCompleto,
            u.telefono,
            u.ciNit,
            u.departamento,
            u.ciudad,
            u.direccion,
            u.role,
            u.sucursalId || null,
            u.activo,
            u.creadoEn,
          ],
        );
      }

      // 2. Branches
      for (const b of this.branches) {
        await this.pool.query(
          `INSERT INTO branches (id, codigo, nombre, departamento, ciudad, direccion, telefono, horario_atencion, es_matriz, capacidad_produccion_diaria, activa)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE SET
             codigo = EXCLUDED.codigo,
             nombre = EXCLUDED.nombre,
             departamento = EXCLUDED.departamento,
             ciudad = EXCLUDED.ciudad,
             direccion = EXCLUDED.direccion,
             telefono = EXCLUDED.telefono,
             horario_atencion = EXCLUDED.horario_atencion,
             es_matriz = EXCLUDED.es_matriz,
             capacidad_produccion_diaria = EXCLUDED.capacidad_produccion_diaria,
             activa = EXCLUDED.activa`,
          [
            b.id,
            b.codigo,
            b.nombre,
            b.departamento,
            b.ciudad,
            b.direccion,
            b.telefono,
            b.horarioAtencion,
            b.esMatriz,
            b.capacidadProduccionDiaria,
            b.activa,
          ],
        );
      }

      // 3. Products
      for (const p of this.products) {
        await this.pool.query(
          `INSERT INTO products (id, codigo_sku, nombre, descripcion, categoria, precio_bs, unidad_medida, tiempo_vida_util_horas, apto_envio_nacional, horario_recomendado, ingredientes_principales, imagen_url, destacado, activo)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO UPDATE SET
             codigo_sku = EXCLUDED.codigo_sku,
             nombre = EXCLUDED.nombre,
             descripcion = EXCLUDED.descripcion,
             categoria = EXCLUDED.categoria,
             precio_bs = EXCLUDED.precio_bs,
             unidad_medida = EXCLUDED.unidad_medida,
             tiempo_vida_util_horas = EXCLUDED.tiempo_vida_util_horas,
             apto_envio_nacional = EXCLUDED.apto_envio_nacional,
             horario_recomendado = EXCLUDED.horario_recomendado,
             ingredientes_principales = EXCLUDED.ingredientes_principales,
             imagen_url = EXCLUDED.imagen_url,
             destacado = EXCLUDED.destacado,
             activo = EXCLUDED.activo`,
          [
            p.id,
            p.codigoSku,
            p.nombre,
            p.descripcion,
            p.categoria,
            p.precioBs,
            p.unidadMedida,
            p.tiempoVidaUtilHoras,
            p.aptoEnvioNacional,
            p.horarioRecomendado,
            JSON.stringify(p.ingredientesPrincipales),
            p.imagenUrl,
            p.destacado,
            p.activo,
          ],
        );
      }

      // 4. Stock
      for (const s of this.stock) {
        await this.pool.query(
          `INSERT INTO stock (id, producto_id, sucursal_id, cantidad_disponible, cantidad_minima_alerta, ultima_actualizacion)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
             producto_id = EXCLUDED.producto_id,
             sucursal_id = EXCLUDED.sucursal_id,
             cantidad_disponible = EXCLUDED.cantidad_disponible,
             cantidad_minima_alerta = EXCLUDED.cantidad_minima_alerta,
             ultima_actualizacion = EXCLUDED.ultima_actualizacion`,
          [
            s.id,
            s.productoId,
            s.sucursalId,
            s.cantidadDisponible,
            s.cantidadMinimaAlerta,
            s.ultimaActualizacion,
          ],
        );
      }

      // 5. Raw Materials
      for (const r of this.rawMaterials) {
        await this.pool.query(
          `INSERT INTO raw_materials (id, nombre, unidad, stock_actual, stock_minimo_alerta, sucursal_id, costo_unitario_bs)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             nombre = EXCLUDED.nombre,
             unidad = EXCLUDED.unidad,
             stock_actual = EXCLUDED.stock_actual,
             stock_minimo_alerta = EXCLUDED.stock_minimo_alerta,
             sucursal_id = EXCLUDED.sucursal_id,
             costo_unitario_bs = EXCLUDED.costo_unitario_bs`,
          [
            r.id,
            r.nombre,
            r.unidad,
            r.stockActual,
            r.stockMinimoAlerta,
            r.sucursalId,
            r.costoUnitarioBs,
          ],
        );
      }

      // 6. Production Batches
      for (const pb of this.productionBatches) {
        await this.pool.query(
          `INSERT INTO production_batches (id, codigo_lote, sucursal_id, producto_id, turno, cantidad_planeada, cantidad_obtenida, merma_unidades, motivo_merma, temperatura_horno_c, maestro_panadero, iniciado_en, finalizado_en, estado)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO UPDATE SET
             codigo_lote = EXCLUDED.codigo_lote,
             sucursal_id = EXCLUDED.sucursal_id,
             producto_id = EXCLUDED.producto_id,
             turno = EXCLUDED.turno,
             cantidad_planeada = EXCLUDED.cantidad_planeada,
             cantidad_obtenida = EXCLUDED.cantidad_obtenida,
             merma_unidades = EXCLUDED.merma_unidades,
             motivo_merma = EXCLUDED.motivo_merma,
             temperatura_horno_c = EXCLUDED.temperatura_horno_c,
             maestro_panadero = EXCLUDED.maestro_panadero,
             iniciado_en = EXCLUDED.iniciado_en,
             finalizado_en = EXCLUDED.finalizado_en,
             estado = EXCLUDED.estado`,
          [
            pb.id,
            pb.codigoLote,
            pb.sucursalId,
            pb.productoId,
            pb.turno,
            pb.cantidadPlaneada,
            pb.cantidadObtenida,
            pb.mermaUnidades,
            pb.motivoMerma || null,
            pb.temperaturaHornoC,
            pb.maestroPanadero,
            pb.iniciadoEn,
            pb.finalizadoEn || null,
            pb.estado,
          ],
        );
      }

      // 7. Orders
      for (const o of this.orders) {
        await this.pool.query(
          `INSERT INTO orders (id, codigo_pedido, cliente_id, cliente_nombre, cliente_telefono, cliente_ci_nit, razon_social_factura, departamento_destino, ciudad_destino, direccion_entrega, referencia_direccion, tipo_entrega, sucursal_origen_id, items, subtotal_bs, costo_envio_bs, descuento_bs, total_bs, metodo_pago, estado_pago, comprobante_pago_url, qr_simple_data_uri, estado, observaciones, factura_id, creado_en, actualizado_en)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
           ON CONFLICT (id) DO UPDATE SET
             codigo_pedido = EXCLUDED.codigo_pedido,
             cliente_id = EXCLUDED.cliente_id,
             cliente_nombre = EXCLUDED.cliente_nombre,
             cliente_telefono = EXCLUDED.cliente_telefono,
             cliente_ci_nit = EXCLUDED.cliente_ci_nit,
             razon_social_factura = EXCLUDED.razon_social_factura,
             departamento_destino = EXCLUDED.departamento_destino,
             ciudad_destino = EXCLUDED.ciudad_destino,
             direccion_entrega = EXCLUDED.direccion_entrega,
             referencia_direccion = EXCLUDED.referencia_direccion,
             tipo_entrega = EXCLUDED.tipo_entrega,
             sucursal_origen_id = EXCLUDED.sucursal_origen_id,
             items = EXCLUDED.items,
             subtotal_bs = EXCLUDED.subtotal_bs,
             costo_envio_bs = EXCLUDED.costo_envio_bs,
             descuento_bs = EXCLUDED.descuento_bs,
             total_bs = EXCLUDED.total_bs,
             metodo_pago = EXCLUDED.metodo_pago,
             estado_pago = EXCLUDED.estado_pago,
             comprobante_pago_url = EXCLUDED.comprobante_pago_url,
             qr_simple_data_uri = EXCLUDED.qr_simple_data_uri,
             estado = EXCLUDED.estado,
             observaciones = EXCLUDED.observaciones,
             factura_id = EXCLUDED.factura_id,
             creado_en = EXCLUDED.creado_en,
             actualizado_en = EXCLUDED.actualizado_en`,
          [
            o.id,
            o.codigoPedido,
            o.clienteId || null,
            o.clienteNombre,
            o.clienteTelefono,
            o.clienteCiNit,
            o.razonSocialFactura,
            o.departamentoDestino,
            o.ciudadDestino,
            o.direccionEntrega,
            o.referenciaDireccion || null,
            o.tipoEntrega,
            o.sucursalOrigenId,
            JSON.stringify(o.items),
            o.subtotalBs,
            o.costoEnvioBs,
            o.descuentoBs,
            o.totalBs,
            o.metodoPago,
            o.estadoPago,
            o.comprobantePagoUrl || null,
            o.qrSimpleDataUri || null,
            o.estado,
            o.observaciones || null,
            o.facturaId || null,
            o.creadoEn,
            o.actualizadoEn,
          ],
        );
      }

      // 8. Invoices
      for (const inv of this.invoices) {
        await this.pool.query(
          `INSERT INTO invoices (id, numero_factura, cuf, cufd, nit_emisor, razon_social_emisor, sucursal_nombre, departamento, nit_ci_cliente, razon_social_cliente, fecha_emision, monto_total_bs, monto_sujeto_credito_fiscal_bs, qr_siat_data_uri, leyenda_fiscal, pedido_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           ON CONFLICT (id) DO UPDATE SET
             numero_factura = EXCLUDED.numero_factura,
             cuf = EXCLUDED.cuf,
             cufd = EXCLUDED.cufd,
             nit_emisor = EXCLUDED.nit_emisor,
             razon_social_emisor = EXCLUDED.razon_social_emisor,
             sucursal_nombre = EXCLUDED.sucursal_nombre,
             departamento = EXCLUDED.departamento,
             nit_ci_cliente = EXCLUDED.nit_ci_cliente,
             razon_social_cliente = EXCLUDED.razon_social_cliente,
             fecha_emision = EXCLUDED.fecha_emision,
             monto_total_bs = EXCLUDED.monto_total_bs,
             monto_sujeto_credito_fiscal_bs = EXCLUDED.monto_sujeto_credito_fiscal_bs,
             qr_siat_data_uri = EXCLUDED.qr_siat_data_uri,
             leyenda_fiscal = EXCLUDED.leyenda_fiscal,
             pedido_id = EXCLUDED.pedido_id`,
          [
            inv.id,
            inv.numeroFactura,
            inv.cuf,
            inv.cufd,
            inv.nitEmisor,
            inv.razonSocialEmisor,
            inv.sucursalNombre,
            inv.departamento,
            inv.nitCiCliente,
            inv.razonSocialCliente,
            inv.fechaEmision,
            inv.montoTotalBs,
            inv.montoSujetoCreditoFiscalBs,
            inv.qrSiatDataUri || null,
            inv.leyendaFiscal,
            inv.pedidoId,
          ],
        );
      }
    } catch (err) {
      if (
        (err as Error).message?.includes('after calling end') ||
        !this.isPostgresConnected
      ) {
        return;
      }
      this.logger.error('Error al persistir registros en PostgreSQL:', err);
    }
  }

  // ============================================================================
  // FALLBACK Y RESPALDO JSON
  // ============================================================================
  private async loadFromJsonOrSeed() {
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
        this.logger.log(
          `Base de datos cargada desde archivo local ${this.dbFilePath}`,
        );
      } catch (err) {
        this.logger.error(
          'Error al parsear base de datos JSON existente. Sembrando...',
          err,
        );
        await this.seedInitialData();
      }
    } else {
      await this.seedInitialData();
    }
  }

  public save() {
    this.saveJsonBackup();
    if (this.isPostgresConnected) {
      this.saveToPostgres().catch((err) => {
        this.logger.error(
          'Error al sincronizar con PostgreSQL en save():',
          err,
        );
      });
    }
  }

  private saveJsonBackup() {
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
      fs.writeFileSync(
        this.dbFilePath,
        JSON.stringify(payload, null, 2),
        'utf8',
      );
    } catch (error) {
      this.logger.error(
        'Error al guardar datos de respaldo en disco local:',
        error,
      );
    }
  }

  // ============================================================================
  // ESTADO Y TELEMETRÍA DE CONEXIÓN
  // ============================================================================
  public getConnectionInfo() {
    return {
      connected: this.isPostgresConnected,
      engine: 'PostgreSQL',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'panaderia_la_suprema',
      user: process.env.DB_USERNAME || 'usr_panaderia_la_suprema',
      stats: {
        usuarios: this.users.length,
        sucursales: this.branches.length,
        productos: this.products.length,
        stockItems: this.stock.length,
        materiasPrimas: this.rawMaterials.length,
        lotesProduccion: this.productionBatches.length,
        pedidos: this.orders.length,
        facturasSiat: this.invoices.length,
      },
    };
  }

  // ============================================================================
  // SEMILLAS DE PANADERÍA BOLIVIANA
  // ============================================================================
  private async seedInitialData() {
    this.logger.log(
      'Inicializando semillas de Panadería Boliviana de Clase Mundial...',
    );

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
        descripcion:
          'El pan insignia de Bolivia. Corteza ultracrocante y miga tierna cocida a la piedra con inyección de vapor. Receta de tradición paceña.',
        categoria: ProductCategory.PANES_TRADICIONALES,
        precioBs: 0.8,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 16,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.MADRUGADA,
        ingredientesPrincipales: [
          'Harina de Trigo 000',
          'Agua de vertiente',
          'Levadura viva',
          'Sal marina',
          'Poco azúcar',
        ],
        imagenUrl:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-002',
        codigoSku: 'PAN-SARN-02',
        nombre: 'Sarnita Caliente con Queso Criollo',
        descripcion:
          'Pan redondo suave con costra dorada de queso criollo derretido y una pizca de manteca en la superficie.',
        categoria: ProductCategory.PANES_TRADICIONALES,
        precioBs: 1.2,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 24,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.MADRUGADA,
        ingredientesPrincipales: [
          'Harina de Trigo',
          'Queso Criollo del Valle',
          'Manteca vegetal',
          'Azúcar',
          'Huevo',
        ],
        imagenUrl:
          'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-003',
        codigoSku: 'PAN-CUNA-03',
        nombre: 'Cuñapé Cruceño Horneado Especial',
        descripcion:
          'Auténtico cuñapé con doble ración de queso chaqueño y almidón de yuca seleccionado. Crocante por fuera y elástico por dentro.',
        categoria: ProductCategory.EMPANADAS_MASAS_CALIENTES,
        precioBs: 3.5,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 18,
        aptoEnvioNacional: true,
        horarioRecomendado: BakingShift.TARDE,
        ingredientesPrincipales: [
          'Almidón de Yuca Beniana',
          'Queso Chaqueño Maduro',
          'Leche entera',
          'Huevo de campo',
          'Mantequilla',
        ],
        imagenUrl:
          'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-004',
        codigoSku: 'PAN-ARAN-04',
        nombre: 'Pan de Arani Cochabambino con Canela y Queso',
        descripcion:
          'La legendaria hogaza del Valle Alto de Cochabamba. Miga dulce aromática con canela de Ceilán y costra de queso criollo.',
        categoria: ProductCategory.PANES_TRADICIONALES,
        precioBs: 15.0,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 72,
        aptoEnvioNacional: true,
        horarioRecomendado: BakingShift.MADRUGADA,
        ingredientesPrincipales: [
          'Harina de Trigo con Salvado',
          'Canela molida',
          'Queso de Punata',
          'Chancaca',
          'Manteca',
        ],
        imagenUrl:
          'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-005',
        codigoSku: 'PAN-LAJA-05',
        nombre: 'Pan de Laja Tradicional Altiplánico',
        descripcion:
          'Pan plano tostado en hornos de barro centenarios de Laja. Larga conservación natural y textura única para untar.',
        categoria: ProductCategory.PANES_TRADICIONALES,
        precioBs: 1.5,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 96,
        aptoEnvioNacional: true,
        horarioRecomendado: BakingShift.MADRUGADA,
        ingredientesPrincipales: [
          'Harina de trigo entera',
          'Agua de vertiente',
          'Grasa seleccionada',
          'Sal y azúcar morena',
        ],
        imagenUrl:
          'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=600&q=80',
        destacado: false,
        activo: true,
      },
      {
        id: 'prod-006',
        codigoSku: 'PAN-MADR-06',
        nombre: 'Campesino de Masa Madre Silvestre (24h Fermentación)',
        descripcion:
          'Pan rústico de alta hidratación fermentado lentamente con masa madre propia de 5 años. Corteza caramelizada y alveolado amplio.',
        categoria: ProductCategory.MASA_MADRE_ARTESANAL,
        precioBs: 22.0,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 72,
        aptoEnvioNacional: true,
        horarioRecomendado: BakingShift.NOCTURNO,
        ingredientesPrincipales: [
          'Harina de fuerza',
          'Harina de centeno',
          'Masa madre viva',
          'Agua filtrada',
          'Sal marina de Uyuni',
        ],
        imagenUrl:
          'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-007',
        codigoSku: 'PAN-BAGU-07',
        nombre: 'Baguette Francesa Clásica',
        descripcion:
          'Elaborada según la tradición parisina con masa madre y cocción sobre piedra refractaria. Corteza dorada y crujiente.',
        categoria: ProductCategory.MASA_MADRE_ARTESANAL,
        precioBs: 8.5,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 20,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.MADRUGADA,
        ingredientesPrincipales: [
          'Harina T65',
          'Levadura fresca',
          'Agua pura',
          'Sal marina',
        ],
        imagenUrl:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        destacado: false,
        activo: true,
      },
      {
        id: 'prod-008',
        codigoSku: 'PAN-QUIN-08',
        nombre: 'Hogaza de Quinua Real de Uyuni & Chía Chiquitana',
        descripcion:
          'Superalimento andino-oriental. Pan 100% nutritivo con harina de quinua real tostada, semillas de chía y semillas de girasol.',
        categoria: ProductCategory.LINEA_SALUDABLE_ANDINA,
        precioBs: 19.5,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 72,
        aptoEnvioNacional: true,
        horarioRecomendado: BakingShift.NOCTURNO,
        ingredientesPrincipales: [
          'Quinua Real Orgánica',
          'Chía Chiquitana',
          'Harina Integral 100%',
          'Miel del Chaco',
          'Masa Madre',
        ],
        imagenUrl:
          'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-009',
        codigoSku: 'PAS-SELV-09',
        nombre: 'Torta Selva Negra con Macerado de Singani San Pedro',
        descripcion:
          'Bizcocho húmedo de cacao orgánico boliviano bañado en reducción de singani de altura, cerezas ácidas y crema chantilly fresca.',
        categoria: ProductCategory.PASTELERIA_REPOSTERIA,
        precioBs: 185.0,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 48,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.NOCTURNO,
        ingredientesPrincipales: [
          'Cacao del Alto Beni',
          'Singani boliviano San Pedro',
          'Crema de leche fresca',
          'Cerezas',
          'Chocolate amargo 70%',
        ],
        imagenUrl:
          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-010',
        codigoSku: 'PAS-TRES-10',
        nombre: 'Torta Tres Leches Suprema al Toque de Vainilla',
        descripcion:
          'Clásica torta empapada en tres variedades de leche con toque de canela cochabambina y merengue tostado.',
        categoria: ProductCategory.PASTELERIA_REPOSTERIA,
        precioBs: 145.0,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 48,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.NOCTURNO,
        ingredientesPrincipales: [
          'Leche evaporada',
          'Leche condensada',
          'Crema espesa',
          'Bizcochuelo esponjoso',
          'Canela molida',
        ],
        imagenUrl:
          'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80',
        destacado: false,
        activo: true,
      },
      {
        id: 'prod-011',
        codigoSku: 'PAS-EMPB-11',
        nombre: 'Empanada Blasonada de Queso y Ají Dulce',
        descripcion:
          'Masa hojaldrada suave rellena de abundante queso criollo fundente con toque de cebolla caramelizada y ají amarillo dulce.',
        categoria: ProductCategory.EMPANADAS_MASAS_CALIENTES,
        precioBs: 4.5,
        unidadMedida: 'unidad',
        tiempoVidaUtilHoras: 24,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.MADRUGADA,
        ingredientesPrincipales: [
          'Harina de trigo',
          'Mantequilla artesanal',
          'Queso Chaqueño',
          'Ají dulce',
          'Huevo',
        ],
        imagenUrl:
          'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
        destacado: false,
        activo: true,
      },
      {
        id: 'prod-012',
        codigoSku: 'CAN-DESA-12',
        nombre: 'Canasta Familiar "Desayuno Paceño Imperial"',
        descripcion:
          'Incluye: 12 Marraquetas crocantes, 6 Sarnitas calientes, 250g de Queso Criollo artesanal, 1 Frasco de Miel de los Yungas y 1 Pan de Arani.',
        categoria: ProductCategory.COMBOS_CANASTAS,
        precioBs: 65.0,
        unidadMedida: 'canasta',
        tiempoVidaUtilHoras: 24,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.MADRUGADA,
        ingredientesPrincipales: [
          'Panes surtidos',
          'Queso fresco',
          'Miel pura de abeja',
          'Empaque ecológico',
        ],
        imagenUrl:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-013',
        codigoSku: 'CAN-CAMB-13',
        nombre: 'Canasta Gourmet "Lonche Camba Tradicional"',
        descripcion:
          'Incluye: 10 Cuñapés crujientes recién horneados, 4 Masacos de plátano con queso, 6 Rollitos de queso y té de hojas aromatizadas.',
        categoria: ProductCategory.COMBOS_CANASTAS,
        precioBs: 60.0,
        unidadMedida: 'canasta',
        tiempoVidaUtilHoras: 24,
        aptoEnvioNacional: false,
        horarioRecomendado: BakingShift.TARDE,
        ingredientesPrincipales: [
          'Cuñapés',
          'Masaco de Plátano y Yuca',
          'Queso Chaqueño',
          'Empaque rústico',
        ],
        imagenUrl:
          'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80',
        destacado: true,
        activo: true,
      },
      {
        id: 'prod-014',
        codigoSku: 'CAN-NACI-14',
        nombre:
          'Caja Regalo "Sabores de Toda Bolivia" (Apta Envíos a todo el País)',
        descripcion:
          'Especial para envíos interdepartamentales: 2 Panes de Arani envasados con atmósfera protegida, Galletas de Canela y Singani, Rosquetes de Punata, Cuñapés deshidratados crocantes y Pan de Laja tradicional.',
        categoria: ProductCategory.COMBOS_CANASTAS,
        precioBs: 110.0,
        unidadMedida: 'canasta',
        tiempoVidaUtilHoras: 240,
        aptoEnvioNacional: true,
        horarioRecomendado: BakingShift.NOCTURNO,
        ingredientesPrincipales: [
          'Pan de Arani',
          'Galletas de Canela',
          'Rosquetes',
          'Cuñapés crocantes',
          'Caja de madera premium',
        ],
        imagenUrl:
          'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
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
        costoUnitarioBs: 6.5,
      },
      {
        id: 'raw-02',
        nombre: 'Almidón de Yuca Beniano Seleccionado',
        unidad: 'kg',
        stockActual: 600,
        stockMinimoAlerta: 100,
        sucursalId: 'suc-scz-01',
        costoUnitarioBs: 12.0,
      },
      {
        id: 'raw-03',
        nombre: 'Queso Chaqueño Maduro para Cuñapé',
        unidad: 'kg',
        stockActual: 450,
        stockMinimoAlerta: 80,
        sucursalId: 'suc-scz-01',
        costoUnitarioBs: 28.0,
      },
      {
        id: 'raw-04',
        nombre: 'Levadura Fresca Activa',
        unidad: 'kg',
        stockActual: 120,
        stockMinimoAlerta: 25,
        sucursalId: 'suc-scz-01',
        costoUnitarioBs: 18.0,
      },
      {
        id: 'raw-05',
        nombre: 'Quinua Real de Uyuni Grano Tostado',
        unidad: 'kg',
        stockActual: 300,
        stockMinimoAlerta: 50,
        sucursalId: 'suc-scz-01',
        costoUnitarioBs: 22.0,
      },
      {
        id: 'raw-06',
        nombre: 'Manteca Vegetal de Palma Purificada',
        unidad: 'kg',
        stockActual: 400,
        stockMinimoAlerta: 60,
        sucursalId: 'suc-scz-01',
        costoUnitarioBs: 14.5,
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
            precioUnitarioBs: 15.0,
            subtotalBs: 30.0,
          },
          {
            productoId: 'prod-003',
            nombreProducto: 'Cuñapé Cruceño Horneado Especial',
            cantidad: 10,
            precioUnitarioBs: 3.5,
            subtotalBs: 35.0,
          },
        ],
        subtotalBs: 65.0,
        costoEnvioBs: 10.0,
        descuentoBs: 0.0,
        totalBs: 75.0,
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
            nombreProducto:
              'Caja Regalo "Sabores de Toda Bolivia" (Apta Envíos a todo el País)',
            cantidad: 2,
            precioUnitarioBs: 110.0,
            subtotalBs: 220.0,
          },
        ],
        subtotalBs: 220.0,
        costoEnvioBs: 30.0,
        descuentoBs: 10.0,
        totalBs: 240.0,
        metodoPago: PaymentMethod.QR_SIMPLE,
        estadoPago: PaymentStatus.PAGADO,
        estado: OrderStatus.EMPACADO,
        observaciones:
          'Despacho interdepartamental por Transporte San Roque Tarija.',
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
        montoTotalBs: 75.0,
        montoSujetoCreditoFiscalBs: 75.0,
        qrSiatDataUri: '',
        leyendaFiscal:
          'Ley N° 453: Los servicios deben prestarse en condiciones de inocuidad, calidad y seguridad.',
        pedidoId: 'ord-1001',
      },
    ];
  }
}
