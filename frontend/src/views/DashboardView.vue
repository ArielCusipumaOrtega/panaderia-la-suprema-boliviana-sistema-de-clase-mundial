<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';
import { useToastStore } from '@/stores/toast.store';
import type {
  DashboardMetrics,
  ProductionBatch,
  RawMaterial,
  DepartmentSalesData,
} from '@/types';
import {
  TrendingUp,
  MapPin,
  Flame,
  ShoppingBag,
  Award,
  Sparkles,
  RefreshCw,
  Clock,
  Wheat,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  Layers,
  Banknote,
  Smartphone,
  CreditCard,
  ChefHat,
  Thermometer,
  ShieldCheck,
  Building,
} from 'lucide-vue-next';

const toastStore = useToastStore();

const metrics = ref<DashboardMetrics | null>(null);
const batches = ref<ProductionBatch[]>([]);
const rawMaterials = ref<RawMaterial[]>([]);
const loading = ref(true);
const refreshing = ref(false);

const activeTab = ref<'VENTAS' | 'HORNADAS' | 'INSUMOS'>('VENTAS');
const selectedTurno = ref<string>('TODOS');
const selectedBatchStatus = ref<string>('TODOS');

async function fetchData(isManual = false) {
  if (isManual) refreshing.value = true;
  else loading.value = true;

  try {
    const [metricsData, batchesData, materialsData] = await Promise.all([
      api.get<DashboardMetrics>('/analitica/dashboard'),
      api.get<ProductionBatch[]>('/produccion/lotes').catch(() => []),
      api.get<RawMaterial[]>('/produccion/materia-prima').catch(() => []),
    ]);

    metrics.value = metricsData;
    batches.value = batchesData;
    rawMaterials.value = materialsData;

    if (isManual) {
      toastStore.success('Métricas Actualizadas', 'Consolidación de los 9 departamentos sincronizada');
    }
  } catch (err: any) {
    console.error('Error al cargar datos del tablero:', err);
    toastStore.error('Error de Sincronización', err.message || 'No se pudo cargar la analítica');
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

onMounted(() => {
  fetchData();
});

// Helper for departmental sales
function getDeptAmount(item: DepartmentSalesData | number | undefined): number {
  if (item === undefined || item === null) return 0;
  return typeof item === 'number' ? item : item.totalBs;
}

function getDeptOrders(item: DepartmentSalesData | number | undefined): number {
  if (!item || typeof item === 'number') return 0;
  return item.cantidadPedidos || 0;
}

// Sorted departments by sales
const sortedDepartments = computed(() => {
  if (!metrics.value?.ventasPorDepartamento) return [];
  const entries = Object.entries(metrics.value.ventasPorDepartamento);
  return entries
    .map(([depto, data]) => ({
      depto,
      monto: getDeptAmount(data),
      pedidos: getDeptOrders(data),
    }))
    .sort((a, b) => b.monto - a.monto);
});

// Average Ticket in Bolivianos
const averageTicketBs = computed(() => {
  if (!metrics.value || metrics.value.totalPedidosRegistrados === 0) return 0;
  return metrics.value.totalVentasBs / metrics.value.totalPedidosRegistrados;
});

// Filtered Batches
const filteredBatches = computed(() => {
  return batches.value.filter((b) => {
    const matchTurno = selectedTurno.value === 'TODOS' || b.turno === selectedTurno.value;
    const matchStatus = selectedBatchStatus.value === 'TODOS' || b.estado === selectedBatchStatus.value;
    return matchTurno && matchStatus;
  });
});

// Critical raw materials
const criticalMaterials = computed(() => {
  return rawMaterials.value.filter((m) => m.stockActual <= m.stockMinimoAlerta);
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    <!-- Executive Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
      <div class="space-y-1">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 text-gold-700 text-[10px] font-semibold tracking-[0.2em] uppercase border border-gold-500/30">
          <Sparkles class="w-3.5 h-3.5 text-gold-600" />
          <span>Dirección General de Operaciones • Bolivia</span>
        </div>
        <h1 class="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          Tablero Gerencial de Producción & Ventas 📊
        </h1>
        <p class="text-xs sm:text-sm text-stone-600 font-light">
          Supervisión consolidada en tiempo real: hornadas de solera, control técnico de mermas y facturación SIAT en los 9 departamentos.
        </p>
      </div>

      <!-- Live Actions -->
      <div class="flex items-center gap-3">
        <button
          @click="fetchData(true)"
          :disabled="refreshing"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold border border-stone-200 shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw class="w-3.5 h-3.5 text-gold-600" :class="{ 'animate-spin': refreshing }" />
          <span>{{ refreshing ? 'Actualizando...' : 'Actualizar Datos' }}</span>
        </button>

        <span class="text-xs bg-stone-900 text-gold-300 border border-stone-800 px-3.5 py-2 rounded-xl font-mono font-bold shadow-sm flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          BOB (Bs.)
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-24 bg-white rounded-3xl border border-stone-200/90 shadow-sm">
      <div class="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-xs uppercase tracking-widest text-stone-500 font-medium">Consolidando métricas de hornadas y ventas nacionales...</p>
    </div>

    <div v-else-if="metrics" class="space-y-8">
      <!-- 5 Key Executive Metric Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- 1. Facturación Bruta -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-2 relative overflow-hidden group hover:border-gold-500/40 transition">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Facturación Bruta</span>
            <div class="w-7 h-7 rounded-lg bg-gold-50 text-gold-700 flex items-center justify-center font-mono font-bold text-xs border border-gold-200">
              Bs
            </div>
          </div>
          <div class="text-2xl font-mono font-bold text-stone-950">
            Bs. {{ metrics.totalVentasBs.toFixed(2) }}
          </div>
          <span class="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <TrendingUp class="w-3.5 h-3.5" /> 100% Facturado SIAT / SIN
          </span>
        </div>

        <!-- 2. Pedidos y Ticket Promedio -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-2 relative overflow-hidden group hover:border-gold-500/40 transition">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Pedidos Totales</span>
            <div class="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200">
              <ShoppingBag class="w-3.5 h-3.5" />
            </div>
          </div>
          <div class="text-2xl font-mono font-bold text-stone-950">
            {{ metrics.totalPedidosRegistrados }}
          </div>
          <span class="text-[11px] text-stone-500 font-light">
            Ticket Promedio: <strong class="text-stone-800 font-mono">Bs. {{ averageTicketBs.toFixed(2) }}</strong>
          </span>
        </div>

        <!-- 3. Hornadas & Piezas -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-2 relative overflow-hidden group hover:border-gold-500/40 transition">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Piezas Producidas</span>
            <div class="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200">
              <ChefHat class="w-3.5 h-3.5" />
            </div>
          </div>
          <div class="text-2xl font-mono font-bold text-stone-950">
            {{ metrics.produccion.totalPiezasObtenidas }}
          </div>
          <span class="text-[11px] text-stone-500 font-light">
            Planeadas: <strong class="text-stone-700 font-mono">{{ metrics.produccion.totalPiezasPlaneadas }}</strong>
          </span>
        </div>

        <!-- 4. Control de Mermas -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-2 relative overflow-hidden group hover:border-gold-500/40 transition">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Merma de Solera</span>
            <div class="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200">
              <Flame class="w-3.5 h-3.5" />
            </div>
          </div>
          <div class="text-2xl font-mono font-bold text-stone-950 flex items-center gap-2">
            <span>{{ metrics.produccion.porcentajeMerma }}</span>
            <span
              class="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold"
              :class="metrics.produccion.estadoEficiencia === 'EXCELENTE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
            >
              {{ metrics.produccion.estadoEficiencia }}
            </span>
          </div>
          <span class="text-[11px] text-stone-500 font-light">
            Mermas: <strong class="text-stone-700 font-mono">{{ metrics.produccion.totalMermas }} piezas</strong>
          </span>
        </div>

        <!-- 5. Sucursales & Alertas -->
        <div class="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-2 relative overflow-hidden group hover:border-gold-500/40 transition">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Boutiques Activas</span>
            <div class="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200">
              <Building class="w-3.5 h-3.5" />
            </div>
          </div>
          <div class="text-2xl font-mono font-bold text-stone-950">
            {{ metrics.totalSucursalesActivas }}
          </div>
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-stone-500">9 Departamentos</span>
            <span
              v-if="criticalMaterials.length > 0"
              class="text-amber-700 font-semibold flex items-center gap-1"
            >
              <AlertTriangle class="w-3 h-3" /> {{ criticalMaterials.length }} alerta stock
            </span>
            <span v-else class="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 class="w-3 h-3" /> Stock óptimo
            </span>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-stone-200/90 pb-2">
        <button
          @click="activeTab = 'VENTAS'"
          class="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2"
          :class="activeTab === 'VENTAS' ? 'bg-stone-900 text-gold-300 shadow-sm border border-stone-800' : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'"
        >
          <TrendingUp class="w-3.5 h-3.5" />
          <span>Ventas & Finanzas SIAT</span>
        </button>

        <button
          @click="activeTab = 'HORNADAS'"
          class="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2"
          :class="activeTab === 'HORNADAS' ? 'bg-stone-900 text-gold-300 shadow-sm border border-stone-800' : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'"
        >
          <Flame class="w-3.5 h-3.5" />
          <span>Lotes de Hornada & Mermas</span>
          <span class="ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-stone-800 text-gold-300">
            {{ batches.length }}
          </span>
        </button>

        <button
          @click="activeTab = 'INSUMOS'"
          class="px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2"
          :class="activeTab === 'INSUMOS' ? 'bg-stone-900 text-gold-300 shadow-sm border border-stone-800' : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'"
        >
          <Wheat class="w-3.5 h-3.5" />
          <span>Materia Prima & Reposición</span>
          <span
            v-if="criticalMaterials.length > 0"
            class="ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-amber-500 text-stone-950 font-bold"
          >
            {{ criticalMaterials.length }}
          </span>
        </button>
      </div>

      <!-- TAB 1: VENTAS & FINANZAS SIAT -->
      <div v-if="activeTab === 'VENTAS'" class="space-y-8 animate-in fade-in duration-200">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Left: Sales per Department -->
          <div class="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/90 shadow-sm space-y-5">
            <div class="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 class="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <MapPin class="w-4 h-4 text-gold-600" />
                Ventas Consolidadas por Departamento (Bs.)
              </h3>
              <span class="text-[11px] font-mono text-stone-400">9 Departamentos</span>
            </div>

            <div class="space-y-3.5">
              <div
                v-for="(item, idx) in sortedDepartments"
                :key="item.depto"
                class="space-y-1.5 text-xs"
              >
                <div class="flex justify-between items-center font-medium">
                  <div class="flex items-center gap-2">
                    <span
                      class="w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold"
                      :class="idx === 0 ? 'bg-gold-500 text-obsidian-950' : 'bg-stone-100 text-stone-600'"
                    >
                      {{ idx + 1 }}
                    </span>
                    <span class="text-stone-800 font-semibold">{{ item.depto }}</span>
                    <span v-if="item.pedidos > 0" class="text-[10px] text-stone-400 font-light">
                      ({{ item.pedidos }} pedidos)
                    </span>
                  </div>

                  <span class="font-mono font-bold text-stone-900">
                    Bs. {{ item.monto.toFixed(2) }}
                  </span>
                </div>

                <!-- Progress Bar -->
                <div class="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div
                    class="bg-gradient-to-r from-stone-900 via-amber-700 to-gold-500 h-full rounded-full transition-all duration-700"
                    :style="{
                      width: `${Math.max(
                        2,
                        Math.min(100, Math.round((item.monto / (metrics.totalVentasBs || 1)) * 100))
                      )}%`,
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Payment Methods Breakdown & Top Selling Items -->
          <div class="lg:col-span-5 space-y-6">
            <!-- Payment Methods Breakdown -->
            <div class="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/90 shadow-sm space-y-4">
              <h3 class="font-serif text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                <PieChart class="w-4 h-4 text-gold-600" />
                Ventas por Pasarela de Pago
              </h3>

              <div class="space-y-3 pt-1">
                <!-- QR Simple -->
                <div class="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div class="flex items-center gap-2.5">
                    <Smartphone class="w-4 h-4 text-gold-600" />
                    <div>
                      <p class="text-xs font-semibold text-stone-900">QR Simple BCB</p>
                      <p class="text-[10px] text-stone-400">Interoperable Interbancario</p>
                    </div>
                  </div>
                  <span class="font-mono font-bold text-xs text-stone-900">
                    Bs. {{ (metrics.ventasPorMetodoPago['QR_SIMPLE'] || 0).toFixed(2) }}
                  </span>
                </div>

                <!-- Tigo Money -->
                <div class="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div class="flex items-center gap-2.5">
                    <Smartphone class="w-4 h-4 text-blue-600" />
                    <div>
                      <p class="text-xs font-semibold text-stone-900">Tigo Money Bolivia</p>
                      <p class="text-[10px] text-stone-400">Billetera móvil celular</p>
                    </div>
                  </div>
                  <span class="font-mono font-bold text-xs text-stone-900">
                    Bs. {{ (metrics.ventasPorMetodoPago['TIGO_MONEY'] || 0).toFixed(2) }}
                  </span>
                </div>

                <!-- Efectivo Contra Entrega -->
                <div class="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div class="flex items-center gap-2.5">
                    <Banknote class="w-4 h-4 text-emerald-600" />
                    <div>
                      <p class="text-xs font-semibold text-stone-900">Efectivo contra Entrega</p>
                      <p class="text-[10px] text-stone-400">Cobro en puerta al cliente</p>
                    </div>
                  </div>
                  <span class="font-mono font-bold text-xs text-stone-900">
                    Bs. {{ (metrics.ventasPorMetodoPago['EFECTIVO_CONTRAENTREGA'] || 0).toFixed(2) }}
                  </span>
                </div>

                <!-- Tarjeta Red Enlace -->
                <div class="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <div class="flex items-center gap-2.5">
                    <CreditCard class="w-4 h-4 text-stone-700" />
                    <div>
                      <p class="text-xs font-semibold text-stone-900">Tarjeta Débito/Crédito</p>
                      <p class="text-[10px] text-stone-400">Red Enlace / Red Abierta</p>
                    </div>
                  </div>
                  <span class="font-mono font-bold text-xs text-stone-900">
                    Bs. {{ (metrics.ventasPorMetodoPago['TARJETA'] || 0).toFixed(2) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Top Selling Artisanal Products -->
            <div class="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/90 shadow-sm space-y-4">
              <h3 class="font-serif text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                <Award class="w-4 h-4 text-gold-600" />
                Piezas Insignia Más Demandadas
              </h3>

              <div class="divide-y divide-stone-100 text-xs">
                <div
                  v-for="(prod, idx) in metrics.topProductos"
                  :key="prod.productoId || idx"
                  class="py-2.5 flex items-center justify-between"
                >
                  <div class="flex items-center gap-3">
                    <span
                      class="w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-[11px]"
                      :class="idx === 0 ? 'bg-obsidian-950 text-gold-300 border border-gold-500/40' : 'bg-stone-100 text-stone-600'"
                    >
                      {{ idx + 1 }}
                    </span>
                    <div>
                      <p class="font-medium text-stone-900 leading-snug">{{ prod.nombre }}</p>
                      <p class="text-[10px] text-stone-400 font-light">
                        {{ prod.unidades || prod.unidadesVendidas || 0 }} piezas vendidas
                      </p>
                    </div>
                  </div>
                  <div class="font-mono font-bold text-stone-950">
                    Bs. {{ (prod.totalBs || prod.totalRecaudadoBs || 0).toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: HORNADAS & CONTROL DE MERMAS -->
      <div v-else-if="activeTab === 'HORNADAS'" class="space-y-6 animate-in fade-in duration-200">
        <!-- Sub-filter bar -->
        <div class="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-stone-600 uppercase tracking-wider">Filtrar por Turno:</span>
            <div class="flex gap-1">
              <button
                v-for="turno in ['TODOS', 'MADRUGADA', 'TARDE', 'NOCTURNO']"
                :key="turno"
                @click="selectedTurno = turno"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition"
                :class="selectedTurno === turno ? 'bg-stone-900 text-gold-300 font-semibold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'"
              >
                {{ turno }}
              </button>
            </div>
          </div>

          <div class="text-xs text-stone-500 flex items-center gap-2">
            <Flame class="w-4 h-4 text-amber-600" />
            <span>Estándar de calidad: Hornos de solera refractaria a <strong>220°C - 240°C</strong></span>
          </div>
        </div>

        <!-- Production Batches Table -->
        <div class="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-stone-100 flex items-center justify-between">
            <h3 class="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
              <Layers class="w-4 h-4 text-gold-600" />
              Lotes de Producción & Registro Técnico de Solera
            </h3>
            <span class="text-xs font-mono text-stone-400">{{ filteredBatches.length }} lotes activos</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="bg-stone-50 border-b border-stone-200/80 text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
                <tr>
                  <th class="py-3 px-4">Código Lote</th>
                  <th class="py-3 px-4">Pieza / Variedad</th>
                  <th class="py-3 px-4">Sucursal</th>
                  <th class="py-3 px-4">Turno</th>
                  <th class="py-3 px-4">Temp. Horno</th>
                  <th class="py-3 px-4 text-center">Planeadas / Obtenidas</th>
                  <th class="py-3 px-4 text-center">Merma Unid.</th>
                  <th class="py-3 px-4">Maestro Panadero</th>
                  <th class="py-3 px-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-100">
                <tr
                  v-for="b in filteredBatches"
                  :key="b.id"
                  class="hover:bg-stone-50/80 transition"
                >
                  <td class="py-3 px-4 font-mono font-bold text-stone-900">
                    {{ b.codigoLote }}
                  </td>
                  <td class="py-3 px-4 font-medium text-stone-800">
                    {{ b.productoNombre }}
                  </td>
                  <td class="py-3 px-4 text-stone-600">
                    {{ b.sucursalNombre }}
                  </td>
                  <td class="py-3 px-4">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider"
                      :class="{
                        'bg-blue-100 text-blue-800': b.turno === 'MADRUGADA',
                        'bg-amber-100 text-amber-800': b.turno === 'TARDE',
                        'bg-indigo-100 text-indigo-800': b.turno === 'NOCTURNO',
                      }"
                    >
                      {{ b.turno }}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-mono font-medium text-stone-700">
                    <span class="flex items-center gap-1">
                      <Thermometer class="w-3.5 h-3.5 text-amber-600" />
                      {{ b.temperaturaHornoC }}°C
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center font-mono">
                    <span class="text-stone-500">{{ b.cantidadPlaneada }}</span> /
                    <span class="font-bold text-stone-900">{{ b.cantidadObtenida }}</span>
                  </td>
                  <td class="py-3 px-4 text-center font-mono font-semibold" :class="b.mermaUnidades > 2 ? 'text-amber-700' : 'text-stone-600'">
                    {{ b.mermaUnidades }} pzs
                  </td>
                  <td class="py-3 px-4 text-stone-600 font-light">
                    {{ b.maestroPanadero }}
                  </td>
                  <td class="py-3 px-4 text-right">
                    <span
                      class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
                      :class="{
                        'bg-emerald-100 text-emerald-800': b.estado === 'FINALIZADO_CONFORME',
                        'bg-amber-100 text-amber-900 animate-pulse': b.estado === 'EN_HORNEADA',
                        'bg-stone-100 text-stone-700': b.estado === 'PROGRAMADO',
                      }"
                    >
                      <span v-if="b.estado === 'EN_HORNEADA'" class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                      {{ b.estado.replace('_', ' ') }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 3: MATERIA PRIMA & ALERTAS DE REPOSICIÓN -->
      <div v-else-if="activeTab === 'INSUMOS'" class="space-y-6 animate-in fade-in duration-200">
        <!-- Critical Alert Banner if any -->
        <div
          v-if="criticalMaterials.length > 0"
          class="bg-amber-50 p-5 rounded-2xl border border-amber-200 text-amber-900 flex items-start gap-3.5"
        >
          <AlertTriangle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <h4 class="font-bold text-sm">Atención: Insumos de Panadería Bajo Stock Mínimo</h4>
            <p class="text-xs font-light text-amber-800">
              Se detectaron <strong>{{ criticalMaterials.length }} materias primas</strong> por debajo del umbral de seguridad para mantener la producción continua de las próximas hornadas.
            </p>
          </div>
        </div>

        <!-- Raw Materials Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="mat in rawMaterials"
            :key="mat.id"
            class="bg-white p-5 rounded-2xl border transition-all shadow-sm space-y-3"
            :class="mat.stockActual <= mat.stockMinimoAlerta ? 'border-amber-300 ring-1 ring-amber-300 bg-amber-50/20' : 'border-stone-200/90'"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-stone-900 truncate max-w-[200px]">{{ mat.nombre }}</span>
              <span
                class="text-[9px] uppercase px-2 py-0.5 rounded font-bold"
                :class="mat.stockActual <= mat.stockMinimoAlerta ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'"
              >
                {{ mat.stockActual <= mat.stockMinimoAlerta ? 'Alerta Reposición' : 'Stock Óptimo' }}
              </span>
            </div>

            <div class="space-y-1">
              <div class="flex justify-between text-xs font-mono">
                <span class="text-stone-500">Disponible:</span>
                <span class="font-bold text-stone-900">{{ mat.stockActual }} {{ mat.unidad }}</span>
              </div>
              <div class="flex justify-between text-xs font-mono">
                <span class="text-stone-500">Mínimo de Seguridad:</span>
                <span class="text-stone-600">{{ mat.stockMinimoAlerta }} {{ mat.unidad }}</span>
              </div>
              <div class="flex justify-between text-xs font-mono">
                <span class="text-stone-500">Costo Unitario:</span>
                <span class="text-stone-700">Bs. {{ mat.costoUnitarioBs.toFixed(2) }} / {{ mat.unidad }}</span>
              </div>
            </div>

            <!-- Stock Progress Gauge -->
            <div class="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="mat.stockActual <= mat.stockMinimoAlerta ? 'bg-amber-500' : 'bg-emerald-600'"
                :style="{
                  width: `${Math.min(100, Math.round((mat.stockActual / (mat.stockMinimoAlerta * 2 || 1)) * 100))}%`,
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
