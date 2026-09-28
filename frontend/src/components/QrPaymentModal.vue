<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useOrderStore } from '@/stores/order.store';
import { CheckCircle2, Clock, Smartphone, AlertCircle, X, Receipt } from 'lucide-vue-next';
import confetti from 'canvas-confetti';

const orderStore = useOrderStore();
const timer = ref(15 * 60); // 15 minutos de expiración de QR Simple
let timerInterval: any = null;
let pollInterval: any = null;

const order = computed(() => orderStore.currentOrder);
const isPaid = computed(() => order.value?.estadoPago === 'PAGADO');

const formattedTimer = computed(() => {
  const m = Math.floor(timer.value / 60);
  const s = timer.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

async function simulateConfirmation() {
  if (!order.value) return;
  await orderStore.simulatePaymentSuccess(order.value.id);
  triggerConfetti();
}

function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });
}

async function viewInvoice() {
  if (!order.value) return;
  await orderStore.emitInvoice(order.value.id);
}

onMounted(() => {
  timerInterval = setInterval(() => {
    if (timer.value > 0) timer.value--;
  }, 1000);

  pollInterval = setInterval(async () => {
    if (order.value && !isPaid.value) {
      const updated = await orderStore.checkOrderStatus(order.value.id);
      if (updated?.estadoPago === 'PAGADO') {
        triggerConfetti();
      }
    }
  }, 4000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  if (pollInterval) clearInterval(pollInterval);
});
</script>

<template>
  <div
    v-if="orderStore.isQrModalOpen && order"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity"
  >
    <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-200 animate-in fade-in zoom-in duration-200">
      <!-- Modal Header -->
      <div class="bg-gradient-to-r from-bakery-900 to-bakery-950 p-6 text-white text-center relative">
        <button
          @click="orderStore.isQrModalOpen = false"
          class="absolute top-4 right-4 text-bakery-400 hover:text-white p-1 rounded-full hover:bg-bakery-800 transition"
        >
          <X class="w-5 h-5" />
        </button>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-2">
          <Smartphone class="w-3.5 h-3.5" /> Pasarela QR Simple BCB
        </span>
        <h3 class="font-serif text-2xl font-bold">Escanea y Paga tu Pan</h3>
        <p class="text-xs text-bakery-300 mt-1">
          Código: <span class="font-mono font-bold text-amber-300">{{ order.codigoPedido }}</span>
        </p>
      </div>

      <!-- Modal Body -->
      <div class="p-6 text-center space-y-5">
        <!-- QR Code Container -->
        <div class="relative inline-block bg-amber-50/60 p-4 rounded-2xl border-2 border-dashed border-amber-300 shadow-inner">
          <img
            v-if="order.qrSimpleDataUri"
            :src="order.qrSimpleDataUri"
            alt="Código QR Simple BCB"
            class="w-56 h-56 mx-auto object-contain rounded-xl bg-white p-2 shadow-sm"
          />
          <div v-else class="w-56 h-56 flex items-center justify-center text-xs text-gray-400">
            Generando QR oficial...
          </div>

          <!-- Paid Overlay Badge -->
          <div
            v-if="isPaid"
            class="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-white p-4 animate-in fade-in"
          >
            <CheckCircle2 class="w-16 h-16 text-emerald-400 mb-2 animate-bounce" />
            <span class="text-lg font-black tracking-wide">¡PAGO CONFIRMADO!</span>
            <span class="text-xs text-emerald-200 mt-1">Tu pan ya está en proceso de horneada</span>
          </div>
        </div>

        <!-- Total Amount -->
        <div>
          <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total a Cancelar</span>
          <div class="text-3xl font-black text-bakery-950">
            Bs. {{ order.totalBs.toFixed(2) }}
          </div>
        </div>

        <!-- Timer / Status -->
        <div class="flex items-center justify-center gap-2 text-xs font-medium text-amber-900 bg-amber-100/70 py-2 px-4 rounded-xl border border-amber-200">
          <Clock class="w-4 h-4 text-amber-700" />
          <span v-if="!isPaid">QR Válido por: <strong class="font-mono">{{ formattedTimer }}</strong></span>
          <span v-else class="text-emerald-800 font-bold">Transferencia verificada en línea</span>
        </div>

        <!-- Supported Banks Bolivia -->
        <div class="text-[11px] text-gray-500 space-y-1">
          <p class="font-medium text-gray-700">Compatible con todas las aplicaciones bancarias de Bolivia:</p>
          <p class="text-bakery-700 font-semibold">
            Banco Unión • BCP • BNB • BancoSol • Banco FIE • Banco Ganadero • Banco Bisa • Tigo Money
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2 pt-2 border-t border-gray-100">
          <button
            v-if="!isPaid"
            @click="simulateConfirmation"
            class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
          >
            <CheckCircle2 class="w-4 h-4" />
            Simular Aprobación Bancaria (Demo)
          </button>

          <button
            v-if="isPaid"
            @click="viewInvoice"
            class="w-full bg-bakery-900 hover:bg-bakery-800 text-amber-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
          >
            <Receipt class="w-4 h-4 text-amber-400" />
            Emitir & Imprimir Factura Electrónica SIAT
          </button>

          <button
            @click="orderStore.isQrModalOpen = false"
            class="w-full text-xs text-gray-500 hover:text-gray-800 py-1 font-medium"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
