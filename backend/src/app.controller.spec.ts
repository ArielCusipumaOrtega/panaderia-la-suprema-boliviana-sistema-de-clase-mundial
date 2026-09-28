import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module.js';
import { ProductsService } from './modules/products/products.service.js';
import { LogisticsService } from './modules/logistics/logistics.service.js';
import { DepartamentoBolivia } from './common/constants/bolivia-regions.constant.js';
import { DeliveryType } from './common/enums/order-status.enum.js';

describe('Panadería Boliviana Services (Unit Tests)', () => {
  let productsService: ProductsService;
  let logisticsService: LogisticsService;

  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await module.init();

    productsService = module.get<ProductsService>(ProductsService);
    logisticsService = module.get<LogisticsService>(LogisticsService);
  }, 15000);

  afterAll(async () => {
    await module?.close();
  });

  it('debe listar los productos y verificar panes tradicionales bolivianos', () => {
    const productos = productsService.findAll();
    expect(productos.length).toBeGreaterThan(5);
    const marraqueta = productos.find((p) => p.nombre.includes('Marraqueta'));
    expect(marraqueta).toBeDefined();
    expect(marraqueta?.precioBs).toBeGreaterThan(0);
  });

  it('debe cotizar flete a Santa Cruz con despacho express', () => {
    const cotizacion = logisticsService.quoteShipping({
      departamentoDestino: DepartamentoBolivia.SANTA_CRUZ,
      ciudadDestino: 'Santa Cruz de la Sierra',
      tipoEntrega: DeliveryType.EXPRESS_LOCAL,
    });
    expect(cotizacion.costoEnvioBs).toBe(10);
    expect(cotizacion.coberturaValida).toBe(true);
  });

  it('debe validar flete interdepartamental para ciudades sin sucursal física directa', () => {
    const cotizacion = logisticsService.quoteShipping({
      departamentoDestino: DepartamentoBolivia.BENI,
      ciudadDestino: 'Trinidad',
      tipoEntrega: DeliveryType.ENVIO_NACIONAL,
    });
    expect(cotizacion.costoEnvioBs).toBe(40);
    expect(cotizacion.tiempoEstimado).toContain('48 horas');
  });

  it('debe operar con precisión aritmética financiera en Bolivianos usando BolivianCurrency VO', async () => {
    const { BolivianCurrency } = await import(
      './common/domain/value-objects/bolivian-currency.vo.js'
    );
    const precioUnitario = BolivianCurrency.of(0.8); // Marraqueta 80 ctvs.
    const totalDoce = precioUnitario.times(12);
    expect(totalDoce.value).toBe(9.6);
    expect(totalDoce.format()).toBe('Bs. 9.60');

    // Test exact decimal rounding against floating point artifacts
    const suma = BolivianCurrency.of(0.1).plus(0.2);
    expect(suma.value).toBe(0.3);
  });
});
