<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import type { DashboardMetrics } from '@/types';
import {
  TrendingUp,
  MapPin,
  Flame,
  PieChart,
  ShoppingBag,
  Award,
  Sparkles,
} from 'lucide-vue-next';

const metrics = ref<DashboardMetrics | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await api.get<DashboardMetrics>('/analitica/dashboard');
    metrics.value = data;
  } catch (err) {
    console.error('Error al cargar analítica:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
          <Sparkles class="w-3.5 h-3.5 text-amber-700" />
          <span>Reportes & Analítica de Negocio en Bolivia</span>
        </div>
        <h1 class="font-serif text-3xl sm:text-4xl font-black text-gray-900">
          Tablero Gerencial de Ventas & Hornadas 📊
        </h1>
        <p class="text-xs sm:text-sm text-gray-600 mt-1">
          Métricas consolidadas en Bolivianos (BOB - Bs.) en tiempo real para directores y gerentes de sucursal.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded-xl font-bold text-gray-700 shadow-sm">
          Moneda: BOB (Bolivianos - Bs.)
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-24">
      <div class="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-sm font-semibold text-gray-600">Calculando métricas nacionales...</p>
    </div>

    <div v-else-if="metrics" class="space-y-8">
      <!-- 4 Key Metric Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-3xl border border-bakery-200 shadow-sm space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Ventas Totales</span>
            <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              Bs
            </div>
          </div>
          <div class="text-2xl font-black text-gray-900">
            Bs. {{ metrics.totalVentasBs.toFixed(2) }}
          </div>
          <span class="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp class="w-3.5 h-3.5" /> Ingresos facturados SIAT
          </span>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-bakery-200 shadow-sm space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Pedidos Registrados</span>
            <div class="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <ShoppingBag class="w-4 h-4" />
            </div>
          </div>
          <div class="text-2xl font-black text-gray-900">
            {{ metrics.totalPedidosRegistrados }}
          </div>
          <span class="text-[11px] text-gray-500 font-medium">Omnicanal (Tienda + E-Commerce)</span>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-bakery-200 shadow-sm space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Sucursales Activas</span>
            <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <MapPin class="w-4 h-4" />
            </div>
          </div>
          <div class="text-2xl font-black text-gray-900">
            {{ metrics.totalSucursalesActivas }}
          </div>
          <span class="text-[11px] text-emerald-600 font-semibold">9 Departamentos de Bolivia</span>
        </div>

        <div class="bg-white p-6 rounded-3xl border border-bakery-200 shadow-sm space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Eficiencia de Horno</span>
            <div class="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Flame class="w-4 h-4" />
            </div>
          </div>
          <div class="text-2xl font-black text-gray-900">
            {{ metrics.produccion.estadoEficiencia }}
          </div>
          <span class="text-[11px] text-gray-500 font-medium">
            Merma de producción: {{ metrics.produccion.porcentajeMerma }}
          </span>
        </div>
      </div>

      <!-- Charts & Tables Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Sales per Department -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-bakery-200 shadow-sm space-y-4">
          <h3 class="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
            <MapPin class="w-5 h-5 text-amber-600" />
            Ventas por Departamento (Bs.)
          </h3>

          <div class="space-y-3 pt-2">
            <div
              v-for="(monto, depto) in metrics.ventasPorDepartamento"
              :key="depto"
              class="space-y-1 text-xs"
            >
              <div class="flex justify-between font-bold">
                <span class="text-gray-700">{{ depto }}</span>
                <span class="text-gray-900">Bs. {{ monto.toFixed(2) }}</span>
              </div>
              <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  class="bg-gradient-to-r from-amber-500 to-amber-700 h-full rounded-full transition-all duration-500"
                  :style="{ width: `${Math.min(100, Math.round((monto / (metrics.totalVentasBs || 1)) * 100))}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Selling Products -->
        <div class="bg-white p-6 sm:p-8 rounded-3xl border border-bakery-200 shadow-sm space-y-4">
          <h3 class="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
            <Award class="w-5 h-5 text-amber-600" />
            Panes & Masas Más Vendidos
          </h3>

          <div class="divide-y divide-gray-100 text-xs">
            <div
              v-for="(prod, idx) in metrics.topProductos"
              :key="prod.productoId"
              class="py-3 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <span
                  class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs"
                  :class="idx === 0 ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'"
                >
                  {{ idx + 1 }}
                </span>
                <div>
                  <p class="font-bold text-gray-900">{{ prod.nombre }}</p>
                  <p class="text-[11px] text-gray-500">{{ prod.unidadesVendidas }} unidades horneadas y vendidas</p>
                </div>
              </div>
              <div class="font-black text-gray-900">
                Bs. {{ prod.totalRecaudadoBs.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
