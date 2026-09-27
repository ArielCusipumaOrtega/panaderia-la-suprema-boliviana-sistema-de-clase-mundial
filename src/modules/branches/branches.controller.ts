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
import { BranchesService } from './branches.service.js';
import { CreateBranchDto } from './dto/create-branch.dto.js';
import { DepartamentoBolivia } from '../../common/constants/bolivia-regions.constant.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/role.enum.js';

@ApiTags('2. Sucursales & Cobertura Bolivia')
@Controller('api/sucursales')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @ApiOperation({
    summary:
      'Listar todas las sucursales activas en Bolivia (filtrable por departamento)',
  })
  @ApiQuery({
    name: 'departamento',
    enum: DepartamentoBolivia,
    required: false,
  })
  findAll(@Query('departamento') departamento?: DepartamentoBolivia) {
    return this.branchesService.findAll(departamento);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener información detallada de una sucursal' })
  findById(@Param('id') id: string) {
    return this.branchesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear una nueva sucursal en Bolivia (Solo Administrador)',
  })
  @ApiResponse({ status: 201, description: 'Sucursal creada exitosamente' })
  create(@Body() dto: CreateBranchDto) {
    return this.branchesService.create(dto);
  }

  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Activar o suspender sucursal' })
  toggleActive(@Param('id') id: string) {
    return this.branchesService.toggleActive(id);
  }
}
