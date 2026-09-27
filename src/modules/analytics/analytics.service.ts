import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { DepartamentoBolivia } from '../../common/constants/bolivia-regions.constant.js';
import { PaymentStatus } from '../../common/enums/payment-method.enum.js';

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DatabaseService) {}

  getDashboardSummary() {
    // 1. Total ventas consolidadas en Bolivianos
    const pedidosPagados = this.db.orders.filter(
      (o) => o.estadoPago === PaymentStatus.PAGADO,
    );
    const totalVentasBs = pedidosPagados.reduce((acc, o) => acc + o.totalBs, 0);

    // 2. Ventas por Departamento de Bolivia
    const ventasPorDepartamento: Record<string, { totalBs: number; cantidadPedidos: number }> = {};
    for (const d of Object.values(DepartamentoBolivia)) {
      ventasPorDepartamento[d] = { totalBs: 0, cantidadPedidos: 0 };
    }

    for (const o of pedidosPagados) {
      if (ventasPorDepartamento[o.departamentoDestino]) {
        ventasPorDepartamento[o.departamentoDestino].totalBs += o.totalBs;
        ventasPorDepartamento[o.departamentoDestino].cantidadPedidos += 1;
      }
    }

    // 3. Ventas por Método de Pago
    const ventasPorMetodoPago: Record<string, number> = {};
    for (const o of pedidosPagados) {
      ventasPorMetodoPago[o.metodoPago] =
        (ventasPorMetodoPago[o.metodoPago] || 0) + o.totalBs;
    }

    // 4. Productos más vendidos
    const ventasPorProducto: Record<string, { nombre: string; unidades: number; totalBs: number }> = {};
    for (const o of this.db.orders) {
      for (const item of o.items) {
        if (!ventasPorProducto[item.productoId]) {
          ventasPorProducto[item.productoId] = {
            nombre: item.nombreProducto,
            unidades: 0,
            totalBs: 0,
          };
        }
        ventasPorProducto[item.productoId].unidades += item.cantidad;
        ventasPorProducto[item.productoId].totalBs += item.subtotalBs;
      }
    }

    const topProductos = Object.values(ventasPorProducto)
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 5);

    // 5. Métricas de Producción y Mermas de Hornada
    const totalPiezasPlaneadas = this.db.productionBatches.reduce(
      (acc, b) => acc + b.cantidadPlaneada,
      0,
    );
    const totalPiezasObtenidas = this.db.productionBatches.reduce(
      (acc, b) => acc + b.cantidadObtenida,
      0,
    );
    const totalMermas = this.db.productionBatches.reduce(
      (acc, b) => acc + b.mermaUnidades,
      0,
    );
    const porcentajeMerma =
      totalPiezasPlaneadas > 0
        ? Math.round((totalMermas / totalPiezasPlaneadas) * 10000) / 100
        : 0;

    // 6. Alertas de Stock Crítico
    const alertasStock = this.db.stock
      .filter((s) => s.cantidadDisponible <= s.cantidadMinimaAlerta)
      .map((s) => {
        const prod = this.db.products.find((p) => p.id === s.productoId);
        const suc = this.db.branches.find((b) => b.id === s.sucursalId);
        return {
          producto: prod?.nombre,
          sucursal: suc?.nombre,
          departamento: suc?.departamento,
          cantidadDisponible: s.cantidadDisponible,
          cantidadMinimaAlerta: s.cantidadMinimaAlerta,
        };
      });

    return {
      moneda: 'BOB (Bolivianos)',
      totalVentasBs: Math.round(totalVentasBs * 100) / 100,
      totalPedidosRegistrados: this.db.orders.length,
      totalSucursalesActivas: this.db.branches.filter((b) => b.activa).length,
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
    const branch = this.db.branches.find((b) => b.id === sucursalId);
    const pedidos = this.db.orders.filter((o) => o.sucursalOrigenId === sucursalId);

    const totalEfectivo = pedidos
      .filter((o) => o.metodoPago === 'EFECTIVO_CONTRAENTREGA' && o.estadoPago === PaymentStatus.PAGADO)
      .reduce((sum, o) => sum + o.totalBs, 0);

    const totalQrSimple = pedidos
      .filter((o) => o.metodoPago === 'QR_SIMPLE' && o.estadoPago === PaymentStatus.PAGADO)
      .reduce((sum, o) => sum + o.totalBs, 0);

    const totalTarjetas = pedidos
      .filter((o) => o.metodoPago === 'TARJETA' && o.estadoPago === PaymentStatus.PAGADO)
      .reduce((sum, o) => sum + o.totalBs, 0);

    return {
      sucursal: branch?.nombre || sucursalId,
      departamento: branch?.departamento,
      fechaCierre: new Date().toISOString(),
      resumenCobros: {
        totalEfectivoBs: totalEfectivo,
        totalQrSimpleBs: totalQrSimple,
        totalTarjetasBs: totalTarjetas,
        totalGeneralBs: totalEfectivo + totalQrSimple + totalTarjetas,
      },
      pedidosProcesados: pedidos.length,
    };
  }
}
