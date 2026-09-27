import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../common/enums/role.enum.js';
import { DepartamentoBolivia } from '../../../common/constants/bolivia-regions.constant.js';

export class RegisterDto {
  @ApiProperty({ example: 'juan.perez@gmail.com' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'PanaderoSecreto123!' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Juan Pérez Colque' })
  @IsString()
  @IsNotEmpty()
  nombreCompleto: string;

  @ApiProperty({ example: '+591 76543210' })
  @IsString()
  @IsNotEmpty()
  telefono: string;

  @ApiProperty({ example: '6895412-LP' })
  @IsString()
  @IsNotEmpty()
  ciNit: string;

  @ApiProperty({
    enum: DepartamentoBolivia,
    example: DepartamentoBolivia.LA_PAZ,
  })
  @IsEnum(DepartamentoBolivia)
  departamento: DepartamentoBolivia;

  @ApiProperty({ example: 'La Paz' })
  @IsString()
  ciudad: string;

  @ApiProperty({ example: 'Av. Arce #2450, Edif. Illimani Dpto 5A' })
  @IsString()
  direccion: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.CLIENTE })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ example: 'suc-lpz-01' })
  @IsString()
  @IsOptional()
  sucursalId?: string;
}
