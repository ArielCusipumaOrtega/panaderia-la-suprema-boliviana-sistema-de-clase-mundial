import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LogisticsService } from './logistics.service.js';
import { ShippingQuoteDto } from './dto/shipping-quote.dto.js';

@ApiTags('4. Logística & Envíos Nacionales Bolivia')
@Controller('api/logistica')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Get('cobertura-departamentos')
  @ApiOperation({ summary: 'Consultar cobertura logística y tarifas de envío en los 9 departamentos de Bolivia' })
  @ApiResponse({ status: 200, description: 'Lista de departamentos y tiempos de entrega' })
  getDepartmentsCoverage() {
    return this.logisticsService.getAllDepartments();
  }

  @Post('cotizar-envio')
  @ApiOperation({ summary: 'Cotizar flete y verificar compatibilidad de productos según departamento' })
  @ApiResponse({ status: 200, description: 'Cotización detallada de flete y tiempo estimado' })
  quoteShipping(@Body() dto: ShippingQuoteDto) {
    return this.logisticsService.quoteShipping(dto);
  }
}
