import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DatabaseService } from '../../database/database.service.js';

@ApiTags('0. Estado del Sistema & Salud (Frontend Integration)')
@Controller('api')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get('health')
  @ApiOperation({
    summary:
      'Verificar estado de salud, uptime y conectividad del backend para el Frontend',
    description:
      'Endpoint ligero utilizado por aplicaciones cliente (Vue.js, React, Mobile) para verificar el estado de la API y la conexión a la base de datos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Servicio en línea, base de datos operativa y métricas del sistema',
  })
  checkHealth() {
    const dbInfo = this.db.getConnectionInfo();
    return {
      status: 'ok',
      service: 'Panadería La Suprema Boliviana API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database: {
        engine: dbInfo.engine,
        connected: dbInfo.connected,
        name: dbInfo.database,
      },
      features: {
        siatInvoicing: true,
        qrSimplePayments: true,
        nationalLogistics: true,
        bolivianDepartments: 9,
        departmentsCount: 9,
        moneda: 'BOB (Bolivianos - Bs.)',
      },
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Metadatos de la API y enlaces útiles para desarrolladores Frontend',
  })
  getApiOverview() {
    return {
      name: 'Panadería La Suprema Boliviana - API Backend de Clase Mundial',
      version: '1.0.0',
      description:
        'Backend desacoplado de alto rendimiento para frontend en Vue.js / Nuxt / Vite',
      documentation: '/api/docs',
      openapiJson: '/api/docs-json',
      healthCheck: '/api/health',
      cors: {
        enabled: true,
        credentials: true,
      },
      endpoints: {
        auth: '/api/auth',
        products: '/api/productos',
        branches: '/api/sucursales',
        logistics: '/api/logistica',
        orders: '/api/pedidos',
        payments: '/api/pagos',
        billing: '/api/facturacion',
        analytics: '/api/analitica',
        storefrontHtml: '/',
      },
    };
  }
}
