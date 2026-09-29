<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useOrderStore } from '@/stores/order.store';
import api from '@/services/api';
import type { Order } from '@/types';
import { Search, Package, Clock, CheckCircle2, Truck, FileText, Smartphone } from 'lucide-vue-next';

const orderStore = useOrderStore();
const searchQuery = ref('BOL-PED-1001');
const foundOrder = ref<Order | null>(null);
const recentOrders = ref<Order[]>([]);
const loading = ref(false);
const error = ref('');

onMounted(async () => {
  await loadRecentOrders();
  if (recentOrders.value.length > 0) {
    foundOrder.value = recentOrders.value[0];
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

async function searchOrder() {
  if (!searchQuery.value) return;
  loading.value = true;
  error.value = '';
  try {
    const order = await api.get<Order>(`/pedidos/${searchQuery.value.trim()}`);
    foundOrder.value = order;
  } catch (err: any) {
    error.value = err.message || 'No se encontró ningún pedido con ese código.';
    foundOrder.value = null;
  } finally {
    loading.value = false;
  }
}

function selectOrder(order: Order) {
  foundOrder.value = order;
  searchQuery.value = order.codigoPedido;
}

async function showInvoice(orderId: string) {
  await orderStore.emitInvoice(orderId);
}

function openQrModal(order: Order) {
  orderStore.currentOrder = order;
  orderStore.isQrModalOpen = true;
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
    <div class="text-center max-w-xl mx-auto space-y-2">
      <span class="text-[10px] font-semibold text-gold-600 uppercase tracking-[0.25em] bg-gold-100/60 border border-gold-300/40 px-3.5 py-1 rounded-full">
        Seguimiento en Tiempo Real
      </span>
      <h1 class="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
        Rastreo de Pedidos & Factura SIAT 📋
      </h1>
      <p class="text-xs sm:text-sm text-stone-600 font-light">
        Consulta el estado de horneada en solera, despacho y descarga tu factura computarizada oficial con código CUF.
      </p>
    </div>

    <!-- Search Bar -->
    <div class="max-w-xl mx-auto">
      <form @submit.prevent="searchOrder" class="relative flex items-center">
        <Search class="w-4 h-4 text-stone-400 absolute left-4" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Ingresa tu código BOL-PED-XXXX o ID..."
          class="w-full pl-11 pr-28 py-3.5 text-xs sm:text-sm bg-white rounded-xl border border-stone-200 shadow-sm focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 focus:outline-none font-mono text-stone-900 placeholder:text-stone-400"
        />
        <button
          type="submit"
          :disabled="loading"
          class="absolute right-2 bg-stone-900 hover:bg-gold-500 text-stone-100 hover:text-obsidian-950 font-semibold text-xs px-4 py-2 rounded-lg transition-all border border-stone-800"
        >
          {{ loading ? 'Buscando...' : 'Rastrear' }}
        </button>
      </form>
      <p v-if="error" class="text-rose-600 text-xs mt-2 text-center">{{ error }}</p>
    </div>

    <!-- Order Result Box -->
    <div v-if="foundOrder" class="max-w-3xl mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6">
      <!-- Order Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <span class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Código Oficial de Pedido</span>
          <h2 class="font-mono text-2xl font-bold text-stone-950 tracking-tight">{{ foundOrder.codigoPedido }}</h2>
          <p class="text-xs text-stone-500 mt-0.5 font-light">
            Destino: <strong class="text-stone-800 font-medium">{{ foundOrder.departamentoDestino }}</strong> ({{ foundOrder.ciudadDestino }})
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="px-3 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase"
            :class="foundOrder.estadoPago === 'PAGADO' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-gold-50 text-gold-800 border border-gold-200'"
          >
            Pago: {{ foundOrder.estadoPago }}
          </span>
          <span class="px-3 py-1 rounded-md bg-stone-100 text-stone-800 text-[11px] font-semibold uppercase tracking-wide border border-stone-200">
            Estado: {{ foundOrder.estado }}
          </span>
        </div>
      </div>

      <!-- Timeline Progress -->
      <div class="py-4">
        <div class="grid grid-cols-4 gap-2 text-center text-xs">
          <div class="space-y-1.5">
            <div class="w-8 h-8 rounded-full bg-stone-900 text-gold-300 flex items-center justify-center mx-auto shadow-sm border border-gold-500/30">
              <CheckCircle2 class="w-4 h-4" />
            </div>
            <span class="font-medium text-stone-900 block text-[11px]">Confirmado</span>
          </div>

          <div class="space-y-1.5">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center mx-auto shadow-sm transition-all"
              :class="['EN_HORNEADA', 'EMPACADO', 'EN_CAMINO', 'ENTREGADO'].includes(foundOrder.estado) ? 'bg-stone-900 text-gold-300 border border-gold-500/30' : 'bg-stone-100 text-stone-400 border border-stone-200'"
            >
              <Clock class="w-4 h-4" />
            </div>
            <span class="font-medium block text-[11px]" :class="['EN_HORNEADA', 'EMPACADO', 'EN_CAMINO', 'ENTREGADO'].includes(foundOrder.estado) ? 'text-stone-900 font-semibold' : 'text-stone-400'">
              En Horneada
            </span>
          </div>

          <div class="space-y-1.5">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center mx-auto shadow-sm transition-all"
              :class="['EN_CAMINO', 'ENTREGADO'].includes(foundOrder.estado) ? 'bg-stone-900 text-gold-300 border border-gold-500/30' : 'bg-stone-100 text-stone-400 border border-stone-200'"
            >
              <Truck class="w-4 h-4" />
            </div>
            <span class="font-medium block text-[11px]" :class="['EN_CAMINO', 'ENTREGADO'].includes(foundOrder.estado) ? 'text-stone-900 font-semibold' : 'text-stone-400'">
              En Reparto
            </span>
          </div>

          <div class="space-y-1.5">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center mx-auto shadow-sm transition-all"
              :class="foundOrder.estado === 'ENTREGADO' ? 'bg-emerald-600 text-white shadow-emerald-600/20' : 'bg-stone-100 text-stone-400 border border-stone-200'"
            >
              <Package class="w-4 h-4" />
            </div>
            <span class="font-medium block text-[11px]" :class="foundOrder.estado === 'ENTREGADO' ? 'text-stone-900 font-semibold' : 'text-stone-400'">
              Entregado
            </span>
          </div>
        </div>
      </div>

      <!-- Order Items Detail -->
      <div class="bg-stone-50 p-5 rounded-xl border border-stone-200/80 space-y-2.5 text-xs font-light">
        <h4 class="font-serif font-bold text-stone-900 border-b border-stone-200/80 pb-2">Contenido de la Canasta:</h4>
        <div v-for="item in foundOrder.items" :key="item.productoId" class="flex justify-between py-1 text-stone-700">
          <span>{{ item.cantidad }}x {{ item.nombreProducto }}</span>
          <span class="font-mono font-medium text-stone-900">Bs. {{ item.subtotalBs.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between border-t border-stone-200 pt-2 text-sm font-bold text-stone-950 font-serif">
          <span>Total Facturado:</span>
          <span class="font-mono">Bs. {{ foundOrder.totalBs.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        <button
          v-if="foundOrder.estadoPago === 'PENDIENTE' && foundOrder.qrSimpleDataUri"
          @click="openQrModal(foundOrder)"
          class="w-full sm:w-auto bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-semibold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition active:scale-95"
        >
          <Smartphone class="w-4 h-4" />
          Ver QR Simple para Pagar
        </button>

        <button
          @click="showInvoice(foundOrder.id)"
          class="w-full sm:w-auto bg-stone-900 hover:bg-gold-600 text-stone-100 hover:text-white font-medium py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition border border-stone-800 hover:border-gold-500"
        >
          <FileText class="w-4 h-4 text-gold-400" />
          Ver Factura Oficial SIAT (CUF)
        </button>
      </div>
    </div>

    <!-- Recent Orders Selector -->
    <div v-if="recentOrders.length > 0" class="max-w-3xl mx-auto space-y-3">
      <h3 class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
        Pedidos Registrados Recientemente:
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div
          v-for="ord in recentOrders.slice(0, 4)"
          :key="ord.id"
          @click="selectOrder(ord)"
          class="bg-white p-4 rounded-xl border border-stone-200 hover:border-gold-500/40 cursor-pointer shadow-sm hover:shadow-md transition-all space-y-1.5 group"
        >
          <div class="flex justify-between items-center text-xs">
            <span class="font-mono font-bold text-stone-900 group-hover:text-amber-900 transition-colors">{{ ord.codigoPedido }}</span>
            <span
              class="text-[9px] font-semibold px-2 py-0.5 rounded uppercase"
              :class="ord.estadoPago === 'PAGADO' ? 'bg-emerald-50 text-emerald-800' : 'bg-gold-50 text-gold-800'"
            >
              {{ ord.estadoPago }}
            </span>
          </div>
          <p class="text-xs text-stone-500 font-light truncate">{{ ord.clienteNombre }} • {{ ord.departamentoDestino }}</p>
          <p class="text-xs font-mono font-bold text-stone-900">Bs. {{ ord.totalBs.toFixed(2) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
