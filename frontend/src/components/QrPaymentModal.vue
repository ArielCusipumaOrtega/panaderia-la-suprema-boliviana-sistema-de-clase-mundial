<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useOrderStore } from '@/stores/order.store';
import { useToastStore } from '@/stores/toast.store';
import {
  CheckCircle2,
  Clock,
  Smartphone,
  X,
  Receipt,
  Copy,
  Check,
  CreditCard,
  Banknote,
  Truck,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Lock,
} from 'lucide-vue-next';
import confetti from 'canvas-confetti';

const orderStore = useOrderStore();
const toastStore = useToastStore();

const timer = ref(15 * 60); // 15 minutos
let timerInterval: any = null;
let pollInterval: any = null;

const order = computed(() => orderStore.currentOrder);
const isPaid = computed(() => order.value?.estadoPago === 'PAGADO');

// Active payment tab (defaults to the order's chosen method)
const activeMethod = ref<'QR_SIMPLE' | 'TIGO_MONEY' | 'EFECTIVO_CONTRAENTREGA' | 'TARJETA'>('QR_SIMPLE');

watch(
  () => order.value?.metodoPago,
  (newMethod) => {
    if (newMethod) {
      activeMethod.value = newMethod;
    }
  },
  { immediate: true }
);

// Copied clipboard states
const copiedGlosa = ref(false);
const copiedMonto = ref(false);

// Tigo Money State
const tigoPhone = ref('');
const isTigoPushing = ref(false);

// Efectivo State
const billeteCambio = ref<'EXACTO' | '100' | '200'>('EXACTO');

// Card State
const cardNumber = ref('');
const cardHolder = ref('');
const cardExpiry = ref('');
const cardCvv = ref('');

// Bank simulator selector
const selectedBank = ref('BCP');
const bolivianBanks = [
  { id: 'BCP', name: 'BCP Bolivia', app: 'Banca Móvil BCP', color: 'from-blue-900 to-indigo-950' },
  { id: 'BNB', name: 'BNB', app: 'BNB Móvil / GanaMóvil', color: 'from-emerald-900 to-teal-950' },
  { id: 'UNION', name: 'Banco Unión', app: 'Uninet Plus', color: 'from-blue-800 to-slate-900' },
  { id: 'BANCOSOL', name: 'BancoSol', app: 'AppSol Bolivia', color: 'from-amber-900 to-stone-900' },
  { id: 'BISA', name: 'Banco BISA', app: 'BISA Móvil', color: 'from-red-950 to-stone-950' },
];

const formattedTimer = computed(() => {
  const m = Math.floor(timer.value / 60);
  const s = timer.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

function triggerConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#c5a03a', '#e8cc7a', '#10b981', '#0f172a'],
  });
}

async function copyGlosa() {
  if (!order.value) return;
  const glosa = `Pago Pedido ${order.value.codigoPedido} - Panaderia La Suprema`;
  await navigator.clipboard.writeText(glosa);
  copiedGlosa.value = true;
  toastStore.info('Glosa Copiada', glosa);
  setTimeout(() => (copiedGlosa.value = false), 2000);
}

async function copyMonto() {
  if (!order.value) return;
  await navigator.clipboard.writeText(order.value.totalBs.toFixed(2));
  copiedMonto.value = true;
  toastStore.info('Monto Copiado', `Bs. ${order.value.totalBs.toFixed(2)}`);
  setTimeout(() => (copiedMonto.value = false), 2000);
}

async function simulateConfirmation() {
  if (!order.value) return;
  await orderStore.simulatePaymentSuccess(order.value.id, activeMethod.value);
  triggerConfetti();
}

async function simulateTigoPayment() {
  if (!order.value) return;
  isTigoPushing.value = true;
  setTimeout(async () => {
    isTigoPushing.value = false;
    await orderStore.simulatePaymentSuccess(
      order.value!.id,
      'TIGO_MONEY',
      `TM-BO-${Date.now().toString().slice(-6)}`
    );
    triggerConfetti();
  }, 1200);
}

async function simulateCardPayment() {
  if (!order.value) return;
  await orderStore.simulatePaymentSuccess(
    order.value.id,
    'TARJETA',
    `RE-ENLACE-${Date.now().toString().slice(-6)}`
  );
  triggerConfetti();
}

