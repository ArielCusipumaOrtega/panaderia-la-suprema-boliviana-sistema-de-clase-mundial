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
import { OrdersService } from './orders.service.js';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto.js';
import { OrderStatus } from '../../common/enums/order-status.enum.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/role.enum.js';

@ApiTags('6. Pedidos & Ventas Omnicanal')
@Controller('api/pedidos')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pedidos en todo Bolivia con filtros de departamento y estado' })
  @ApiQuery({ name: 'departamento', required: false })
  @ApiQuery({ name: 'sucursalId', required: false })
  @ApiQuery({ name: 'estado', enum: OrderStatus, required: false })
  @ApiQuery({ name: 'clienteCiNit', required: false })
  findAll(
    @Query('departamento') departamento?: string,
    @Query('sucursalId') sucursalId?: string,
    @Query('estado') estado?: OrderStatus,
    @Query('clienteCiNit') clienteCiNit?: string,
  ) {
    return this.ordersService.findAll({
      departamento,
      sucursalId,
      estado,
      clienteCiNit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle completo de un pedido por ID o código BOL-PED-XXXX' })
  findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo pedido (Público / E-commerce / POS Tienda)' })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente con QR Simple generado' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Patch(':id/estado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GERENTE_SUCURSAL, UserRole.CAJERO, UserRole.REPARTIDOR, UserRole.MAESTRO_PANADERO)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar estado del pedido (Horneando, Empacado, En camino, Entregado)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
