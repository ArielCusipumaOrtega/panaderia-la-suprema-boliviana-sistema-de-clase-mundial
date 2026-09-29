<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart.store';
import { useOrderStore } from '@/stores/order.store';
import { useAuthStore } from '@/stores/auth.store';
import { useToastStore } from '@/stores/toast.store';
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
  Sparkles,
} from 'lucide-vue-next';
import type { DepartamentoBolivia } from '@/types';

const router = useRouter();
const cartStore = useCartStore();
const orderStore = useOrderStore();
const authStore = useAuthStore();
const toastStore = useToastStore();

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
  if (cartStore.items.length === 0) {
    toastStore.warning('Canasta Vacía', 'Agrega al menos una pieza para continuar');
    return;
  }

  if (
    !clienteNombre.value.trim() ||
    !clienteTelefono.value.trim() ||
    !clienteCiNit.value.trim() ||
    !direccionEntrega.value.trim()
  ) {
    toastStore.warning(
      'Datos Requeridos',
      'Por favor completa tu nombre, celular, CI/NIT y dirección de entrega.'
    );
    return;
  }

  const payload = {
    clienteNombre: clienteNombre.value.trim(),
    clienteTelefono: clienteTelefono.value.trim(),
    clienteCiNit: clienteCiNit.value.trim(),
    razonSocialFactura: (razonSocialFactura.value || clienteNombre.value).trim(),
    departamentoDestino: cartStore.selectedDepartment,
    ciudadDestino: cartStore.selectedCity || cartStore.selectedDepartment,
    direccionEntrega: direccionEntrega.value.trim(),
    referenciaDireccion: referenciaDireccion.value.trim(),
    tipoEntrega: cartStore.deliveryType,
    items: cartStore.items.map((i) => ({
      productoId: i.producto.id,
      cantidad: i.cantidad,
    })),
    metodoPago: metodoPago.value,
    observaciones: observaciones.value.trim(),
  };

  try {
    await orderStore.createOrder(payload);
    cartStore.clearCart();
  } catch (err: any) {
    console.error('Error al generar pedido:', err);
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="text-center max-w-xl mx-auto mb-10 space-y-2">
      <span class="text-[10px] font-semibold text-gold-600 uppercase tracking-[0.25em] bg-gold-100/60 border border-gold-300/40 px-3.5 py-1 rounded-full">
        Finalizar Pedido & Despacho
      </span>
      <h1 class="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
        Canasta & Confirmación 🥖
      </h1>
      <p class="text-xs sm:text-sm text-stone-600 font-light">
        Entrega garantizada con flete express en moto térmica o despacho interdepartamental a toda Bolivia.
      </p>
    </div>

    <!-- Empty State -->
    <div v-if="cartStore.items.length === 0" class="text-center py-20 bg-white rounded-3xl border border-stone-200/80 max-w-md mx-auto p-8 space-y-4 shadow-sm">
      <div class="w-16 h-16 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center text-2xl mx-auto border border-stone-200">
        🛒
      </div>
      <h3 class="font-serif text-xl font-bold text-stone-900">Tu canasta está vacía</h3>
      <p class="text-xs text-stone-500 font-light">Agrega panes recién horneados o repostería tradicional para continuar.</p>
      <router-link
        to="/"
        class="inline-flex items-center gap-2 bg-stone-900 hover:bg-gold-500 text-stone-100 hover:text-obsidian-950 px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase shadow-md transition-all border border-stone-800 hover:border-gold-400"
      >
        <ShoppingBag class="w-4 h-4" /> Explorar Catálogo
      </router-link>
    </div>

    <!-- Checkout Grid -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Forms -->
      <div class="lg:col-span-7 space-y-6">
        <!-- 1. Customer Information -->
        <div class="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-sm space-y-5">
          <h3 class="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-full bg-obsidian-950 text-gold-300 text-xs flex items-center justify-center font-mono border border-gold-500/30">1</span>
            Datos del Cliente & Facturación SIAT
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Nombre Completo</label>
              <input
                v-model="clienteNombre"
                type="text"
                required
                class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition text-stone-900"
              />
            </div>
            <div>
              <label class="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Celular (WhatsApp)</label>
              <input
                v-model="clienteTelefono"
                type="text"
                required
                placeholder="+591 7XXXXXXX"
                class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition text-stone-900 font-mono"
              />
            </div>
            <div>
              <label class="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5">NIT o Cédula (CI)</label>
              <input
                v-model="clienteCiNit"
                type="text"
                required
                placeholder="4876543-SC"
                class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition text-stone-900 font-mono"
              />
            </div>
            <div>
              <label class="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Razón Social Factura</label>
              <input
                v-model="razonSocialFactura"
                type="text"
                class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition text-stone-900"
              />
            </div>
          </div>
        </div>

        <!-- 2. Delivery Logistics -->
        <div class="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-sm space-y-5">
          <h3 class="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-full bg-obsidian-950 text-gold-300 text-xs flex items-center justify-center font-mono border border-gold-500/30">2</span>
            Destino & Modalidad de Despacho
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Departamento de Bolivia</label>
              <select
                v-model="cartStore.selectedDepartment"
                class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition text-stone-900 font-medium"
              >
                <option v-for="dept in departments" :key="dept" :value="dept">
                  {{ dept }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Modalidad de Entrega</label>
              <select
                v-model="cartStore.deliveryType"
                class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition text-stone-900 font-medium"
              >
                <option value="EXPRESS_LOCAL">🛵 Delivery Express Local (30 - 45 min)</option>
                <option value="PROGRAMADO">⏰ Programado para Lonche Caliente</option>
                <option value="DESPACHO_INTERDEPARTAMENTAL">✈️ Despacho Nacional Interdepartamental</option>
              </select>
            </div>

            <div class="sm:col-span-2">
              <label class="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Dirección Exacta de Entrega</label>
              <input
                v-model="direccionEntrega"
                type="text"
                placeholder="Av. / Calle, Número de Casa, Edificio, Depto"
                class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition text-stone-900"
              />
            </div>
          </div>
        </div>

        <!-- 3. Payment Methods -->
        <div class="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-sm space-y-5">
          <h3 class="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-full bg-obsidian-950 text-gold-300 text-xs flex items-center justify-center font-mono border border-gold-500/30">3</span>
            Pasarela de Pago Boliviana
          </h3>

          <div class="grid grid-cols-2 gap-3.5">
            <button
              type="button"
              @click="metodoPago = 'QR_SIMPLE'"
              class="p-4 rounded-xl border text-left transition-all flex flex-col justify-between"
              :class="metodoPago === 'QR_SIMPLE' ? 'border-gold-500 bg-gold-100/30 ring-1 ring-gold-500' : 'border-stone-200 hover:border-gold-400 bg-stone-50/50'"
            >
              <div class="flex items-center justify-between mb-2">
                <Smartphone class="w-4 h-4 text-gold-600" />
                <span class="text-[9px] uppercase tracking-wider bg-gold-500/20 text-gold-700 font-semibold px-1.5 py-0.5 rounded border border-gold-500/30">Recomendado</span>
              </div>
              <span class="font-bold text-xs text-stone-900">QR Simple BCB</span>
              <span class="text-[10px] text-stone-500 font-light">Interoperable todos los bancos</span>
            </button>

            <button
              type="button"
              @click="metodoPago = 'EFECTIVO_CONTRAENTREGA'"
              class="p-4 rounded-xl border text-left transition-all flex flex-col justify-between"
              :class="metodoPago === 'EFECTIVO_CONTRAENTREGA' ? 'border-gold-500 bg-gold-100/30 ring-1 ring-gold-500' : 'border-stone-200 hover:border-gold-400 bg-stone-50/50'"
            >
              <div class="flex items-center justify-between mb-2">
                <DollarSign class="w-4 h-4 text-stone-700" />
              </div>
              <span class="font-bold text-xs text-stone-900">Efectivo contra Entrega</span>
              <span class="text-[10px] text-stone-500 font-light">Pago al recibir tu pedido</span>
            </button>

            <button
              type="button"
              @click="metodoPago = 'TIGO_MONEY'"
              class="p-4 rounded-xl border text-left transition-all flex flex-col justify-between"
              :class="metodoPago === 'TIGO_MONEY' ? 'border-gold-500 bg-gold-100/30 ring-1 ring-gold-500' : 'border-stone-200 hover:border-gold-400 bg-stone-50/50'"
            >
              <div class="flex items-center justify-between mb-2">
                <Smartphone class="w-4 h-4 text-stone-700" />
              </div>
              <span class="font-bold text-xs text-stone-900">Tigo Money</span>
              <span class="text-[10px] text-stone-500 font-light">Billetera móvil celular</span>
            </button>

            <button
              type="button"
              @click="metodoPago = 'TARJETA'"
              class="p-4 rounded-xl border text-left transition-all flex flex-col justify-between"
              :class="metodoPago === 'TARJETA' ? 'border-gold-500 bg-gold-100/30 ring-1 ring-gold-500' : 'border-stone-200 hover:border-gold-400 bg-stone-50/50'"
            >
              <div class="flex items-center justify-between mb-2">
                <CreditCard class="w-4 h-4 text-stone-700" />
              </div>
              <span class="font-bold text-xs text-stone-900">Tarjeta Débito/Crédito</span>
              <span class="text-[10px] text-stone-500 font-light">Red Enlace / Red Abierta</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Cart Summary -->
      <div class="lg:col-span-5 bg-white p-6 sm:p-7 rounded-2xl border border-stone-200/80 shadow-sm space-y-6 sticky top-28">
        <h3 class="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-3 flex items-center justify-between">
          <span>Resumen de Canasta</span>
          <span class="text-xs font-mono text-stone-400 font-medium">{{ cartStore.itemCount }} piezas</span>
        </h3>

        <!-- Items List -->
        <div class="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1 space-y-3">
          <div
            v-for="item in cartStore.items"
            :key="item.producto.id"
            class="pt-3 flex items-center justify-between gap-3 text-xs"
          >
            <img
              :src="item.producto.imagenUrl"
              :alt="item.producto.nombre"
              class="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-100"
            />
            <div class="flex-1 min-w-0">
              <p class="font-medium text-stone-900 truncate">{{ item.producto.nombre }}</p>
              <p class="text-stone-400 font-mono text-[11px]">Bs. {{ item.producto.precioBs.toFixed(2) }}</p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                @click="cartStore.updateQuantity(item.producto.id, -1)"
                class="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold transition"
              >
                <Minus class="w-3 h-3" />
              </button>
              <span class="font-mono font-semibold w-5 text-center text-xs">{{ item.cantidad }}</span>
              <button
                @click="cartStore.updateQuantity(item.producto.id, 1)"
                class="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center justify-center font-bold transition"
              >
                <Plus class="w-3 h-3" />
              </button>
            </div>
            <div class="font-mono font-bold text-stone-900 shrink-0 text-right w-16">
              Bs. {{ (item.producto.precioBs * item.cantidad).toFixed(2) }}
            </div>
          </div>
        </div>

        <!-- Totals Calculation -->
        <div class="space-y-2.5 border-t border-stone-100 pt-4 text-xs font-light">
          <div class="flex justify-between text-stone-600">
            <span>Subtotal de Panes</span>
            <span class="font-mono font-semibold text-stone-900">Bs. {{ cartStore.subtotalBs.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-stone-600">
            <span class="flex items-center gap-1.5">
              <Truck class="w-3.5 h-3.5 text-gold-600" />
              Flete a {{ cartStore.selectedDepartment }}
            </span>
            <span class="font-mono font-semibold text-stone-900">Bs. {{ cartStore.shippingCostBs.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-base font-bold text-stone-900 border-t border-stone-200 pt-3">
            <span class="font-serif">Total a Pagar</span>
            <span class="font-mono text-xl text-stone-950">Bs. {{ cartStore.totalBs.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          @click="handleCheckout"
          :disabled="orderStore.loading"
          class="w-full bg-stone-900 hover:bg-gold-600 text-stone-100 hover:text-white font-semibold py-3.5 px-6 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-50 border border-stone-800 hover:border-gold-500"
        >
          <span>{{ orderStore.loading ? 'Generando Pedido...' : 'Confirmar Pedido y Pagar' }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>

        <p class="text-[11px] text-stone-400 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck class="w-4 h-4 text-emerald-600" />
          Facturación Computarizada SIAT avalada por SIN Bolivia
        </p>
      </div>
    </div>
  </div>
</template>