async function confirmCashOrder() {
  if (!order.value) return;
  await orderStore.simulatePaymentSuccess(
    order.value.id,
    'EFECTIVO_CONTRAENTREGA',
    `CONTRAENTREGA-CAMBIO-${billeteCambio.value}`
  );
  triggerConfetti();
}

async function viewInvoice() {
  if (!order.value) return;
  await orderStore.emitInvoice(order.value.id);
}

const whatsappLink = computed(() => {
  if (!order.value) return '#';
  const phone = '59170765432';
  const text = encodeURIComponent(
    `🥖 *Panadería La Suprema Boliviana*\n\n` +
      `¡Hola! Confirmo mi pedido artesanal:\n` +
      `• *Código:* ${order.value.codigoPedido}\n` +
      `• *Cliente:* ${order.value.clienteNombre}\n` +
      `• *Destino:* ${order.value.direccionEntrega}, ${order.value.ciudadDestino} (${order.value.departamentoDestino})\n` +
      `• *Total a Pagar:* Bs. ${order.value.totalBs.toFixed(2)}\n` +
      `• *Método:* ${activeMethod.value}\n` +
      `• *Estado:* ${isPaid.value ? '✅ PAGADO / EN SOLERA DE HORNEADA' : '⏳ PENDIENTE'}\n\n` +
      `Agradezco el despacho en moto térmica recién salido del horno.`
  );
  return `https://wa.me/${phone}?text=${text}`;
});

