import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('PanaderiaBoliviaBootstrap');
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Configuración de Documentación Interactiva Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Panadería La Suprema Boliviana - API Empresarial de Clase Mundial')
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
    .addTag('1. Autenticación & Usuarios', 'Registro, inicio de sesión y gestión de perfiles con roles')
    .addTag('2. Sucursales & Cobertura Bolivia', 'Gestión de sucursales físicas en los 9 departamentos')
    .addTag('3. Catálogo de Panadería & Pastelería', 'Panes tradicionales, masa madre, tortas y canastas')
    .addTag('4. Logística & Envíos Nacionales Bolivia', 'Cotizador de flete express local y despacho interdepartamental')
    .addTag('5. Producción & Hornadas (Maestro Panadero)', 'Planificación de horneadas, temperaturas y control de mermas')
    .addTag('6. Pedidos & Ventas Omnicanal', 'Gestión de pedidos e-commerce, tienda y despachos')
    .addTag('7. Pasarela de Pagos Bolivia (QR Simple & Tigo Money)', 'Generación de QR Simple interoperable BCB y verificación')
    .addTag('8. Facturación Computarizada en Línea SIAT / SIN Bolivia', 'Emisión oficial de facturas computarizadas con CUF y QR')
    .addTag('9. Reportes & Analítica de Negocio Bolivia', 'Dashboard de ventas en Bs. por departamento y arqueo de caja')
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
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`================================================================`);
  logger.log(`🥖 PANADERÍA LA SUPREMA BOLIVIANA - SISTEMA DE CLASE MUNDIAL 🇧🇴`);
  logger.log(`================================================================`);
  logger.log(`🌐 Portal Web & E-Commerce:   http://localhost:${port}/`);
  logger.log(`📑 Documentación Swagger:    http://localhost:${port}/api/docs`);
  logger.log(`⚡ Moneda oficial:           BOB (Bolivianos - Bs.)`);
  logger.log(`🛡️ Facturación SIAT activa:  NIT 3049182019`);
  logger.log(`📲 Pagos habilitados:        QR Simple Interoperable BCB / Tigo Money`);
  logger.log(`================================================================`);
}
void bootstrap();
