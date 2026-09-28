import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { OrdersRepository } from '../orders/domain/orders.repository.interface.js';
import { BranchesRepository } from '../branches/domain/branches.repository.interface.js';
import { ProductsRepository } from '../products/domain/products.repository.interface.js';
import { ProductionRepository } from '../production/domain/production.repository.interface.js';
import { DepartamentoBolivia } from '../../common/constants/bolivia-regions.constant.js';
import { PaymentStatus } from '../../common/enums/payment-method.enum.js';
import { BolivianCurrency } from '../../common/domain/value-objects/bolivian-currency.vo.js';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly ordersRepo: OrdersRepository,
    private readonly branchesRepo: BranchesRepository,
    private readonly productsRepo: ProductsRepository,
    private readonly productionRepo: ProductionRepository,
    private readonly db: DatabaseService,
  ) {}

  getDashboardSummary() {
    const allOrders = this.ordersRepo.findAll();
    const allBranches = this.branchesRepo.findAll();
    const allBatches = this.productionRepo.findAllBatches();

    // 1. Total ventas consolidadas en Bolivianos
    const pedidosPagados = allOrders.filter(
      (o) => o.estadoPago === PaymentStatus.PAGADO,
    );
    let totalVentasBs = 0;
    for (const p of pedidosPagados) {
      totalVentasBs = BolivianCurrency.of(totalVentasBs).plus(p.totalBs).value;
    }

    // 2. Ventas por Departamento de Bolivia
    const ventasPorDepartamento: Record<
      string,
      { totalBs: number; cantidadPedidos: number }
    > = {};
    for (const d of Object.values(DepartamentoBolivia)) {
      ventasPorDepartamento[d] = { totalBs: 0, cantidadPedidos: 0 };
    }

    for (const o of pedidosPagados) {
      if (ventasPorDepartamento[o.departamentoDestino]) {
        ventasPorDepartamento[o.departamentoDestino].totalBs =
          BolivianCurrency.of(
            ventasPorDepartamento[o.departamentoDestino].totalBs,
          ).plus(o.totalBs).value;
        ventasPorDepartamento[o.departamentoDestino].cantidadPedidos += 1;
      }
    }

    // 3. Ventas por Método de Pago
    const ventasPorMetodoPago: Record<string, number> = {};
    for (const o of pedidosPagados) {
      ventasPorMetodoPago[o.metodoPago] = BolivianCurrency.of(
        ventasPorMetodoPago[o.metodoPago] || 0,
      ).plus(o.totalBs).value;
    }

    // 4. Productos más vendidos
    const ventasPorProducto: Record<
      string,
      { nombre: string; unidades: number; totalBs: number }
    > = {};
    for (const o of allOrders) {
      for (const item of o.items) {
        if (!ventasPorProducto[item.productoId]) {
          ventasPorProducto[item.productoId] = {
            nombre: item.nombreProducto,
            unidades: 0,
            totalBs: 0,
          };
        }
        ventasPorProducto[item.productoId].unidades += item.cantidad;
        ventasPorProducto[item.productoId].totalBs = BolivianCurrency.of(
          ventasPorProducto[item.productoId].totalBs,
        ).plus(item.subtotalBs).value;
      }
    }

    const topProductos = Object.values(ventasPorProducto)
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 5);

    // 5. Métricas de Producción y Mermas de Hornada
    const totalPiezasPlaneadas = allBatches.reduce(
      (acc, b) => acc + b.cantidadPlaneada,
      0,
    );
    const totalPiezasObtenidas = allBatches.reduce(
      (acc, b) => acc + b.cantidadObtenida,
      0,
    );
    const totalMermas = allBatches.reduce((acc, b) => acc + b.mermaUnidades, 0);
    const porcentajeMerma =
      totalPiezasPlaneadas > 0
        ? Math.round((totalMermas / totalPiezasPlaneadas) * 10000) / 100
        : 0;

    // 6. Alertas de Stock Crítico
    const allProducts = this.productsRepo.findAll();
    const alertasStock: Array<{
      producto?: string;
      sucursal?: string;
      departamento?: string;
      cantidadDisponible: number;
      cantidadMinimaAlerta: number;
    }> = [];

    for (const p of allProducts) {
      const stockItems = this.productsRepo.getStock(p.id);
      for (const s of stockItems) {
        if (s.cantidadDisponible <= s.cantidadMinimaAlerta) {
          const branch = this.branchesRepo.findById(s.sucursalId);
          alertasStock.push({
            producto: p.nombre,
            sucursal: branch?.nombre,
            departamento: branch?.departamento,
            cantidadDisponible: s.cantidadDisponible,
            cantidadMinimaAlerta: s.cantidadMinimaAlerta,
          });
        }
      }
    }

    return {
      moneda: 'BOB (Bolivianos)',
      totalVentasBs,
      totalPedidosRegistrados: allOrders.length,
      totalSucursalesActivas: allBranches.filter((b) => b.activa).length,
      ventasPorDepartamento,
      ventasPorMetodoPago,
      topProductos,
      produccion: {
        totalPiezasPlaneadas,
        totalPiezasObtenidas,
        totalMermas,
        porcentajeMerma: `${porcentajeMerma}%`,
        estadoEficiencia: porcentajeMerma < 3 ? 'EXCELENTE' : 'REGULAR',
      },
      alertasStockCritico: alertasStock,
    };
  }

  getCierreDeCaja(sucursalId: string) {
    const branch = this.branchesRepo.findById(sucursalId);
    const pedidos = this.ordersRepo
      .findAll()
      .filter((o) => o.sucursalOrigenId === sucursalId);

    const totalEfectivo = pedidos
      .filter(
        (o) =>
          o.metodoPago === 'EFECTIVO_CONTRAENTREGA' &&
          o.estadoPago === PaymentStatus.PAGADO,
      )
      .reduce((sum, o) => BolivianCurrency.of(sum).plus(o.totalBs).value, 0);

    const totalQrSimple = pedidos
      .filter(
        (o) =>
          o.metodoPago === 'QR_SIMPLE' && o.estadoPago === PaymentStatus.PAGADO,
      )
      .reduce((sum, o) => BolivianCurrency.of(sum).plus(o.totalBs).value, 0);

    const totalTarjetas = pedidos
      .filter(
        (o) =>
          o.metodoPago === 'TARJETA' && o.estadoPago === PaymentStatus.PAGADO,
      )
      .reduce((sum, o) => BolivianCurrency.of(sum).plus(o.totalBs).value, 0);

    const totalGeneral = BolivianCurrency.of(totalEfectivo)
      .plus(totalQrSimple)
      .plus(totalTarjetas).value;

    return {
      sucursal: branch?.nombre || sucursalId,
      departamento: branch?.departamento,
      fechaCierre: new Date().toISOString(),
      resumenCobros: {
        totalEfectivoBs: totalEfectivo,
        totalQrSimpleBs: totalQrSimple,
        totalTarjetasBs: totalTarjetas,
        totalGeneralBs: totalGeneral,
      },
      pedidosProcesados: pedidos.length,
    };
  }

  getDatabaseStatus() {
    return this.db.getConnectionInfo();
  }
}