onMounted(() => {
  if (order.value?.clienteTelefono) {
    tigoPhone.value = order.value.clienteTelefono;
  }
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
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-obsidian-950/85 backdrop-blur-md transition-opacity overflow-y-auto"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200/90 my-auto animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Modal Header -->
      <div class="bg-gradient-to-r from-obsidian-950 via-stone-950 to-obsidian-900 p-5 sm:p-6 text-stone-100 text-center relative border-b border-stone-800">
        <button
          @click="orderStore.isQrModalOpen = false"
          class="absolute top-4 right-4 text-stone-400 hover:text-white p-1.5 rounded-full hover:bg-stone-800 transition"
          title="Cerrar modal"
        >
          <X class="w-5 h-5" />
        </button>

        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 text-gold-300 text-[10px] font-semibold uppercase tracking-[0.2em] border border-gold-500/30 mb-2">
          <Building2 class="w-3.5 h-3.5 text-gold-400" /> Pasarela Bancaria & Despacho Bolivia
        </span>

        <h3 class="font-serif text-2xl font-bold text-white tracking-wide">
          {{ isPaid ? '¡Pedido Confirmado!' : 'Finalizar Abono de Pedido' }}
        </h3>

        <div class="flex items-center justify-center gap-3 mt-1 text-xs text-stone-400 font-light">
          <span>Código: <strong class="font-mono font-bold text-gold-300">{{ order.codigoPedido }}</strong></span>
          <span>•</span>
          <span>Destino: <strong class="text-stone-200">{{ order.departamentoDestino }}</strong></span>
        </div>
      </div>

      <!-- Payment Method Navigation (Tabs) when not yet paid -->
      <div v-if="!isPaid" class="bg-stone-100 p-1.5 flex gap-1 border-b border-stone-200/80 text-xs">
        <button
          @click="activeMethod = 'QR_SIMPLE'"
          class="flex-1 py-2 px-2 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 text-[11px]"
          :class="activeMethod === 'QR_SIMPLE' ? 'bg-white text-stone-900 shadow-sm font-semibold' : 'text-stone-500 hover:text-stone-800'"
        >
          <Smartphone class="w-3.5 h-3.5 text-gold-600" /> QR Simple
        </button>

        <button
          @click="activeMethod = 'TIGO_MONEY'"
          class="flex-1 py-2 px-2 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 text-[11px]"
          :class="activeMethod === 'TIGO_MONEY' ? 'bg-white text-stone-900 shadow-sm font-semibold' : 'text-stone-500 hover:text-stone-800'"
        >
          <Smartphone class="w-3.5 h-3.5 text-blue-600" /> Tigo Money
        </button>

        <button
          @click="activeMethod = 'EFECTIVO_CONTRAENTREGA'"
          class="flex-1 py-2 px-2 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 text-[11px]"
          :class="activeMethod === 'EFECTIVO_CONTRAENTREGA' ? 'bg-white text-stone-900 shadow-sm font-semibold' : 'text-stone-500 hover:text-stone-800'"
        >
          <Banknote class="w-3.5 h-3.5 text-emerald-600" /> En Puerta
        </button>

        <button
          @click="activeMethod = 'TARJETA'"
          class="flex-1 py-2 px-2 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 text-[11px]"
          :class="activeMethod === 'TARJETA' ? 'bg-white text-stone-900 shadow-sm font-semibold' : 'text-stone-500 hover:text-stone-800'"
        >
          <CreditCard class="w-3.5 h-3.5 text-stone-700" /> Tarjeta
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-5 sm:p-6 space-y-5 text-stone-800">
        <!-- 1. SUCCESS / PAID STATE -->
        <div v-if="isPaid" class="text-center space-y-4 py-2">
          <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 animate-bounce">
            <CheckCircle2 class="w-9 h-9" />
          </div>

          <div>
            <h4 class="font-serif text-2xl font-bold text-stone-900">¡Abono Recibido y Verificado!</h4>
            <p class="text-xs text-stone-600 mt-1 max-w-sm mx-auto font-light">
              Tu pedido ha ingresado a la solera de horneada en la sucursal de <strong>{{ order.departamentoDestino }}</strong>.
            </p>
          </div>

          <!-- Total Pill -->
          <div class="inline-block bg-stone-50 px-5 py-2.5 rounded-2xl border border-stone-200">
            <span class="text-[10px] text-stone-400 uppercase tracking-widest font-semibold block">Total Liquidado</span>
            <span class="text-2xl font-mono font-bold text-stone-950">Bs. {{ order.totalBs.toFixed(2) }}</span>
          </div>

          <!-- Quick Action Buttons -->
          <div class="space-y-2.5 pt-2 max-w-md mx-auto">
            <button
              @click="viewInvoice"
              class="w-full bg-obsidian-950 hover:bg-gold-600 text-gold-300 hover:text-white font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition border border-gold-500/30"
            >
              <Receipt class="w-4 h-4 text-gold-400" />
              Emitir & Imprimir Factura SIAT
            </button>

            <a
              :href="whatsappLink"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition active:scale-98"
            >
              <MessageCircle class="w-4 h-4" />
              Enviar Comprobante por WhatsApp (+591)
            </a>

            <button
              @click="orderStore.isQrModalOpen = false"
              class="w-full text-xs text-stone-500 hover:text-stone-800 py-1.5 font-medium transition"
            >
              Volver al inicio
            </button>
          </div>
        </div>

        <!-- 2. TAB: QR SIMPLE BCB -->
        <div v-else-if="activeMethod === 'QR_SIMPLE'" class="text-center space-y-4">
          <!-- QR Code Frame -->
          <div class="relative inline-block bg-stone-50 p-4 rounded-3xl border border-stone-200/90 shadow-inner">
            <img
              v-if="order.qrSimpleDataUri"
              :src="order.qrSimpleDataUri"
              alt="Código QR Simple BCB"
              class="w-52 h-52 sm:w-56 sm:h-56 mx-auto object-contain rounded-2xl bg-white p-2 shadow-sm border border-stone-100"
            />
            <div v-else class="w-52 h-52 flex items-center justify-center text-xs text-stone-400">
              Generando código QR Simple...
            </div>
          </div>

          <!-- Total & Timer Badges -->
          <div class="flex items-center justify-center gap-3">
            <div class="bg-stone-50 px-4 py-2 rounded-xl border border-stone-200 text-left">
              <span class="text-[9px] text-stone-400 uppercase tracking-widest font-semibold block">Total</span>
              <span class="text-lg font-mono font-bold text-stone-950">Bs. {{ order.totalBs.toFixed(2) }}</span>
            </div>

            <div class="bg-stone-50 px-4 py-2 rounded-xl border border-stone-200 text-left">
              <span class="text-[9px] text-stone-400 uppercase tracking-widest font-semibold block">Expiración</span>
              <span class="text-lg font-mono font-bold text-amber-700 flex items-center gap-1">
                <Clock class="w-3.5 h-3.5 text-gold-600" /> {{ formattedTimer }}
              </span>
            </div>
          </div>

          <!-- Bank Mobile Selector simulator -->
          <div class="space-y-1.5 text-left bg-stone-50/80 p-3 rounded-2xl border border-stone-200">
            <span class="text-[10px] font-semibold text-stone-600 uppercase tracking-wider block">
              Compatible con tu Banca Móvil:
            </span>
            <div class="grid grid-cols-3 gap-1.5">
              <button
                v-for="b in bolivianBanks"
                :key="b.id"
                @click="selectedBank = b.id"
                class="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition border text-center"
                :class="selectedBank === b.id ? 'bg-stone-900 text-gold-300 border-stone-800' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'"
              >
                {{ b.name }}
              </button>
            </div>
          </div>

          <!-- Copy Buttons -->
          <div class="flex gap-2">
            <button
              @click="copyMonto"
              class="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-95 border border-stone-200"
            >
              <Check v-if="copiedMonto" class="w-3.5 h-3.5 text-emerald-600" />
              <Copy v-else class="w-3.5 h-3.5" />
              <span>{{ copiedMonto ? 'Monto Copiado' : 'Copiar Monto en Bs.' }}</span>
            </button>

            <button
              @click="copyGlosa"
              class="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition active:scale-95 border border-stone-200"
            >
              <Check v-if="copiedGlosa" class="w-3.5 h-3.5 text-emerald-600" />
              <Copy v-else class="w-3.5 h-3.5" />
              <span>{{ copiedGlosa ? 'Glosa Copiada' : 'Copiar Glosa' }}</span>
            </button>
          </div>

          <!-- Simulate Payment Button -->
          <button
            @click="simulateConfirmation"
            :disabled="orderStore.loading"
            class="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-50"
          >
            <CheckCircle2 class="w-4 h-4" />
            <span>{{ orderStore.loading ? 'Verificando con Banco...' : 'Simular Abono Bancario Aprobado (Demo)' }}</span>
          </button>
        </div>

        <!-- 3. TAB: TIGO MONEY -->
        <div v-else-if="activeMethod === 'TIGO_MONEY'" class="space-y-4">
          <div class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-2xl flex items-center justify-between border border-blue-800">
            <div>
              <span class="text-[10px] text-blue-200 uppercase tracking-widest font-semibold block">Billetera Móvil</span>
              <h4 class="font-bold text-base">Tigo Money Bolivia 📱</h4>
              <p class="text-[11px] text-blue-200 font-light">Pago directo con débito a saldo de billetera</p>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-blue-200 uppercase tracking-wider block">Importe</span>
              <span class="text-lg font-mono font-bold text-amber-300">Bs. {{ order.totalBs.toFixed(2) }}</span>
            </div>
          </div>

          <div class="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div>
              <label class="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                Número de Celular Tigo Money (+591)
              </label>
              <input
                v-model="tigoPhone"
                type="text"
                placeholder="+591 7XXXXXXX"
                class="w-full px-3.5 py-2.5 text-xs rounded-xl bg-white border border-stone-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none font-mono text-stone-900"
              />
            </div>

            <div class="text-[11px] text-stone-600 space-y-1 font-light">
              <p>1. Recibirás una notificación Push o mensaje USSD en tu celular Tigo.</p>
              <p>2. Ingresa tu PIN secreto de 4 dígitos para autorizar el débito.</p>
            </div>
          </div>

          <button
            @click="simulateTigoPayment"
            :disabled="orderStore.loading || isTigoPushing"
            class="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition active:scale-98 disabled:opacity-50"
          >
            <Smartphone class="w-4 h-4" />
            <span>{{ isTigoPushing ? 'Enviando Solicitud Push...' : 'Confirmar Débito Tigo Money' }}</span>
          </button>
        </div>

        <!-- 4. TAB: EFECTIVO CONTRAENTREGA -->
        <div v-else-if="activeMethod === 'EFECTIVO_CONTRAENTREGA'" class="space-y-4">
          <div class="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Banknote class="w-4 h-4" />
              </div>
              <div>
                <h4 class="font-bold text-xs text-stone-900">Abono en Puerta de Domicilio</h4>
                <p class="text-[11px] text-stone-500">Cancelas en efectivo al repartidor al recibir tu pedido caliente</p>
              </div>
            </div>

            <div class="border-t border-stone-200 pt-3">
              <label class="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-2">
                ¿Con cuánto abonarás? (Para que el repartidor lleve cambio)
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="billeteCambio = 'EXACTO'"
                  class="p-2.5 rounded-xl border text-xs font-semibold transition text-center"
                  :class="billeteCambio === 'EXACTO' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-white text-stone-600'"
                >
                  Monto Exacto
                </button>
                <button
                  type="button"
                  @click="billeteCambio = '100'"
                  class="p-2.5 rounded-xl border text-xs font-semibold transition text-center"
                  :class="billeteCambio === '100' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-white text-stone-600'"
                >
                  Billete Bs. 100
                </button>
                <button
                  type="button"
                  @click="billeteCambio = '200'"
                  class="p-2.5 rounded-xl border text-xs font-semibold transition text-center"
                  :class="billeteCambio === '200' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-white text-stone-600'"
                >
                  Billete Bs. 200
                </button>
              </div>
            </div>

            <div class="bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
              <Truck class="w-4 h-4 text-amber-700 shrink-0" />
              <span>Despacho asignado en bolso térmico para garantizar corteza crocante.</span>
            </div>
          </div>

          <button
            @click="confirmCashOrder"
            :disabled="orderStore.loading"
            class="w-full bg-stone-900 hover:bg-gold-500 text-stone-100 hover:text-obsidian-950 font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition active:scale-98"
          >
            <CheckCircle2 class="w-4 h-4" />
            <span>Confirmar Pedido y Despacho en Moto</span>
          </button>
        </div>

        <!-- 5. TAB: TARJETA DÉBITO/CRÉDITO -->
        <div v-else-if="activeMethod === 'TARJETA'" class="space-y-4">
          <div class="bg-stone-900 text-stone-100 p-4 rounded-2xl border border-stone-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-gold-400 font-semibold uppercase tracking-widest">Red Enlace Bolivia</span>
              <Lock class="w-3.5 h-3.5 text-stone-400" />
            </div>

            <div>
              <label class="block text-[9px] uppercase tracking-wider text-stone-400 mb-1">Número de Tarjeta</label>
              <input
                v-model="cardNumber"
                type="text"
                placeholder="4500 0000 0000 1234"
                maxlength="19"
                class="w-full px-3 py-2 text-xs rounded-xl bg-stone-800 border border-stone-700 text-white font-mono outline-none focus:border-gold-500"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[9px] uppercase tracking-wider text-stone-400 mb-1">Vencimiento</label>
                <input
                  v-model="cardExpiry"
                  type="text"
                  placeholder="MM/AA"
                  maxlength="5"
                  class="w-full px-3 py-2 text-xs rounded-xl bg-stone-800 border border-stone-700 text-white font-mono outline-none focus:border-gold-500"
                />
              </div>
              <div>
                <label class="block text-[9px] uppercase tracking-wider text-stone-400 mb-1">CVV / CVC</label>
                <input
                  v-model="cardCvv"
                  type="password"
                  placeholder="•••"
                  maxlength="4"
                  class="w-full px-3 py-2 text-xs rounded-xl bg-stone-800 border border-stone-700 text-white font-mono outline-none focus:border-gold-500"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-stone-500">
            <span class="flex items-center gap-1"><ShieldCheck class="w-3.5 h-3.5 text-emerald-600" /> Encriptación AES-256</span>
            <span class="font-mono font-bold text-stone-900">Total: Bs. {{ order.totalBs.toFixed(2) }}</span>
          </div>

          <button
            @click="simulateCardPayment"
            :disabled="orderStore.loading"
            class="w-full bg-stone-900 hover:bg-gold-500 text-stone-100 hover:text-obsidian-950 font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition active:scale-98"
          >
            <CreditCard class="w-4 h-4" />
            <span>Pagar con Tarjeta (Red Enlace)</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
