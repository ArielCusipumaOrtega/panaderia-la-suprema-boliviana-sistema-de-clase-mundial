import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DepartamentoBolivia } from '../../../common/constants/bolivia-regions.constant.js';
import { DeliveryType } from '../../../common/enums/order-status.enum.js';

export class ShippingQuoteDto {
  @ApiProperty({ enum: DepartamentoBolivia, example: DepartamentoBolivia.COCHABAMBA })
  @IsEnum(DepartamentoBolivia)
  departamentoDestino: DepartamentoBolivia;

  @ApiProperty({ example: 'Cochabamba' })
  @IsString()
  @IsNotEmpty()
  ciudadDestino: string;

  @ApiProperty({ enum: DeliveryType, example: DeliveryType.EXPRESS_LOCAL })
  @IsEnum(DeliveryType)
  tipoEntrega: DeliveryType;

  @ApiPropertyOptional({ example: ['prod-001', 'prod-004'], description: 'IDs de productos en el carrito para validar compatibilidad de envío' })
  @IsArray()
  @IsOptional()
  productosIds?: string[];
}
