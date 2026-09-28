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
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    <div class="text-center max-w-xl mx-auto space-y-2">
      <span class="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">
        Seguimiento en Vivo
      </span>
      <h1 class="font-serif text-3xl sm:text-4xl font-black text-gray-900">
        Rastreo de Pedidos & Factura SIAT 📋
      </h1>
      <p class="text-xs sm:text-sm text-gray-600">
        Consulta el estado de horneada, despacho interdepartamental y descarga tu factura oficial con CUF.
      </p>
    </div>

    <!-- Search Bar -->
    <div class="max-w-xl mx-auto">
      <form @submit.prevent="searchOrder" class="relative flex items-center">
        <Search class="w-5 h-5 text-gray-400 absolute left-4" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Ingresa tu código BOL-PED-XXXX o ID..."
          class="w-full pl-12 pr-28 py-3.5 text-xs sm:text-sm bg-white rounded-2xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
        />
        <button
          type="submit"
          :disabled="loading"
          class="absolute right-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
        >
          {{ loading ? 'Buscando...' : 'Rastrear' }}
        </button>
      </form>
      <p v-if="error" class="text-rose-600 text-xs mt-2 text-center">{{ error }}</p>
    </div>

    <!-- Order Result Box -->
    <div v-if="foundOrder" class="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-bakery-200 space-y-6">
      <!-- Order Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Código de Pedido</span>
          <h2 class="font-mono text-2xl font-black text-bakery-950">{{ foundOrder.codigoPedido }}</h2>
          <p class="text-xs text-gray-500 mt-0.5">
            Destino: <strong>{{ foundOrder.departamentoDestino }}</strong> ({{ foundOrder.ciudadDestino }})
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="px-3 py-1 rounded-full text-xs font-bold"
            :class="foundOrder.estadoPago === 'PAGADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
          >
            Pago: {{ foundOrder.estadoPago }}
          </span>
          <span class="px-3 py-1 rounded-full bg-bakery-100 text-bakery-900 text-xs font-bold">
            Estado: {{ foundOrder.estado }}
          </span>
        </div>
      </div>

      <!-- Timeline Progress -->
      <div class="py-4">
        <div class="grid grid-cols-4 gap-2 text-center text-xs">
          <div class="space-y-1">
            <div class="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow">
              <CheckCircle2 class="w-4 h-4" />
            </div>
            <span class="font-bold text-gray-900 block text-[11px]">Confirmado</span>
          </div>

          <div class="space-y-1">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center mx-auto shadow"
              :class="['EN_HORNEADA', 'EMPACADO', 'EN_CAMINO', 'ENTREGADO'].includes(foundOrder.estado) ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'"
            >
              <Clock class="w-4 h-4" />
            </div>
            <span class="font-bold block text-[11px]" :class="['EN_HORNEADA', 'EMPACADO', 'EN_CAMINO', 'ENTREGADO'].includes(foundOrder.estado) ? 'text-gray-900' : 'text-gray-400'">
              Horneando
            </span>
          </div>

          <div class="space-y-1">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center mx-auto shadow"
              :class="['EN_CAMINO', 'ENTREGADO'].includes(foundOrder.estado) ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'"
            >
              <Truck class="w-4 h-4" />
            </div>
            <span class="font-bold block text-[11px]" :class="['EN_CAMINO', 'ENTREGADO'].includes(foundOrder.estado) ? 'text-gray-900' : 'text-gray-400'">
              En Reparto
            </span>
          </div>

          <div class="space-y-1">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center mx-auto shadow"
              :class="foundOrder.estado === 'ENTREGADO' ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'"
            >
              <Package class="w-4 h-4" />
            </div>
            <span class="font-bold block text-[11px]" :class="foundOrder.estado === 'ENTREGADO' ? 'text-gray-900' : 'text-gray-400'">
              Entregado
            </span>
          </div>
        </div>
      </div>

      <!-- Order Items Detail -->
      <div class="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
        <h4 class="font-bold text-gray-800 border-b border-gray-200 pb-2">Contenido de la Canasta:</h4>
        <div v-for="item in foundOrder.items" :key="item.productoId" class="flex justify-between py-1 text-gray-700">
          <span>{{ item.cantidad }}x {{ item.nombreProducto }}</span>
          <span class="font-bold">Bs. {{ item.subtotalBs.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between border-t border-gray-200 pt-2 text-sm font-black text-gray-900">
          <span>Total Pagado:</span>
          <span>Bs. {{ foundOrder.totalBs.toFixed(2) }}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
        <button
          v-if="foundOrder.estadoPago === 'PENDIENTE' && foundOrder.qrSimpleDataUri"
          @click="openQrModal(foundOrder)"
          class="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition"
        >
          <Smartphone class="w-4 h-4" />
          Ver QR Simple para Pagar
        </button>

        <button
          @click="showInvoice(foundOrder.id)"
          class="w-full sm:w-auto bg-bakery-900 hover:bg-bakery-800 text-amber-200 font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-2 shadow transition"
        >
          <FileText class="w-4 h-4 text-amber-400" />
          Ver Factura Oficial SIAT (CUF)
        </button>
      </div>
    </div>

    <!-- Recent Orders Selector -->
    <div v-if="recentOrders.length > 0" class="max-w-3xl mx-auto space-y-3">
      <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">
        Pedidos Recientes en el Sistema:
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="ord in recentOrders.slice(0, 4)"
          :key="ord.id"
          @click="selectOrder(ord)"
          class="bg-white p-4 rounded-2xl border border-gray-200 hover:border-amber-500 cursor-pointer shadow-sm transition space-y-1"
        >
          <div class="flex justify-between items-center text-xs">
            <span class="font-mono font-bold text-bakery-950">{{ ord.codigoPedido }}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" :class="ord.estadoPago === 'PAGADO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
              {{ ord.estadoPago }}
            </span>
          </div>
          <p class="text-xs text-gray-600 truncate">{{ ord.clienteNombre }} • {{ ord.departamentoDestino }}</p>
          <p class="text-xs font-black text-amber-900">Bs. {{ ord.totalBs.toFixed(2) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
