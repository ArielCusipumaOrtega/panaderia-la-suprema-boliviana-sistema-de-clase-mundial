import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('PanaderiaBoliviaBootstrap');
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS profesional para clientes frontend (Vue.js, React, Mobile)
  const configuredOrigins = process.env.CORS_ORIGIN || process.env.FRONTEND_URL;
  const explicitOrigins = configuredOrigins
    ? configuredOrigins.split(',').map((o) => o.trim())
    : [];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Permitir peticiones sin origen (SSR, curl, Postman, mobile, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Orígenes locales habituales en desarrollo (Vite: 5173, Vue CLI: 8080, Nuxt: 3000, preview: 4173)
      const isLocalhost =
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

      const isAllowed =
        explicitOrigins.includes('*') ||
        explicitOrigins.includes(origin) ||
        isLocalhost ||
        process.env.NODE_ENV !== 'production';

      if (isAllowed) {
        callback(null, true);
      } else {
        logger.warn(`[CORS] Origen bloqueado: ${origin}`);
        callback(
          new Error(
            `El origen ${origin} no está autorizado por la política CORS del backend`,
          ),
        );
      }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Sucursal-Id',
    ],
    exposedHeaders: ['Authorization', 'Content-Disposition'],
    maxAge: 3600,
  });

  // Configuración de Documentación Interactiva Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle(
      'Panadería La Suprema Boliviana - API Empresarial de Clase Mundial',
    )
    .setDescription(
      `API REST para el sistema integral de panadería y pastelería con cobertura nacional en Bolivia.
      
      ✨ **Capacidades Principales:**
      * **Cobertura Nacional:** 9 Departamentos (Santa Cruz, La Paz, Cochabamba, Tarija, Chuquisaca, Oruro, Potosí, Beni, Pando).
      * **Catálogo Especializado:** Marraqueta paceña crujiente, Cuñapés cruceños, Pan de Arani, Pan de Laja, Masas tradicionales y Pastelería fina con Singani.
      * **Facturación SIAT / SIN:** Generación de CUF, CUFD, NIT emisor 3049182019, Leyenda Ley N° 453 y Código QR Tributario.
      * **Pasarela de Pagos Bolivia:** QR Simple Interoperable (BCB/ASOBAN), Tigo Money, Efectivo contra entrega y Tarjetas.
      * **Control de Producción:** Hornadas en turnos Madrugada/Tarde, insumos y control estricto de mermas.`,
    )
    .setVersion('1.0.0')
    .addTag(
      '0. Estado del Sistema & Salud (Frontend Integration)',
      'Health check y verificación de conectividad para clientes Vue.js',
    )
    .addTag(
      '1. Autenticación & Usuarios',
      'Registro, inicio de sesión y gestión de perfiles con roles',
    )
    .addTag(
      '2. Sucursales & Cobertura Bolivia',
      'Gestión de sucursales físicas en los 9 departamentos',
    )
    .addTag(
      '3. Catálogo de Panadería & Pastelería',
      'Panes tradicionales, masa madre, tortas y canastas',
    )
    .addTag(
      '4. Logística & Envíos Nacionales Bolivia',
      'Cotizador de flete express local y despacho interdepartamental',
    )
    .addTag(
      '5. Producción & Hornadas (Maestro Panadero)',
      'Planificación de horneadas, temperaturas y control de mermas',
    )
    .addTag(
      '6. Pedidos & Ventas Omnicanal',
      'Gestión de pedidos e-commerce, tienda y despachos',
    )
    .addTag(
      '7. Pasarela de Pagos Bolivia (QR Simple & Tigo Money)',
      'Generación de QR Simple interoperable BCB y verificación',
    )
    .addTag(
      '8. Facturación Computarizada en Línea SIAT / SIN Bolivia',
      'Emisión oficial de facturas computarizadas con CUF y QR',
    )
    .addTag(
      '9. Reportes & Analítica de Negocio Bolivia',
      'Dashboard de ventas en Bs. por departamento y arqueo de caja',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingrese el token JWT obtenido en /api/auth/login',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Panadería La Suprema Boliviana | Documentación API',
    customCss: '.swagger-ui .topbar { background-color: #3D1C08; }',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Endpoints explícitos de especificación OpenAPI para generadores de clientes TypeScript en Vue
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get(
    '/api/docs-json',
    (_req: unknown, res: { json: (data: unknown) => void }) => {
      res.json(document);
    },
  );
  httpAdapter.get(
    '/api-json',
    (_req: unknown, res: { json: (data: unknown) => void }) => {
      res.json(document);
    },
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(
    `================================================================`,
  );
  logger.log(`🥖 PANADERÍA LA SUPREMA BOLIVIANA - SISTEMA DE CLASE MUNDIAL 🇧🇴`);
  logger.log(
    `================================================================`,
  );
  logger.log(`🌐 Portal Web & E-Commerce:   http://localhost:${port}/`);
  logger.log(`📑 Documentación Swagger:    http://localhost:${port}/api/docs`);
  logger.log(`📄 Especificación OpenAPI:   http://localhost:${port}/api/docs-json`);
  logger.log(`💓 Health Check Endpoint:    http://localhost:${port}/api/health`);
  logger.log(
    `🐘 Base de Datos:            PostgreSQL (${process.env.DB_NAME ?? 'panaderia_la_suprema'} en ${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? 5432})`,
  );
  logger.log(`⚡ Moneda oficial:           BOB (Bolivianos - Bs.)`);
  logger.log(`🛡️ Facturación SIAT activa:  NIT 3049182019`);
  logger.log(
    `📲 Pagos habilitados:        QR Simple Interoperable BCB / Tigo Money`,
  );
  logger.log(
    `🟢 Integración Vue.js:       CORS habilitado con credenciales (Vite, Pinia, Axios)`,
  );
  logger.log(
    `================================================================`,
  );
}
void bootstrap();
