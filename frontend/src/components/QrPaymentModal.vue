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
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md transition-opacity"
  >
    <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200 animate-in fade-in zoom-in duration-200">
      <!-- Modal Header -->
      <div class="bg-obsidian-950 p-6 text-stone-100 text-center relative border-b border-stone-800">
        <button
          @click="orderStore.isQrModalOpen = false"
          class="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition"
        >
          <X class="w-5 h-5" />
        </button>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 text-gold-300 text-[10px] font-semibold uppercase tracking-[0.2em] border border-gold-500/30 mb-2">
          <Smartphone class="w-3.5 h-3.5 text-gold-400" /> Pasarela QR Simple BCB
        </span>
        <h3 class="font-serif text-2xl font-bold text-white tracking-wide">Escanea y Abona tu Pedido</h3>
        <p class="text-xs text-stone-400 mt-1 font-light">
          Código: <span class="font-mono font-bold text-gold-300">{{ order.codigoPedido }}</span>
        </p>
      </div>

      <!-- Modal Body -->
      <div class="p-6 text-center space-y-5">
        <!-- QR Code Container -->
        <div class="relative inline-block bg-stone-50 p-4 rounded-2xl border border-stone-200/90 shadow-inner">
          <img
            v-if="order.qrSimpleDataUri"
            :src="order.qrSimpleDataUri"
            alt="Código QR Simple BCB"
            class="w-56 h-56 mx-auto object-contain rounded-xl bg-white p-2 shadow-sm border border-stone-100"
          />
          <div v-else class="w-56 h-56 flex items-center justify-center text-xs text-stone-400">
            Generando QR oficial...
          </div>

          <!-- Paid Overlay Badge -->
          <div
            v-if="isPaid"
            class="absolute inset-0 bg-stone-950/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center text-white p-4 animate-in fade-in"
          >
            <CheckCircle2 class="w-16 h-16 text-emerald-400 mb-2 animate-bounce" />
            <span class="text-base font-serif font-bold tracking-widest uppercase text-gold-300">¡Abono Confirmado!</span>
            <span class="text-xs text-stone-300 mt-1 font-light">Tu pedido entra a solera de horneada</span>
          </div>
        </div>

        <!-- Total Amount -->
        <div>
          <span class="text-[10px] text-stone-400 uppercase tracking-widest font-semibold block">Total a Cancelar</span>
          <div class="text-3xl font-mono font-bold text-stone-950 mt-0.5">
            Bs. {{ order.totalBs.toFixed(2) }}
          </div>
        </div>

        <!-- Timer / Status -->
        <div class="flex items-center justify-center gap-2 text-xs font-medium text-stone-700 bg-stone-100/90 py-2 px-4 rounded-xl border border-stone-200 font-mono">
          <Clock class="w-4 h-4 text-gold-600" />
          <span v-if="!isPaid">Validez del código: <strong class="font-bold text-stone-900">{{ formattedTimer }}</strong></span>
          <span v-else class="text-emerald-800 font-bold">Transferencia verificada en línea</span>
        </div>

        <!-- Supported Banks Bolivia -->
        <div class="text-[10px] text-stone-400 space-y-1 font-light border-t border-stone-100 pt-3">
          <p class="font-medium text-stone-600 uppercase tracking-wider text-[9px]">Interoperable con todo el Sistema Financiero de Bolivia:</p>
          <p class="text-stone-500">
            Banco Unión • BCP • BNB • BancoSol • Banco FIE • Banco Ganadero • Banco Bisa • Tigo Money
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2 pt-1 border-t border-stone-100">
          <button
            v-if="!isPaid"
            @click="simulateConfirmation"
            class="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <CheckCircle2 class="w-4 h-4" />
            Simular Aprobación Bancaria (Demo)
          </button>

          <button
            v-if="isPaid"
            @click="viewInvoice"
            class="w-full bg-stone-900 hover:bg-gold-600 text-stone-100 hover:text-white font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition border border-stone-800 hover:border-gold-500"
          >
            <Receipt class="w-4 h-4 text-gold-400" />
            Emitir & Imprimir Factura SIAT
          </button>

          <button
            @click="orderStore.isQrModalOpen = false"
            class="w-full text-xs text-stone-400 hover:text-stone-800 py-1 font-medium transition"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
