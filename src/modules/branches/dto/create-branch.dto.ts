import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DepartamentoBolivia } from '../../../common/constants/bolivia-regions.constant.js';

export class CreateBranchDto {
  @ApiProperty({ example: 'SCZ-02', description: 'Código identificador único de sucursal' })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({ example: 'Sucursal Plan 3000 Pampa de la Isla' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ enum: DepartamentoBolivia, example: DepartamentoBolivia.SANTA_CRUZ })
  @IsEnum(DepartamentoBolivia)
  departamento: DepartamentoBolivia;

  @ApiProperty({ example: 'Santa Cruz de la Sierra' })
  @IsString()
  @IsNotEmpty()
  ciudad: string;

  @ApiProperty({ example: 'Av. El Mechero #340' })
  @IsString()
  @IsNotEmpty()
  direccion: string;

  @ApiProperty({ example: '+591 3 388-1234' })
  @IsString()
  @IsNotEmpty()
  telefono: string;

  @ApiProperty({ example: 'Lunes a Domingo 06:00 - 21:30' })
  @IsString()
  @IsNotEmpty()
  horarioAtencion: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  esMatriz?: boolean;

  @ApiProperty({ example: 4000, description: 'Capacidad de horneada diaria' })
  @IsNumber()
  @Min(100)
  capacidadProduccionDiaria: number;
}
