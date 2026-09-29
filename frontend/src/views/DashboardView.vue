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
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
      <div>
        <div class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-100/60 text-gold-700 text-[10px] font-semibold tracking-[0.2em] uppercase mb-2 border border-gold-300/40">
          <Sparkles class="w-3 h-3 text-gold-600" />
          <span>Analítica Ejecutiva de Panadería Boliviana</span>
        </div>
        <h1 class="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          Tablero Gerencial de Ventas & Hornadas 📊
        </h1>
        <p class="text-xs sm:text-sm text-stone-600 font-light mt-1">
          Métricas consolidadas en Bolivianos (BOB - Bs.) en tiempo real para directores de producción y gerentes de boutique.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs bg-stone-900 text-gold-300 border border-stone-800 px-3.5 py-1.5 rounded-xl font-mono font-semibold shadow-sm">
          Moneda: BOB (Bolivianos - Bs.)
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-24">
      <div class="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-xs uppercase tracking-widest text-stone-500 font-medium">Consolidando métricas de los 9 departamentos...</p>
    </div>

    <div v-else-if="metrics" class="space-y-8">
      <!-- 4 Key Metric Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Facturación Bruta</span>
            <div class="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center font-mono font-bold text-xs border border-stone-200">
              Bs
            </div>
          </div>
          <div class="text-2xl font-mono font-bold text-stone-950">
            Bs. {{ metrics.totalVentasBs.toFixed(2) }}
          </div>
          <span class="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <TrendingUp class="w-3.5 h-3.5" /> Ventas Facturadas SIAT
          </span>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Pedidos Omnicanal</span>
            <div class="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center font-bold border border-stone-200">
              <ShoppingBag class="w-4 h-4 text-stone-700" />
            </div>
          </div>
          <div class="text-2xl font-mono font-bold text-stone-950">
            {{ metrics.totalPedidosRegistrados }}
          </div>
          <span class="text-[11px] text-stone-500 font-light">Boutique Mostrador + E-Commerce</span>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Boutiques Activas</span>
            <div class="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center font-bold border border-stone-200">
              <MapPin class="w-4 h-4 text-stone-700" />
            </div>
          </div>
          <div class="text-2xl font-mono font-bold text-stone-950">
            {{ metrics.totalSucursalesActivas }}
          </div>
          <span class="text-[11px] text-stone-500 font-light">9 Departamentos de Bolivia</span>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Control de Mermas</span>
            <div class="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center font-bold border border-stone-200">
              <Flame class="w-4 h-4 text-stone-700" />
            </div>
          </div>
          <div class="text-2xl font-mono font-bold text-stone-950">
            {{ metrics.produccion.estadoEficiencia }}
          </div>
          <span class="text-[11px] text-stone-500 font-light">
            Merma técnica: <strong class="text-stone-700 font-mono">{{ metrics.produccion.porcentajeMerma }}</strong>
          </span>
        </div>
      </div>

      <!-- Charts & Tables Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Sales per Department -->
        <div class="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
          <h3 class="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
            <MapPin class="w-4 h-4 text-gold-600" />
            Ventas Consolidadas por Departamento (Bs.)
          </h3>

          <div class="space-y-3.5 pt-2">
            <div
              v-for="(monto, depto) in metrics.ventasPorDepartamento"
              :key="depto"
              class="space-y-1.5 text-xs"
            >
              <div class="flex justify-between font-medium">
                <span class="text-stone-700">{{ depto }}</span>
                <span class="font-mono font-bold text-stone-900">Bs. {{ monto.toFixed(2) }}</span>
              </div>
              <div class="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div
                  class="bg-gradient-to-r from-stone-900 to-gold-500 h-full rounded-full transition-all duration-500"
                  :style="{ width: `${Math.min(100, Math.round((monto / (metrics.totalVentasBs || 1)) * 100))}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Selling Products -->
        <div class="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
          <h3 class="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
            <Award class="w-4 h-4 text-gold-600" />
            Piezas de Panadería Más Demandadas
          </h3>

          <div class="divide-y divide-stone-100 text-xs">
            <div
              v-for="(prod, idx) in metrics.topProductos"
              :key="prod.productoId"
              class="py-3 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <span
                  class="w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-[11px]"
                  :class="idx === 0 ? 'bg-stone-900 text-gold-300 border border-gold-500/40' : 'bg-stone-100 text-stone-600'"
                >
                  {{ idx + 1 }}
                </span>
                <div>
                  <p class="font-medium text-stone-900">{{ prod.nombre }}</p>
                  <p class="text-[11px] text-stone-400 font-light">{{ prod.unidadesVendidas }} piezas horneadas y vendidas</p>
                </div>
              </div>
              <div class="font-mono font-bold text-stone-950">
                Bs. {{ prod.totalRecaudadoBs.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
