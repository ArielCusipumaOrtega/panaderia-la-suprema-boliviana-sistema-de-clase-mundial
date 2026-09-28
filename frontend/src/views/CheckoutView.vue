<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart.store';
import { useOrderStore } from '@/stores/order.store';
import { useAuthStore } from '@/stores/auth.store';
import {
  Trash2,
  Plus,
  Minus,
  Truck,
  Smartphone,
  CreditCard,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-vue-next';
import type { DepartamentoBolivia } from '@/types';

const router = useRouter();
const cartStore = useCartStore();
const orderStore = useOrderStore();
const authStore = useAuthStore();

const clienteNombre = ref(authStore.user?.nombreCompleto || 'Andrea Villarroel Rojas');
const clienteTelefono = ref(authStore.user?.telefono || '+591 70765432');
const clienteCiNit = ref(authStore.user?.ciNit || '5543210-CB');
const razonSocialFactura = ref(authStore.user?.nombreCompleto || 'Andrea Villarroel');
const direccionEntrega = ref(authStore.user?.direccion || 'Av. Las Américas #320');
const referenciaDireccion = ref('Frente al parque principal');
const observaciones = ref('');
const metodoPago = ref<'QR_SIMPLE' | 'TIGO_MONEY' | 'EFECTIVO_CONTRAENTREGA' | 'TARJETA'>('QR_SIMPLE');

const departments: DepartamentoBolivia[] = [
  'Santa Cruz',
  'La Paz',
  'Cochabamba',
  'Chuquisaca',
  'Tarija',
  'Oruro',
  'Potosí',
  'Beni',
  'Pando',
];

onMounted(() => {
  if (cartStore.items.length > 0) {
    cartStore.calculateShipping();
  }
});

watch(
  () => [cartStore.selectedDepartment, cartStore.deliveryType],
  () => {
    cartStore.calculateShipping();
  }
);

async function handleCheckout() {
  if (cartStore.items.length === 0) return;

  const payload = {
    clienteNombre: clienteNombre.value,
    clienteTelefono: clienteTelefono.value,
    clienteCiNit: clienteCiNit.value,
    razonSocialFactura: razonSocialFactura.value,
    departamentoDestino: cartStore.selectedDepartment,
    ciudadDestino: cartStore.selectedCity || cartStore.selectedDepartment,
    direccionEntrega: direccionEntrega.value,
    referenciaDireccion: referenciaDireccion.value,
    tipoEntrega: cartStore.deliveryType,
    items: cartStore.items.map((i) => ({
      productoId: i.producto.id,
      cantidad: i.cantidad,
    })),
    metodoPago: metodoPago.value,
    observaciones: observaciones.value,
  };

  try {
    await orderStore.createOrder(payload);
    cartStore.clearCart();
  } catch (err: any) {
    alert(err.message || 'Error al procesar el pedido');
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="text-center max-w-xl mx-auto mb-10 space-y-2">
      <h1 class="font-serif text-3xl sm:text-4xl font-black text-gray-900">
        Carrito & Finalizar Pedido 🥖
      </h1>
      <p class="text-xs sm:text-sm text-gray-600">
        Entrega garantizada con flete express o despacho interdepartamental a toda Bolivia.
      </p>
    </div>

    <!-- Empty State -->
    <div v-if="cartStore.items.length === 0" class="text-center py-20 bg-white rounded-3xl border border-gray-200 max-w-md mx-auto p-8 space-y-4 shadow-sm">
      <div class="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mx-auto">
        🛒
      </div>
      <h3 class="font-serif text-xl font-bold text-gray-800">Tu carrito está vacío</h3>
      <p class="text-xs text-gray-500">Agrega panes calientes o repostería artesanal para continuar.</p>
      <router-link
        to="/"
        class="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
      >
        <ShoppingBag class="w-4 h-4" /> Ver Catálogo de Panes
      </router-link>
    </div>

    <!-- Checkout Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Form & Options -->
      <div class="lg:col-span-7 space-y-6">
        <!-- 1. Customer Information -->
        <div class="bg-white p-6 rounded-3xl border border-bakery-200 shadow-sm space-y-4">
          <h3 class="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">1</span>
            Datos del Cliente & Factura SIAT
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre Completo</label>
              <input
                v-model="clienteNombre"
                type="text"
                required
                class="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Celular (WhatsApp)</label>
              <input
                v-model="clienteTelefono"
                type="text"
                required
                placeholder="+591 7XXXXXXX"
                class="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">NIT o Carnet (CI)</label>
              <input
                v-model="clienteCiNit"
                type="text"
                required
                placeholder="4876543-SC"
                class="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Razón Social Factura</label>
              <input
                v-model="razonSocialFactura"
                type="text"
                class="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        <!-- 2. Delivery Logistics -->
        <div class="bg-white p-6 rounded-3xl border border-bakery-200 shadow-sm space-y-4">
          <h3 class="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">2</span>
            Destino & Modalidad de Despacho
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Departamento de Bolivia</label>
              <select
                v-model="cartStore.selectedDepartment"
                class="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-semibold"
              >
                <option v-for="dept in departments" :key="dept" :value="dept">
                  {{ dept }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo de Despacho</label>
              <select
                v-model="cartStore.deliveryType"
                class="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-semibold"
              >
                <option value="EXPRESS_LOCAL">🛵 Delivery Express Local (30 - 45 min)</option>
                <option value="PROGRAMADO">⏰ Programado para Lonche Caliente</option>
                <option value="DESPACHO_INTERDEPARTAMENTAL">✈️ Despacho Nacional (Courier)</option>
              </select>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Dirección de Entrega</label>
              <input
                v-model="direccionEntrega"
                type="text"
                placeholder="Av. / Calle, Número de Casa, Edificio, Depto"
                class="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        <!-- 3. Payment Method -->
        <div class="bg-white p-6 rounded-3xl border border-bakery-200 shadow-sm space-y-4">
          <h3 class="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">3</span>
            Forma de Pago Boliviana
          </h3>

          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="metodoPago = 'QR_SIMPLE'"
              class="p-4 rounded-2xl border text-left transition flex flex-col justify-between"
              :class="metodoPago === 'QR_SIMPLE' ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20' : 'border-gray-200 hover:border-amber-300'"
            >
              <div class="flex items-center justify-between mb-2">
                <Smartphone class="w-5 h-5 text-amber-600" />
                <span class="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">Recomendado</span>
              </div>
              <span class="font-bold text-xs text-gray-900">QR Simple BCB</span>
              <span class="text-[10px] text-gray-500">Interoperable todos los bancos</span>
            </button>

            <button
              type="button"
              @click="metodoPago = 'EFECTIVO_CONTRAENTREGA'"
              class="p-4 rounded-2xl border text-left transition flex flex-col justify-between"
              :class="metodoPago === 'EFECTIVO_CONTRAENTREGA' ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20' : 'border-gray-200 hover:border-amber-300'"
            >
              <div class="flex items-center justify-between mb-2">
                <DollarSign class="w-5 h-5 text-amber-600" />
              </div>
              <span class="font-bold text-xs text-gray-900">Efectivo contra Entrega</span>
              <span class="text-[10px] text-gray-500">Pagas al recibir tu pan</span>
            </button>

            <button
              type="button"
              @click="metodoPago = 'TIGO_MONEY'"
              class="p-4 rounded-2xl border text-left transition flex flex-col justify-between"
              :class="metodoPago === 'TIGO_MONEY' ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20' : 'border-gray-200 hover:border-amber-300'"
            >
              <div class="flex items-center justify-between mb-2">
                <Smartphone class="w-5 h-5 text-indigo-600" />
              </div>
              <span class="font-bold text-xs text-gray-900">Tigo Money</span>
              <span class="text-[10px] text-gray-500">Billetera móvil celular</span>
            </button>

            <button
              type="button"
              @click="metodoPago = 'TARJETA'"
              class="p-4 rounded-2xl border text-left transition flex flex-col justify-between"
              :class="metodoPago === 'TARJETA' ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500/20' : 'border-gray-200 hover:border-amber-300'"
            >
              <div class="flex items-center justify-between mb-2">
                <CreditCard class="w-5 h-5 text-gray-700" />
              </div>
              <span class="font-bold text-xs text-gray-900">Tarjeta Débito/Crédito</span>
              <span class="text-[10px] text-gray-500">Red Enlace / Libélula</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Cart Summary -->
      <div class="lg:col-span-5 bg-white p-6 rounded-3xl border border-bakery-200 shadow-sm space-y-6 sticky top-28">
        <h3 class="font-serif text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center justify-between">
          <span>Resumen de Compra</span>
          <span class="text-xs font-semibold text-gray-500">{{ cartStore.itemCount }} piezas</span>
        </h3>

        <!-- Items List -->
        <div class="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1 space-y-3">
          <div
            v-for="item in cartStore.items"
            :key="item.producto.id"
            class="pt-3 flex items-center justify-between gap-3 text-xs"
          >
            <img
              :src="item.producto.imagenUrl"
              :alt="item.producto.nombre"
              class="w-12 h-12 rounded-xl object-cover shrink-0"
            />
            <div class="flex-1 min-w-0">
              <p class="font-bold text-gray-900 truncate">{{ item.producto.nombre }}</p>
              <p class="text-gray-500 text-[11px]">Bs. {{ item.producto.precioBs.toFixed(2) }} c/u</p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                @click="cartStore.updateQuantity(item.producto.id, -1)"
                class="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
              >
                <Minus class="w-3 h-3" />
              </button>
              <span class="font-bold w-4 text-center">{{ item.cantidad }}</span>
              <button
                @click="cartStore.updateQuantity(item.producto.id, 1)"
                class="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
              >
                <Plus class="w-3 h-3" />
              </button>
            </div>
            <div class="font-bold text-gray-900 shrink-0 text-right w-16">
              Bs. {{ (item.producto.precioBs * item.cantidad).toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- Totals Calculation -->
        <div class="space-y-2 border-t border-gray-100 pt-4 text-xs">
          <div class="flex justify-between text-gray-600">
            <span>Subtotal de Panes</span>
            <span class="font-bold">Bs. {{ cartStore.subtotalBs.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span class="flex items-center gap-1">
              <Truck class="w-3.5 h-3.5 text-amber-600" />
              Flete a {{ cartStore.selectedDepartment }}
            </span>
            <span class="font-bold">Bs. {{ cartStore.shippingCostBs.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-base font-black text-bakery-950 border-t border-gray-200 pt-3">
            <span>Total a Pagar</span>
            <span class="text-xl">Bs. {{ cartStore.totalBs.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          @click="handleCheckout"
          :disabled="orderStore.loading"
          class="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-600/20 transition active:scale-98 disabled:opacity-50"
        >
          <span>{{ orderStore.loading ? 'Generando Pedido & QR...' : 'Confirmar Pedido y Pagar' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>

        <p class="text-[11px] text-gray-500 text-center flex items-center justify-center gap-1">
          <ShieldCheck class="w-4 h-4 text-emerald-600" />
          Facturación Computarizada SIAT avalada por SIN Bolivia
        </p>
      </div>
    </div>
  </div>
</template>
