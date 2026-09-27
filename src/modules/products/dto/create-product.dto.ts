import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ProductCategory, BakingShift } from '../../../common/enums/product-category.enum.js';

export class CreateProductDto {
  @ApiProperty({ example: 'PAN-MARR-02' })
  @IsString()
  @IsNotEmpty()
  codigoSku: string;

  @ApiProperty({ example: 'Marraqueta Paceña Gigante de Horno a Leña' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Tradición boliviana de alta hidratación' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ enum: ProductCategory, example: ProductCategory.PANES_TRADICIONALES })
  @IsEnum(ProductCategory)
  categoria: ProductCategory;

  @ApiProperty({ example: 1.50, description: 'Precio en Bolivianos (Bs.)' })
  @IsNumber()
  @Min(0.1)
  precioBs: number;

  @ApiProperty({ example: 'unidad', enum: ['unidad', 'docena', 'kilo', 'canasta', 'porción'] })
  @IsString()
  unidadMedida: 'unidad' | 'docena' | 'kilo' | 'canasta' | 'porción';

  @ApiProperty({ example: 18, description: 'Tiempo de vida útil óptimo en horas' })
  @IsNumber()
  tiempoVidaUtilHoras: number;

  @ApiProperty({ example: false, description: 'Apto para envíos por flota o courier a otras ciudades' })
  @IsBoolean()
  aptoEnvioNacional: boolean;

  @ApiProperty({ enum: BakingShift, example: BakingShift.MADRUGADA })
  @IsEnum(BakingShift)
  horarioRecomendado: BakingShift;

  @ApiProperty({ example: ['Harina 000', 'Masa madre', 'Sal de Colchani'] })
  @IsArray()
  @IsString({ each: true })
  ingredientesPrincipales: string[];

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1509440159596-0249088772ff' })
  @IsString()
  imagenUrl: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  destacado?: boolean;
}

export class UpdateStockDto {
  @ApiProperty({ example: 'suc-scz-01', description: 'ID de la sucursal' })
  @IsString()
  @IsNotEmpty()
  sucursalId: string;

  @ApiProperty({ example: 150, description: 'Nueva cantidad disponible' })
  @IsNumber()
  @Min(0)
  cantidadDisponible: number;
}
