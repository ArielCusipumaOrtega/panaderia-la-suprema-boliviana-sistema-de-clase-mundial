import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';
import { GenerateQrSimpleDto, ConfirmPaymentDto } from './dto/process-payment.dto.js';

@ApiTags('7. Pasarela de Pagos Bolivia (QR Simple & Tigo Money)')
@Controller('api/pagos')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('generar-qr-simple')
  @ApiOperation({
    summary: 'Generar código QR Simple interoperable con bancos de Bolivia (BCP, BNB, Banco Unión, BancoSol)',
  })
  @ApiResponse({ status: 200, description: 'Código QR en base64 y datos del pago' })
  generateQrSimple(@Body() dto: GenerateQrSimpleDto) {
    return this.paymentsService.generateQrSimple(dto);
  }

  @Post('confirmar')
  @ApiOperation({ summary: 'Confirmar pago de pedido (vía Webhook, POS o Cajero)' })
  @ApiResponse({ status: 200, description: 'Pago confirmado exitosamente' })
  confirmPayment(@Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(dto);
  }
}
