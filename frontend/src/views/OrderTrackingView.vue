<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useOrderStore } from '@/stores/order.store';
import { useToastStore } from '@/stores/toast.store';
import api from '@/services/api';
import type { Order } from '@/types';
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  FileText,
  Smartphone,
  Copy,
  Check,
  Flame,
  Wheat,
  ShieldCheck,
  MessageCircle,
  RefreshCw,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-vue-next';

const orderStore = useOrderStore();
const toastStore = useToastStore();

const searchQuery = ref('BOL-PED-1001');
const foundOrder = ref<Order | null>(null);
const recentOrders = ref<Order[]>([]);
const loading = ref(false);
const refreshing = ref(false);
const error = ref('');
const copiedCode = ref(false);

// Step definitions for the 5-step artisanal journey
const steps = [
  {
    key: 'CONFIRMADO',
    label: 'Pedido Confirmado',
    artisanDesc: 'Selección de harinas andinas y masa madre de 24 horas',
    icon: CheckCircle2,
    threshold: ['PENDIENTE', 'CONFIRMADO', 'EN_HORNEADA', 'EMPACADO', 'EN_CAMINO', 'ENTREGADO'],
  },
  {
    key: 'EN_HORNEADA',
    label: 'En Solera de Horneada',
    artisanDesc: 'Cocción sobre piedra refractaria viva a 240°C con inyección de vapor',
    icon: Flame,
    threshold: ['EN_HORNEADA', 'EMPACADO', 'EN_CAMINO', 'ENTREGADO'],
  },
  {
    key: 'EMPACADO',
    label: 'Reposo & Empaque Térmico',
    artisanDesc: 'Enfriamiento en canastos de mimbre y sellado en bolsa térmica anti-humedad',
    icon: Package,
    threshold: ['EMPACADO', 'EN_CAMINO', 'ENTREGADO'],
  },
  {
    key: 'EN_CAMINO',
    label: 'En Camino (Moto Térmica)',
    artisanDesc: 'Repartidor en trayecto con bolsón térmico para preservar crocancia',
    icon: Truck,
    threshold: ['EN_CAMINO', 'ENTREGADO'],
  },
  {
    key: 'ENTREGADO',
    label: 'Entregado en Mano',
    artisanDesc: 'Pan caliente en tu mesa con Factura Oficial Computarizada SIAT',
    icon: Sparkles,
    threshold: ['ENTREGADO'],
  },
];

onMounted(async () => {
  await loadRecentOrders();
  if (recentOrders.value.length > 0) {
    foundOrder.value = recentOrders.value[0];
    searchQuery.value = recentOrders.value[0].codigoPedido;
  }
});

async function loadRecentOrders() {
  try {
    const data = await api.get<Order[]>('/pedidos');
    recentOrders.value = data;
  } catch (err) {
    console.error('Error al cargar pedidos recientes:', err);
  }
}

