import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { OrdersRepository } from '../orders/domain/orders.repository.interface.js';
import {
  GenerateQrSimpleDto,
  ConfirmPaymentDto,
} from './dto/process-payment.dto.js';
import { PaymentStatus } from '../../common/enums/payment-method.enum.js';
import { OrderStatus } from '../../common/enums/order-status.enum.js';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly ordersRepo: OrdersRepository) {}

  async generateQrSimple(dto: GenerateQrSimpleDto) {
    const order = this.ordersRepo.findById(dto.pedidoId);
    if (!order) {
      throw new NotFoundException(`Pedido ${dto.pedidoId} no encontrado`);
    }

    const payloadQr = {
      sistema: 'QR_SIMPLE_BOLIVIA_INTEROPERABLE',
      entidadEmisora: 'BANCO_CENTRAL_DE_BOLIVIA',
      bancoAdquiriente: 'BANCO DE CREDITO DE BOLIVIA S.A. (BCP)',
      cuentaBeneficiario: '10000034872910-BCP',
      titular: 'PANADERIA & PASTELERIA ARTESANAL BOLIVIA S.R.L.',
      nitBeneficiario: '3049182019',
      monto: dto.montoBs,
      moneda: 'BOB',
      codigoPedido: order.codigoPedido,
      glosa: dto.concepto || `Pago Pedido ${order.codigoPedido}`,
      fechaEmision: new Date().toISOString(),
      fechaVencimiento: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    const qrDataUri = await QRCode.toDataURL(JSON.stringify(payloadQr), {
      margin: 2,
      width: 320,
      color: {
        dark: '#78350F', // Warm bakery brown
        light: '#FFFBEB', // Light amber background
      },
    });

    this.ordersRepo.update(order.id, { qrSimpleDataUri: qrDataUri });

    return {
      exito: true,
      pedidoId: order.id,
      codigoPedido: order.codigoPedido,
      montoBs: dto.montoBs,
      moneda: 'BOB (Bolivianos)',
      qrImageBase64: qrDataUri,
      datosQrSimple: payloadQr,
      bancosCompatibles: [
        'Banco Unión S.A.',
        'Banco de Crédito de Bolivia (BCP)',
        'Banco Nacional de Bolivia (BNB)',
        'Banco Mercantil Santa Cruz (BMSC)',
        'Banco FIE S.A.',
        'Banco Solidario (BancoSol)',
        'Banco BISA S.A.',
        'Banco Ganadero (GanaMóvil)',
        'Banco Ecofuturo',
      ],
    };
  }

  confirmPayment(dto: ConfirmPaymentDto) {
    const order = this.ordersRepo.findById(dto.pedidoId);
    if (!order) {
      throw new NotFoundException(`Pedido ${dto.pedidoId} no encontrado`);
    }

    const nuevoEstado =
      order.estado === OrderStatus.PENDIENTE_PAGO
        ? OrderStatus.CONFIRMADO
        : order.estado;

    const updated = this.ordersRepo.update(order.id, {
      estadoPago: PaymentStatus.PAGADO,
      metodoPago: dto.metodoPago,
      estado: nuevoEstado,
    });

    this.logger.log(
      `Pago confirmado para pedido ${updated.codigoPedido} mediante ${dto.metodoPago}. Tx: ${dto.numeroTransaccion || 'N/A'}`,
    );

    return {
      mensaje: 'Pago registrado y confirmado con éxito',
      pedidoId: updated.id,
      codigoPedido: updated.codigoPedido,
      estadoPago: updated.estadoPago,
      nuevoEstadoPedido: updated.estado,
    };
  }
}
