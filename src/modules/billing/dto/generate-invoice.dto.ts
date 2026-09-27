import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateInvoiceDto {
  @ApiProperty({ example: 'ord-1001', description: 'ID del pedido a facturar' })
  @IsString()
  @IsNotEmpty()
  pedidoId: string;

  @ApiPropertyOptional({
    example: '3048591012',
    description: 'NIT o Carnet de Identidad del comprador',
  })
  @IsString()
  @IsOptional()
  nitCiCliente?: string;

  @ApiPropertyOptional({
    example: 'CORPORACION DEL VALLE S.A.',
    description: 'Razón Social para la factura',
  })
  @IsString()
  @IsOptional()
  razonSocialCliente?: string;
}