async function searchOrder(isManual = false) {
  if (!searchQuery.value.trim()) return;
  if (isManual) refreshing.value = true;
  else loading.value = true;
  error.value = '';

  try {
    const order = await api.get<Order>(`/pedidos/${searchQuery.value.trim()}`);
    foundOrder.value = order;
    if (isManual) {
      toastStore.success('Estado Actualizado', `Pedido ${order.codigoPedido} sincronizado`);
    }
  } catch (err: any) {
    error.value = err.message || 'No se encontró ningún pedido con ese código o ID.';
    foundOrder.value = null;
    toastStore.error('Pedido No Encontrado', 'Verifica el código ingresado (ej. BOL-PED-1001)');
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

function selectOrder(order: Order) {
  foundOrder.value = order;
  searchQuery.value = order.codigoPedido;
}

async function copyOrderCode() {
  if (!foundOrder.value) return;
  await navigator.clipboard.writeText(foundOrder.value.codigoPedido);
  copiedCode.value = true;
  toastStore.info('Código Copiado', foundOrder.value.codigoPedido);
  setTimeout(() => (copiedCode.value = false), 2000);
}

async function showInvoice(orderId: string) {
  await orderStore.emitInvoice(orderId);
}

function openQrModal(order: Order) {
  orderStore.currentOrder = order;
  orderStore.isQrModalOpen = true;
}

const currentStepIndex = computed(() => {
  if (!foundOrder.value) return 0;
  const state = foundOrder.value.estado;
  if (state === 'ENTREGADO') return 4;
  if (state === 'EN_CAMINO') return 3;
  if (state === 'EMPACADO') return 2;
  if (state === 'EN_HORNEADA') return 1;
  return 0; // PENDIENTE o CONFIRMADO
});

const whatsappCourierLink = computed(() => {
  if (!foundOrder.value) return '#';
  const phone = '59170765432';
  const text = encodeURIComponent(
    `🥖 *Consulta de Despacho en Ruta - Panadería La Suprema*\n\n` +
      `¡Hola! Estoy haciendo seguimiento a mi pedido *${foundOrder.value.codigoPedido}*.\n` +
      `• Destino: ${foundOrder.value.direccionEntrega}, ${foundOrder.value.ciudadDestino} (${foundOrder.value.departamentoDestino})\n` +
      `• Estado actual: ${foundOrder.value.estado}\n` +
      `• Total: Bs. ${foundOrder.value.totalBs.toFixed(2)}\n\n` +
      `¿En qué punto del trayecto se encuentra el despacho? Muchas gracias.`
  );
  return `https://wa.me/${phone}?text=${text}`;
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
    <!-- Header -->
    <div class="text-center max-w-2xl mx-auto space-y-2">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 text-gold-700 text-[10px] font-semibold tracking-[0.2em] uppercase border border-gold-500/30">
        <Sparkles class="w-3.5 h-3.5 text-gold-600" />
        <span>Trazabilidad de Solera & Despacho Bolivia 🇧🇴</span>
      </div>

      <h1 class="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
        Rastreo de Pedidos & Facturación SIAT
      </h1>

      <p class="text-xs sm:text-sm text-stone-600 font-light max-w-xl mx-auto">
        Monitorea el ciclo completo: desde el amasado con masa madre y cocción a 240°C en solera, hasta el despacho en moto térmica y emisión tributaria con CUF oficial.
      </p>
    </div>

    <!-- Search Bar with Quick Autocomplete -->
    <div class="max-w-2xl mx-auto space-y-3">
      <form @submit.prevent="searchOrder(false)" class="relative flex items-center shadow-sm">
        <Search class="w-4 h-4 text-stone-400 absolute left-4" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Ingresa código (ej. BOL-PED-1001) o ID de pedido..."
          class="w-full pl-11 pr-32 py-3.5 text-xs sm:text-sm bg-white rounded-2xl border border-stone-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 focus:outline-none font-mono text-stone-900 placeholder:text-stone-400"
        />
        <button
          type="submit"
          :disabled="loading"
          class="absolute right-2 bg-stone-900 hover:bg-gold-500 text-stone-100 hover:text-obsidian-950 font-semibold text-xs px-5 py-2.5 rounded-xl transition-all border border-stone-800 disabled:opacity-50 active:scale-95"
        >
          {{ loading ? 'Buscando...' : 'Rastrear' }}
        </button>
      </form>

      <div v-if="recentOrders.length > 0" class="flex items-center gap-2 text-xs overflow-x-auto pb-1 scrollbar-none">
        <span class="text-[10px] text-stone-400 uppercase tracking-wider font-semibold whitespace-nowrap">
          Pedidos Recientes:
        </span>
        <button
          v-for="ord in recentOrders.slice(0, 4)"
          :key="ord.id"
          @click="selectOrder(ord)"
          class="px-2.5 py-1 rounded-lg text-[11px] font-mono transition border"
          :class="foundOrder?.id === ord.id ? 'bg-gold-500 text-obsidian-950 font-bold border-gold-400' : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200'"
        >
          {{ ord.codigoPedido }}
        </button>
      </div>

      <p v-if="error" class="text-rose-600 text-xs text-center flex items-center justify-center gap-1.5 pt-1">
        <AlertCircle class="w-3.5 h-3.5" /> {{ error }}
      </p>
    </div>

    <!-- Order Tracking Master Card -->
    <div
      v-if="foundOrder"
      class="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/90 space-y-8 animate-in fade-in duration-300"
    >
      <!-- Card Header: Code & Live Status Badges -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
        <div>
          <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest block mb-1">
            Código Oficial de Despacho
          </span>

          <div class="flex items-center gap-3">
            <h2 class="font-mono text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight">
              {{ foundOrder.codigoPedido }}
            </h2>

            <button
              @click="copyOrderCode"
              class="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition"
              title="Copiar código de pedido"
            >
              <Check v-if="copiedCode" class="w-4 h-4 text-emerald-600" />
              <Copy v-else class="w-4 h-4" />
            </button>
          </div>

          <p class="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
            <MapPin class="w-3.5 h-3.5 text-gold-600 shrink-0" />
            <span>Destino:</span>
            <strong class="text-stone-800 font-semibold">{{ foundOrder.direccionEntrega }}</strong>,
            <span>{{ foundOrder.ciudadDestino }} ({{ foundOrder.departamentoDestino }})</span>
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Payment Badge -->
          <span
            class="px-3 py-1 rounded-xl text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5 border"
            :class="foundOrder.estadoPago === 'PAGADO' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="foundOrder.estadoPago === 'PAGADO' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'"
            ></span>
            Pago: {{ foundOrder.estadoPago }}
          </span>

          <!-- Order Status Badge -->
          <span class="px-3 py-1 rounded-xl bg-stone-900 text-gold-300 text-xs font-mono font-semibold uppercase tracking-wide border border-stone-800">
            {{ foundOrder.estado.replace('_', ' ') }}
          </span>

          <button
            @click="searchOrder(true)"
            class="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
            title="Refrescar estado en vivo"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': refreshing }" />
          </button>
        </div>
      </div>

      <!-- 5-Step Artisanal Timeline -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <Flame class="w-4 h-4 text-gold-600" />
            Línea de Vida de la Solera Viva
          </span>

          <span class="text-[11px] font-mono text-stone-400">
            Paso {{ currentStepIndex + 1 }} de 5
          </span>
        </div>

        <!-- Desktop Horizontal Stepper -->
        <div class="hidden md:grid grid-cols-5 gap-3 relative">
          <!-- Track Hairline -->
          <div class="absolute top-4 left-6 right-6 h-0.5 bg-stone-200 z-0">
            <div
              class="h-full bg-gold-500 transition-all duration-700"
              :style="{ width: `${(currentStepIndex / 4) * 100}%` }"
            ></div>
          </div>

          <div
            v-for="(st, idx) in steps"
            :key="st.key"
            class="relative z-10 space-y-2 text-center"
          >
            <div
              class="w-9 h-9 rounded-full mx-auto flex items-center justify-center font-bold text-xs transition-all shadow-sm"
              :class="{
                'bg-emerald-600 text-white ring-4 ring-emerald-100': idx < currentStepIndex,
                'bg-obsidian-950 text-gold-300 ring-4 ring-gold-500/20 border border-gold-500/40': idx === currentStepIndex,
                'bg-white text-stone-400 border border-stone-200': idx > currentStepIndex,
              }"
            >
              <Check v-if="idx < currentStepIndex" class="w-4 h-4" />
              <component v-else :is="st.icon" class="w-4 h-4" />
            </div>

            <div>
              <p
                class="text-xs font-bold leading-tight"
                :class="idx <= currentStepIndex ? 'text-stone-900' : 'text-stone-400'"
              >
                {{ st.label }}
              </p>
              <p class="text-[10px] text-stone-500 font-light mt-0.5 line-clamp-2">
                {{ st.artisanDesc }}
              </p>
            </div>
          </div>
        </div>

        <!-- Mobile Vertical Stepper -->
        <div class="md:hidden space-y-4">
          <div
            v-for="(st, idx) in steps"
            :key="st.key"
            class="flex items-start gap-3.5"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all shadow-sm mt-0.5"
              :class="{
                'bg-emerald-600 text-white': idx < currentStepIndex,
                'bg-obsidian-950 text-gold-300 border border-gold-500/40': idx === currentStepIndex,
                'bg-white text-stone-400 border border-stone-200': idx > currentStepIndex,
              }"
            >
              <Check v-if="idx < currentStepIndex" class="w-3.5 h-3.5" />
              <component v-else :is="st.icon" class="w-3.5 h-3.5" />
            </div>

            <div class="flex-1">
              <p
                class="text-xs font-bold"
                :class="idx <= currentStepIndex ? 'text-stone-900' : 'text-stone-400'"
              >
                {{ st.label }}
              </p>
              <p class="text-[11px] text-stone-500 font-light">
                {{ st.artisanDesc }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Items Detail & Invoice Breakdown -->
      <div class="bg-stone-50 p-6 rounded-2xl border border-stone-200/90 space-y-4">
        <h4 class="font-serif text-sm font-bold text-stone-900 border-b border-stone-200 pb-2 flex items-center justify-between">
          <span>Contenido de la Canasta</span>
          <span class="text-xs font-mono text-stone-400 font-light">{{ foundOrder.items.length }} variedades</span>
        </h4>

        <div class="divide-y divide-stone-200/60 text-xs">
          <div
            v-for="item in foundOrder.items"
            :key="item.productoId"
            class="py-2.5 flex items-center justify-between"
          >
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-stone-900 w-6">{{ item.cantidad }}x</span>
              <span class="font-medium text-stone-800">{{ item.nombreProducto }}</span>
            </div>
            <span class="font-mono font-bold text-stone-900">Bs. {{ item.subtotalBs.toFixed(2) }}</span>
          </div>

          <div v-if="foundOrder.costoEnvioBs > 0" class="py-2 flex items-center justify-between text-stone-600">
            <span class="flex items-center gap-1.5">
              <Truck class="w-3.5 h-3.5 text-gold-600" />
              Flete Despacho Térmico a {{ foundOrder.departamentoDestino }}
            </span>
            <span class="font-mono font-bold text-stone-900">Bs. {{ foundOrder.costoEnvioBs.toFixed(2) }}</span>
          </div>
        </div>

        <div class="flex justify-between items-center border-t border-stone-200 pt-3 text-base font-bold text-stone-950 font-serif">
          <span>Total Liquidado en Bolivianos:</span>
          <span class="font-mono text-xl text-stone-900">Bs. {{ foundOrder.totalBs.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Technical Freshness & Dispatch Assurance -->
      <div class="bg-gradient-to-r from-amber-50 to-orange-50/40 p-4 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
        <Wheat class="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div class="space-y-0.5">
          <h5 class="font-bold text-xs">Garantía de Crocancia & Temperatura</h5>
          <p class="text-[11px] text-amber-800 font-light leading-relaxed">
            Nuestros despachos se efectúan en caja isotérmica sellada dentro de los 30 a 45 minutos posteriores al deshorne. Para conservar la corteza crujiente, mantenga las piezas en la bolsa de papel kraft incluida.
          </p>
        </div>
      </div>

      <!-- Action Buttons Bar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <a
          :href="whatsappCourierLink"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3 px-5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
        >
          <MessageCircle class="w-4 h-4" />
          <span>Contactar Repartidor por WhatsApp</span>
        </a>

        <div class="flex w-full sm:w-auto items-center gap-2.5">
          <button
            v-if="foundOrder.estadoPago === 'PENDIENTE'"
            @click="openQrModal(foundOrder)"
            class="flex-1 sm:flex-none bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition active:scale-95"
          >
            <Smartphone class="w-4 h-4" />
            <span>Pagar Pedido</span>
          </button>

          <button
            @click="showInvoice(foundOrder.id)"
            class="flex-1 sm:flex-none bg-obsidian-950 hover:bg-gold-600 text-gold-300 hover:text-white font-semibold py-3 px-5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition border border-gold-500/30"
          >
            <FileText class="w-4 h-4 text-gold-400" />
            <span>Ver Factura SIAT (CUF)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
