import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaymentMethod } from '../../../common/enums/payment-method.enum.js';

export class GenerateQrSimpleDto {
  @ApiProperty({ example: 'ord-1001', description: 'ID o Código del pedido' })
  @IsString()
  @IsNotEmpty()
  pedidoId: string;

  @ApiProperty({ example: 75.0, description: 'Monto a cobrar en Bolivianos' })
  @IsNumber()
  @Min(0.5)
  montoBs: number;

  @ApiPropertyOptional({ example: 'Pago por pedido de panadería artesanal' })
  @IsString()
  @IsOptional()
  concepto?: string;
}

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'ord-1001' })
  @IsString()
  @IsNotEmpty()
  pedidoId: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.QR_SIMPLE })
  @IsEnum(PaymentMethod)
  metodoPago: PaymentMethod;

  @ApiPropertyOptional({
    example: 'TXN-BCP-9847291',
    description: 'Número de comprobante bancario o código de transacción',
  })
  @IsString()
  @IsOptional()
  numeroTransaccion?: string;
}
