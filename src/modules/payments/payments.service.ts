import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as QRCode from 'qrcode';
import { DatabaseService } from '../../database/database.service.js';
import { GenerateQrSimpleDto, ConfirmPaymentDto } from './dto/process-payment.dto.js';
import { PaymentStatus } from '../../common/enums/payment-method.enum.js';
import { OrderStatus } from '../../common/enums/order-status.enum.js';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly db: DatabaseService) {}

  async generateQrSimple(dto: GenerateQrSimpleDto) {
    const order = this.db.orders.find(
      (o) => o.id === dto.pedidoId || o.codigoPedido === dto.pedidoId,
    );
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

    order.qrSimpleDataUri = qrDataUri;
    this.db.save();

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
    const order = this.db.orders.find(
      (o) => o.id === dto.pedidoId || o.codigoPedido === dto.pedidoId,
    );
    if (!order) {
      throw new NotFoundException(`Pedido ${dto.pedidoId} no encontrado`);
    }

    order.estadoPago = PaymentStatus.PAGADO;
    order.metodoPago = dto.metodoPago;
    if (order.estado === OrderStatus.PENDIENTE_PAGO) {
      order.estado = OrderStatus.CONFIRMADO;
    }
    order.actualizadoEn = new Date().toISOString();

    this.db.save();

    this.logger.log(
      `Pago confirmado para pedido ${order.codigoPedido} mediante ${dto.metodoPago}. Tx: ${dto.numeroTransaccion || 'N/A'}`,
    );

    return {
      mensaje: 'Pago registrado y confirmado con éxito',
      pedidoId: order.id,
      codigoPedido: order.codigoPedido,
      estadoPago: order.estadoPago,
      nuevoEstadoPedido: order.estado,
    };
  }
}
