import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DepartamentoBolivia } from '../../../common/constants/bolivia-regions.constant.js';
import { DeliveryType, OrderStatus } from '../../../common/enums/order-status.enum.js';
import { PaymentMethod } from '../../../common/enums/payment-method.enum.js';

export class OrderItemDto {
  @ApiProperty({ example: 'prod-001' })
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @ApiProperty({ example: 6, description: 'Cantidad de unidades o canastas' })
  @IsNumber()
  @Min(1)
  cantidad: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Andrea Villarroel Rojas' })
  @IsString()
  @IsNotEmpty()
  clienteNombre: string;

  @ApiProperty({ example: '+591 70765432' })
  @IsString()
  @IsNotEmpty()
  clienteTelefono: string;

  @ApiProperty({ example: '5543210-CB', description: 'Número de Carnet de Identidad o NIT' })
  @IsString()
  @IsNotEmpty()
  clienteCiNit: string;

  @ApiPropertyOptional({ example: 'Andrea Villarroel Rojas', description: 'Razón social para la factura SIAT' })
  @IsString()
  @IsOptional()
  razonSocialFactura?: string;

  @ApiProperty({ enum: DepartamentoBolivia, example: DepartamentoBolivia.COCHABAMBA })
  @IsEnum(DepartamentoBolivia)
  departamentoDestino: DepartamentoBolivia;

  @ApiProperty({ example: 'Cochabamba' })
  @IsString()
  @IsNotEmpty()
  ciudadDestino: string;

  @ApiProperty({ example: 'Av. América Este #780, Edificio Los Robles Dpto 4B' })
  @IsString()
  @IsNotEmpty()
  direccionEntrega: string;

  @ApiPropertyOptional({ example: 'Portón café frente al parque' })
  @IsString()
  @IsOptional()
  referenciaDireccion?: string;

  @ApiProperty({ enum: DeliveryType, example: DeliveryType.EXPRESS_LOCAL })
  @IsEnum(DeliveryType)
  tipoEntrega: DeliveryType;

  @ApiPropertyOptional({ example: 'suc-cbb-01', description: 'Sucursal de despacho elegida (opcional, asignada automáticamente si se omite)' })
  @IsString()
  @IsOptional()
  sucursalOrigenId?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.QR_SIMPLE })
  @IsEnum(PaymentMethod)
  metodoPago: PaymentMethod;

  @ApiPropertyOptional({ example: 'Por favor despachar bien caliente a las 17:00' })
  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.EN_HORNEADA })
  @IsEnum(OrderStatus)
  nuevoEstado: OrderStatus;

  @ApiPropertyOptional({ example: 'El pedido fue asignado al repartidor Carlos' })
  @IsString()
  @IsOptional()
  nota?: string;
}
