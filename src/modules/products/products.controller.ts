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
import { ProductsService } from './products.service.js';
import { CreateProductDto, UpdateStockDto } from './dto/create-product.dto.js';
import { ProductCategory } from '../../common/enums/product-category.enum.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/role.enum.js';

@ApiTags('3. Catálogo de Panadería & Pastelería')
@Controller('api/productos')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar productos con filtros (categoría, apto para envío nacional, destacados, búsqueda)',
  })
  @ApiQuery({ name: 'categoria', enum: ProductCategory, required: false })
  @ApiQuery({ name: 'aptoEnvioNacional', type: Boolean, required: false })
  @ApiQuery({ name: 'destacado', type: Boolean, required: false })
  @ApiQuery({ name: 'busqueda', type: String, required: false })
  findAll(
    @Query('categoria') categoria?: ProductCategory,
    @Query('aptoEnvioNacional') aptoEnvioNacional?: string,
    @Query('destacado') destacado?: string,
    @Query('busqueda') busqueda?: string,
  ) {
    return this.productsService.findAll({
      categoria,
      aptoEnvioNacional:
        aptoEnvioNacional !== undefined ? aptoEnvioNacional === 'true' : undefined,
      destacado: destacado !== undefined ? destacado === 'true' : undefined,
      busqueda,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un producto e inventario en sucursales' })
  @ApiQuery({ name: 'sucursalId', type: String, required: false })
  findById(@Param('id') id: string, @Query('sucursalId') sucursalId?: string) {
    return this.productsService.getProductWithStock(id, sucursalId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MAESTRO_PANADERO)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Registrar un nuevo producto en el catálogo (Admin / Maestro Panadero)' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GERENTE_SUCURSAL, UserRole.MAESTRO_PANADERO)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar stock disponible en una sucursal específica' })
  updateStock(@Param('id') id: string, @Body() dto: UpdateStockDto) {
    return this.productsService.updateStock(id, dto);
  }
}
