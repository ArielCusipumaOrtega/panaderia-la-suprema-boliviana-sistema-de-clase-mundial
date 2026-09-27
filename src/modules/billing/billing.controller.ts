import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BillingService } from './billing.service.js';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto.js';

@ApiTags('8. Facturación Computarizada en Línea SIAT / SIN Bolivia')
@Controller('api/facturacion')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('facturas')
  @ApiOperation({ summary: 'Listar todas las facturas electrónicas emitidas en Bolivia' })
  findAll() {
    return this.billingService.findAll();
  }

  @Get('facturas/:id')
  @ApiOperation({ summary: 'Obtener detalle de factura por ID, número o ID de pedido' })
  findById(@Param('id') id: string) {
    return this.billingService.findById(id);
  }

  @Post('emitir')
  @ApiOperation({
    summary: 'Emitir Factura Computarizada en Línea con Código Único de Facturación (CUF) y QR SIAT',
  })
  @ApiResponse({ status: 201, description: 'Factura emitida con éxito y QR generado' })
  generateInvoice(@Body() dto: GenerateInvoiceDto) {
    return this.billingService.generateInvoice(dto);
  }
}
