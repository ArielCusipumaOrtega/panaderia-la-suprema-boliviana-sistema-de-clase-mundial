import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { DeliveryType } from './../src/common/enums/order-status.enum.js';
import { PaymentMethod } from './../src/common/enums/payment-method.enum.js';
import { DepartamentoBolivia } from './../src/common/constants/bolivia-regions.constant.js';

describe('Panadería La Suprema Boliviana (E2E Tests)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. GET / - Debe servir el portal web de la panadería con HTML', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);
    expect(res.text).toContain('La Suprema Boliviana');
    expect(res.text).toContain('Marraqueta');
    expect(res.text).toContain('QR Simple');
  });

  it('2. GET /api/productos - Debe retornar los panes y repostería boliviana', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/productos')
      .expect(200);
    expect(res.body.exito).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(5);

    const nombres = res.body.data.map((p: any) => p.nombre);
    expect(nombres.some((n: string) => n.includes('Marraqueta'))).toBe(true);
    expect(nombres.some((n: string) => n.includes('Cuñapé'))).toBe(true);
    expect(nombres.some((n: string) => n.includes('Arani'))).toBe(true);
  });

  it('3. GET /api/sucursales - Debe retornar sucursales en los 9 departamentos de Bolivia', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/sucursales')
      .expect(200);
    expect(res.body.exito).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(10);
    const departamentos = res.body.data.map((s: any) => s.departamento);
    expect(departamentos).toContain('Santa Cruz');
    expect(departamentos).toContain('La Paz');
    expect(departamentos).toContain('Cochabamba');
  });

  it('4. POST /api/logistica/cotizar-envio - Debe cotizar flete según destino en Bolivia', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/logistica/cotizar-envio')
      .send({
        departamentoDestino: DepartamentoBolivia.COCHABAMBA,
        ciudadDestino: 'Cochabamba',
        tipoEntrega: DeliveryType.EXPRESS_LOCAL,
      })
      .expect(201);

    expect(res.body.exito).toBe(true);
    expect(res.body.data.costoEnvioBs).toBe(10);
    expect(res.body.data.tiempoEstimado).toContain('minutos');
  });

  it('5. POST /api/pedidos - Debe procesar un pedido y generar QR Simple', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/pedidos')
      .send({
        clienteNombre: 'Carlos Montaño Hurtado',
        clienteTelefono: '+591 76012345',
        clienteCiNit: '4876543-SC',
        razonSocialFactura: 'Carlos Montaño',
        departamentoDestino: DepartamentoBolivia.SANTA_CRUZ,
        ciudadDestino: 'Santa Cruz de la Sierra',
        direccionEntrega: 'Av. Las Américas #320',
        tipoEntrega: DeliveryType.EXPRESS_LOCAL,
        items: [
          { productoId: 'prod-003', cantidad: 6 }, // 6 Cuñapés
          { productoId: 'prod-004', cantidad: 1 }, // 1 Pan de Arani
        ],
        metodoPago: PaymentMethod.QR_SIMPLE,
      })
      .expect(201);

    expect(res.body.exito).toBe(true);
    const pedido = res.body.data;
    expect(pedido.codigoPedido).toContain('BOL-PED-');
    expect(pedido.totalBs).toBeGreaterThan(0);
    expect(pedido.qrSimpleDataUri).toBeDefined();
    expect(pedido.qrSimpleDataUri).toContain('data:image/png;base64');
  });

  it('6. POST /api/facturacion/emitir - Debe emitir Factura Computarizada SIAT con CUF y QR tributario', async () => {
    // Tomamos el primer pedido existente
    const pedidosRes = await request(app.getHttpServer())
      .get('/api/pedidos')
      .expect(200);
    const primerPedido = pedidosRes.body.data[0];

    const res = await request(app.getHttpServer())
      .post('/api/facturacion/emitir')
      .send({
        pedidoId: primerPedido.id,
      })
      .expect(201);

    expect(res.body.exito).toBe(true);
    const factura = res.body.data;
    expect(factura.numeroFactura).toBeGreaterThan(5000);
    expect(factura.nitEmisor).toBe('3049182019');
    expect(factura.cuf).toBeDefined();
    expect(factura.cuf.length).toBeGreaterThan(20);
    expect(factura.qrSiatDataUri).toContain('data:image/png;base64');
    expect(factura.leyendaFiscal).toContain('Ley N° 453');
  });

  it('7. GET /api/analitica/dashboard - Debe reportar métricas consolidadas en Bolivianos (Bs.)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/analitica/dashboard')
      .expect(200);
    expect(res.body.exito).toBe(true);
    const dash = res.body.data;
    expect(dash.moneda).toBe('BOB (Bolivianos)');
    expect(dash.totalVentasBs).toBeGreaterThan(0);
    expect(dash.ventasPorDepartamento).toBeDefined();
  });

  it('8. GET /api/health - Debe responder con estado de salud y uptime para clientes Vue.js', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);
    expect(res.body.exito).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.service).toContain('Panadería La Suprema Boliviana');
    expect(res.body.data.database).toBeDefined();
    expect(res.body.data.features.bolivianDepartments).toBe(9);
  });

  it('9. GET /api - Debe retornar catálogo de rutas y metadatos para desarrollo frontend', async () => {
    const res = await request(app.getHttpServer())
      .get('/api')
      .expect(200);
    expect(res.body.exito).toBe(true);
    expect(res.body.data.endpoints).toBeDefined();
    expect(res.body.data.cors.enabled).toBe(true);
  });
});
