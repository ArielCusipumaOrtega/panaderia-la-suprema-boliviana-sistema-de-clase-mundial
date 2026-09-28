import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BakingShift } from '../../../common/enums/product-category.enum.js';

export class CreateBatchDto {
  @ApiProperty({
    example: 'suc-lpz-01',
    description: 'ID de la sucursal donde se horneará',
  })
  @IsString()
  @IsNotEmpty()
  sucursalId: string;

  @ApiProperty({
    example: 'prod-001',
    description: 'ID del producto a elaborar',
  })
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @ApiProperty({ enum: BakingShift, example: BakingShift.MADRUGADA })
  @IsEnum(BakingShift)
  turno: BakingShift;

  @ApiProperty({
    example: 1000,
    description: 'Cantidad planeada de piezas a hornear',
  })
  @IsNumber()
  @Min(1)
  cantidadPlaneada: number;

  @ApiProperty({
    example: 240,
    description: 'Temperatura del horno en grados Celsius',
  })
  @IsNumber()
  temperaturaHornoC: number;

  @ApiProperty({
    example: 'Don Saturnino Mamani',
    description: 'Nombre del maestro panadero responsable',
  })
  @IsString()
  @IsNotEmpty()
  maestroPanadero: string;
}

export class FinishBatchDto {
  @ApiProperty({
    example: 985,
    description: 'Cantidad de piezas obtenidas conformes para venta',
  })
  @IsNumber()
  @Min(0)
  cantidadObtenida: number;

  @ApiProperty({
    example: 15,
    description: 'Cantidad de piezas de merma (defectuosas o quemadas)',
  })
  @IsNumber()
  @Min(0)
  mermaUnidades: number;

  @ApiPropertyOptional({
    example: 'Borde sobre-dorado por viento en horno de tiro directo',
  })
  @IsString()
  @IsOptional()
  motivoMerma?: string;
}
