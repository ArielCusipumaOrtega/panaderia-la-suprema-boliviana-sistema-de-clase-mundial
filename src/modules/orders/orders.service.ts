import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';
import {
  OrdersRepository,
  OrderFilterQuery,
} from './domain/orders.repository.interface.js';
import { OrderEntity, OrderItemEntity } from './domain/order.entity.js';
import { ProductsRepository } from '../products/domain/products.repository.interface.js';
import { BranchesRepository } from '../branches/domain/branches.repository.interface.js';
import { BolivianCurrency } from '../../common/domain/value-objects/bolivian-currency.vo.js';
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

  constructor(
    private readonly ordersRepo: OrdersRepository,
    private readonly productsRepo: ProductsRepository,
    private readonly branchesRepo: BranchesRepository,
  ) {}

  findAll(query?: OrderFilterQuery): OrderEntity[] {
    return this.ordersRepo.findAll(query);
  }

  findById(id: string): OrderEntity {
    const order = this.ordersRepo.findById(id);
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
      const sucursalesDepto = this.branchesRepo.findByDepartment(
        dto.departamentoDestino,
      );
      if (sucursalesDepto.length > 0) {
        sucursalOrigenId = sucursalesDepto[0].id;
      } else {
        const todas = this.branchesRepo.findAll(true);
        const matriz = todas.find((b) => b.esMatriz) || todas[0];
        sucursalOrigenId = matriz ? matriz.id : 'suc-scz-01';
      }
    }

    // 2. Calcular ítems y validar stock
    const processedItems: OrderItemEntity[] = [];
    let subtotalCur = BolivianCurrency.of(0);

    for (const itemDto of dto.items) {
      const product = this.productsRepo.findById(itemDto.productoId);
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

      // Decrementar stock en la sucursal de origen
      try {
        this.productsRepo.decrementStock(
          sucursalOrigenId,
          product.id,
          itemDto.cantidad,
        );
      } catch (err) {
        this.logger.warn(
          `No se pudo decrementar stock: ${(err as Error).message}`,
        );
      }

      const itemSubtotal = BolivianCurrency.of(product.precioBs).times(
        itemDto.cantidad,
      );
      subtotalCur = subtotalCur.plus(itemSubtotal);

      processedItems.push({
        productoId: product.id,
        nombreProducto: product.nombre,
        cantidad: itemDto.cantidad,
        precioUnitarioBs: product.precioBs,
        subtotalBs: itemSubtotal.value,
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
    const totalCur = subtotalCur.plus(costoEnvioBs).minus(descuentoBs);

    // 4. Generar código único de pedido boliviano
    const totalOrders = this.ordersRepo.findAll().length;
    const correlativo = (totalOrders + 1001).toString();
    const codigoPedido = `BOL-PED-${correlativo}`;

    // 5. Generar QR Simple si el pago es QR
    let qrSimpleDataUri: string | undefined = undefined;
    if (dto.metodoPago === PaymentMethod.QR_SIMPLE) {
      const qrSimplePayload = JSON.stringify({
        glosa: `Panaderia Suprema Bolivia - Pedido ${codigoPedido}`,
        monto: totalCur.value,
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
      subtotalBs: subtotalCur.value,
      costoEnvioBs,
      descuentoBs,
      totalBs: totalCur.value,
      metodoPago: dto.metodoPago,
      estadoPago:
        dto.metodoPago === PaymentMethod.EFECTIVO_CONTRAENTREGA
          ? PaymentStatus.PENDIENTE
          : PaymentStatus.PAGADO,
      qrSimpleDataUri,
      estado: OrderStatus.CONFIRMADO,
      observaciones: dto.observaciones,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    };

    const savedOrder = this.ordersRepo.create(newOrder);

    this.logger.log(
      `Pedido creado: ${savedOrder.codigoPedido} por Bs. ${savedOrder.totalBs} para ${savedOrder.clienteNombre} (${savedOrder.departamentoDestino})`,
    );

    return savedOrder;
  }

  updateStatus(id: string, dto: UpdateOrderStatusDto): OrderEntity {
    const order = this.findById(id);
    const updates: Partial<OrderEntity> = {
      estado: dto.nuevoEstado,
      actualizadoEn: new Date().toISOString(),
    };
    if (dto.nota) {
      updates.observaciones = order.observaciones
        ? `${order.observaciones} | ${dto.nota}`
        : dto.nota;
    }
    const updated = this.ordersRepo.update(id, updates);
    this.logger.log(
      `Pedido ${updated.codigoPedido} actualizado a estado: ${dto.nuevoEstado}`,
    );
    return updated;
  }
}
