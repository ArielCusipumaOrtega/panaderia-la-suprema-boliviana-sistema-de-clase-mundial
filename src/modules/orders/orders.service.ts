import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import {
  DatabaseService,
  OrderEntity,
  OrderItemEntity,
} from '../../database/database.service.js';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
} from './dto/create-order.dto.js';
import {
  OrderStatus,
  DeliveryType,
} from '../../common/enums/order-status.enum.js';
import {
  PaymentMethod,
  PaymentStatus,
} from '../../common/enums/payment-method.enum.js';
import { REGIONES_BOLIVIA } from '../../common/constants/bolivia-regions.constant.js';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly db: DatabaseService) {}

  findAll(query?: {
    departamento?: string;
    sucursalId?: string;
    estado?: OrderStatus;
    clienteCiNit?: string;
  }) {
    let list = this.db.orders;

    if (query?.departamento) {
      list = list.filter((o) => o.departamentoDestino === query.departamento);
    }
    if (query?.sucursalId) {
      list = list.filter((o) => o.sucursalOrigenId === query.sucursalId);
    }
    if (query?.estado) {
      list = list.filter((o) => o.estado === query.estado);
    }
    if (query?.clienteCiNit) {
      list = list.filter((o) => o.clienteCiNit.includes(query.clienteCiNit!));
    }

    return list;
  }

  findById(id: string): OrderEntity {
    const order = this.db.orders.find(
      (o) => o.id === id || o.codigoPedido.toUpperCase() === id.toUpperCase(),
    );
    if (!order) {
      throw new NotFoundException(`Pedido '${id}' no encontrado`);
    }
    return order;
  }

  async create(dto: CreateOrderDto, clienteId?: string): Promise<OrderEntity> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException(
        'El pedido debe incluir al menos un producto',
      );
    }

    // 1. Determinar sucursal de origen
    let sucursalOrigenId = dto.sucursalOrigenId;
    if (!sucursalOrigenId) {
      const sucursalLocal = this.db.branches.find(
        (b) => b.departamento === dto.departamentoDestino && b.activa,
      );
      if (sucursalLocal) {
        sucursalOrigenId = sucursalLocal.id;
      } else {
        const matriz =
          this.db.branches.find((b) => b.esMatriz) || this.db.branches[0];
        sucursalOrigenId = matriz.id;
      }
    }

    // 2. Calcular ítems y validar stock
    const processedItems: OrderItemEntity[] = [];
    let subtotalBs = 0;

    for (const itemDto of dto.items) {
      const product = this.db.products.find((p) => p.id === itemDto.productoId);
      if (!product) {
        throw new NotFoundException(
          `Producto con ID ${itemDto.productoId} no existe`,
        );
      }

      if (
        dto.tipoEntrega === DeliveryType.ENVIO_NACIONAL &&
        !product.aptoEnvioNacional
      ) {
        throw new BadRequestException(
          `El producto '${product.nombre}' es de consumo fresco inmediato y no resiste envío nacional interdepartamental. Por favor elija un envío express local o retire en tienda.`,
        );
      }

      // Validar y decrementar stock en la sucursal de origen
      const stockEntry = this.db.stock.find(
        (s) => s.productoId === product.id && s.sucursalId === sucursalOrigenId,
      );
      if (stockEntry) {
        if (stockEntry.cantidadDisponible < itemDto.cantidad) {
          this.logger.warn(
            `Stock insuficiente en sucursal ${sucursalOrigenId} para ${product.nombre}. Disponible: ${stockEntry.cantidadDisponible}, Solicitado: ${itemDto.cantidad}`,
          );
        }
        stockEntry.cantidadDisponible = Math.max(
          0,
          stockEntry.cantidadDisponible - itemDto.cantidad,
        );
      }

      const itemSubtotal =
        Math.round(product.precioBs * itemDto.cantidad * 100) / 100;
      subtotalBs += itemSubtotal;

      processedItems.push({
        productoId: product.id,
        nombreProducto: product.nombre,
        cantidad: itemDto.cantidad,
        precioUnitarioBs: product.precioBs,
        subtotalBs: itemSubtotal,
      });
    }

    // 3. Calcular flete de envío según región
    const regionInfo = REGIONES_BOLIVIA[dto.departamentoDestino];
    let costoEnvioBs = 0;
    if (dto.tipoEntrega === DeliveryType.EXPRESS_LOCAL) {
      costoEnvioBs = regionInfo ? regionInfo.costoEnvioExpressBs : 12;
    } else if (dto.tipoEntrega === DeliveryType.ENVIO_NACIONAL) {
      costoEnvioBs = regionInfo ? regionInfo.costoEnvioNacionalBs : 30;
    }

    const descuentoBs = 0;
    const totalBs =
      Math.round((subtotalBs + costoEnvioBs - descuentoBs) * 100) / 100;

    // 4. Generar código único de pedido boliviano
    const correlativo = (this.db.orders.length + 1001).toString();
    const codigoPedido = `BOL-PED-${correlativo}`;

    // 5. Generar QR Simple si el pago es QR
    let qrSimpleDataUri: string | undefined = undefined;
    if (dto.metodoPago === PaymentMethod.QR_SIMPLE) {
      const qrSimplePayload = JSON.stringify({
        glosa: `Panaderia Suprema Bolivia - Pedido ${codigoPedido}`,
        monto: totalBs,
        moneda: 'BOB',
        cuentaDestino: '10000034872910-BCP',
        titular: 'PANADERIA & PASTELERIA ARTESANAL BOLIVIA S.R.L.',
        nit: '3049182019',
        vencimiento: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });

      try {
        qrSimpleDataUri = await QRCode.toDataURL(qrSimplePayload, {
          margin: 2,
          color: { dark: '#4A2810', light: '#FFFDF9' },
        });
      } catch (err) {
        this.logger.error('Error generando QR Simple', err);
      }
    }

    const newOrder: OrderEntity = {
      id: `ord-${uuidv4().substring(0, 8)}`,
      codigoPedido,
      clienteId,
      clienteNombre: dto.clienteNombre,
      clienteTelefono: dto.clienteTelefono,
      clienteCiNit: dto.clienteCiNit,
      razonSocialFactura: dto.razonSocialFactura || dto.clienteNombre,
      departamentoDestino: dto.departamentoDestino,
      ciudadDestino: dto.ciudadDestino,
      direccionEntrega: dto.direccionEntrega,
      referenciaDireccion: dto.referenciaDireccion,
      tipoEntrega: dto.tipoEntrega,
      sucursalOrigenId,
      items: processedItems,
      subtotalBs,
      costoEnvioBs,
      descuentoBs,
      totalBs,
      metodoPago: dto.metodoPago,
      estadoPago:
        dto.metodoPago === PaymentMethod.EFECTIVO_CONTRAENTREGA
          ? PaymentStatus.PENDIENTE
          : PaymentStatus.PAGADO, // Para demostración fluida
      qrSimpleDataUri,
      estado: OrderStatus.CONFIRMADO,
      observaciones: dto.observaciones,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    };

    this.db.orders.unshift(newOrder);
    this.db.save();

    this.logger.log(
      `Pedido creado: ${newOrder.codigoPedido} por Bs. ${newOrder.totalBs} para ${newOrder.clienteNombre} (${newOrder.departamentoDestino})`,
    );

    return newOrder;
  }

  updateStatus(id: string, dto: UpdateOrderStatusDto): OrderEntity {
    const order = this.findById(id);
    order.estado = dto.nuevoEstado;
    order.actualizadoEn = new Date().toISOString();
    if (dto.nota) {
      order.observaciones = order.observaciones
        ? `${order.observaciones} | ${dto.nota}`
        : dto.nota;
    }
    this.db.save();
    this.logger.log(
      `Pedido ${order.codigoPedido} actualizado a estado: ${dto.nuevoEstado}`,
    );
    return order;
  }
}
