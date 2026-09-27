import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/role.enum.js';

@ApiTags('9. Reportes & Analítica de Negocio Bolivia')
@Controller('api/analitica')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Obtener tablero gerencial (Ventas por departamento en Bs., Top productos, Mermas, Eficiencia)',
  })
  @ApiResponse({ status: 200, description: 'Métricas consolidadas de panadería en Bolivia' })
  getDashboard() {
    return this.analyticsService.getDashboardSummary();
  }

  @Get('cierre-caja/:sucursalId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GERENTE_SUCURSAL, UserRole.CAJERO)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Arqueo y cierre de caja diario por sucursal' })
  getCierreDeCaja(@Param('sucursalId') sucursalId: string) {
    return this.analyticsService.getCierreDeCaja(sucursalId);
  }
}
