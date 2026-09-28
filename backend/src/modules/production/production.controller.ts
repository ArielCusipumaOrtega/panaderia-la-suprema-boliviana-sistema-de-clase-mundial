import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductionService } from './production.service.js';
import { CreateBatchDto, FinishBatchDto } from './dto/create-batch.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/role.enum.js';

@ApiTags('5. Producción & Hornadas (Maestro Panadero)')
@Controller('api/produccion')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get('lotes')
  @ApiOperation({
    summary: 'Listar lotes de producción y hornadas (opcional por sucursal)',
  })
  @ApiQuery({ name: 'sucursalId', required: false })
  findAll(@Query('sucursalId') sucursalId?: string) {
    return this.productionService.findAll(sucursalId);
  }

  @Get('materia-prima')
  @ApiOperation({
    summary:
      'Consultar inventario de insumos (harina, levadura, queso criollo)',
  })
  @ApiQuery({ name: 'sucursalId', required: false })
  getRawMaterials(@Query('sucursalId') sucursalId?: string) {
    return this.productionService.getRawMaterials(sucursalId);
  }

  @Post('iniciar-hornada')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MAESTRO_PANADERO, UserRole.GERENTE_SUCURSAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Iniciar un nuevo lote de horneada (Turno mañana/tarde)',
  })
  @ApiResponse({
    status: 201,
    description: 'Hornada iniciada con código de lote generado',
  })
  createBatch(@Body() dto: CreateBatchDto) {
    return this.productionService.createBatch(dto);
  }

  @Patch('finalizar-hornada/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MAESTRO_PANADERO, UserRole.GERENTE_SUCURSAL)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Finalizar hornada, registrar unidades producidas y mermas (actualiza stock automáticamente)',
  })
  finishBatch(@Param('id') id: string, @Body() dto: FinishBatchDto) {
    return this.productionService.finishBatch(id, dto);
  }
}
