<script setup lang="ts">
import { ref, computed } from 'vue';
import { useOrderStore } from '@/stores/order.store';
import { useToastStore } from '@/stores/toast.store';
import {
  Printer,
  X,
  ShieldCheck,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  FileCheck2,
} from 'lucide-vue-next';

const orderStore = useOrderStore();
const toastStore = useToastStore();

const invoice = computed(() => orderStore.currentInvoice);
const order = computed(() => orderStore.currentOrder);

const copiedCuf = ref(false);

function printInvoice() {
  window.print();
}

async function copyCuf() {
  if (!invoice.value) return;
  await navigator.clipboard.writeText(invoice.value.cuf);
  copiedCuf.value = true;
  toastStore.info('CUF Copiado', invoice.value.cuf);
  setTimeout(() => (copiedCuf.value = false), 2000);
}

const whatsappInvoiceLink = computed(() => {
  if (!invoice.value) return '#';
  const phone = '59170765432';
  const text = encodeURIComponent(
    `🧾 *Factura Electrónica SIAT - Panadería La Suprema*\n\n` +
      `• *Factura N°:* ${invoice.value.numeroFactura}\n` +
      `• *NIT Emisor:* ${invoice.value.nitEmisor}\n` +
      `• *Cliente:* ${invoice.value.razonSocialCliente} (NIT/CI: ${invoice.value.nitCiCliente})\n` +
      `• *Monto Total:* Bs. ${invoice.value.montoTotalBs.toFixed(2)}\n` +
      `• *CUF:* ${invoice.value.cuf}\n` +
      `• *Fecha:* ${new Date(invoice.value.fechaEmision).toLocaleString('es-BO')}\n\n` +
      `Documento tributario válido para crédito fiscal conforme normativa SIN Bolivia.`
  );
  return `https://wa.me/${phone}?text=${text}`;
});
</script>

<template>
  <div
    v-if="orderStore.isInvoiceModalOpen && invoice"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-obsidian-950/85 backdrop-blur-md overflow-y-auto"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200/90 my-auto animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:rounded-none"
    >
      <!-- Actions Bar (Hidden on print) -->
      <div
        class="bg-gradient-to-r from-obsidian-950 via-stone-950 to-obsidian-900 p-4 text-stone-100 flex items-center justify-between print:hidden border-b border-stone-800"
      >
        <div class="flex items-center gap-2">
          <ShieldCheck class="w-4 h-4 text-gold-400" />
          <span class="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-300">
            Documento Tributario Oficial SIAT / SIN
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="printInvoice"
            class="bg-gold-500 hover:bg-gold-400 text-obsidian-950 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-sm active:scale-95"
            title="Imprimir formato factura oficial"
          >
            <Printer class="w-3.5 h-3.5" /> Imprimir
          </button>
          <button
            @click="orderStore.isInvoiceModalOpen = false"
            class="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition"
            title="Cerrar modal"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Printable Invoice Sheet -->
      <div class="p-6 sm:p-8 text-stone-800 text-xs font-mono space-y-4 print:p-0 bg-white">
        <!-- Tax Header -->
        <div class="text-center border-b border-stone-300 pb-4 space-y-1">
          <h2 class="font-bold text-sm text-stone-950 uppercase tracking-wide">
            {{ invoice.razonSocialEmisor }}
          </h2>
          <p class="text-[11px] font-bold text-stone-700">CASA MATRIZ: {{ invoice.sucursalNombre }}</p>
          <p class="text-[10px] text-stone-500">{{ invoice.departamento }} - Estado Plurinacional de Bolivia</p>
          <div class="inline-block bg-stone-100 px-3 py-1 rounded font-bold text-xs mt-2 border border-stone-200">
            NIT: {{ invoice.nitEmisor }}
          </div>
        </div>

        <!-- Factura Authorization Details -->
        <div class="border-b border-stone-300 pb-3 space-y-1.5 text-[11px]">
          <div class="flex justify-between font-bold text-stone-900">
            <span>FACTURA N°: <span class="text-amber-800 font-extrabold">{{ invoice.numeroFactura }}</span></span>
            <span class="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
              AUTORIZADA SIAT
            </span>
          </div>

          <div class="flex items-start justify-between gap-2 text-[9px] text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200">
            <div class="break-all font-mono leading-tight">
              <strong>CUF:</strong> {{ invoice.cuf }}
            </div>
            <button
              @click="copyCuf"
              class="shrink-0 p-1 hover:bg-stone-200 rounded text-stone-600 print:hidden transition"
              title="Copiar CUF"
            >
              <Check v-if="copiedCuf" class="w-3.5 h-3.5 text-emerald-600" />
              <Copy v-else class="w-3.5 h-3.5" />
            </button>
          </div>

          <p class="break-all text-[9px] text-stone-500 font-mono">
            <strong>CUFD:</strong> {{ invoice.cufd }}
          </p>
        </div>

        <!-- Client & Timestamp Info -->
        <div class="border-b border-stone-300 pb-3 space-y-1 text-[11px]">
          <p><strong>FECHA EMISIÓN:</strong> {{ new Date(invoice.fechaEmision).toLocaleString('es-BO') }}</p>
          <p><strong>SEÑOR(ES):</strong> {{ invoice.razonSocialCliente }}</p>
          <p><strong>NIT / CI CLIENTE:</strong> {{ invoice.nitCiCliente }}</p>
        </div>

        <!-- Itemized Products Table (if order data exists) -->
        <div v-if="order && order.items && order.items.length > 0" class="border-b border-stone-300 pb-3">
          <table class="w-full text-[10px] text-left">
            <thead>
              <tr class="border-b border-stone-200 text-stone-500">
                <th class="py-1">Cant.</th>
                <th class="py-1">Descripción</th>
                <th class="py-1 text-right">P. Unit</th>
                <th class="py-1 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              <tr v-for="item in order.items" :key="item.productoId">
                <td class="py-1 font-bold">{{ item.cantidad }}</td>
                <td class="py-1 truncate max-w-[150px]">{{ item.nombreProducto }}</td>
                <td class="py-1 text-right">Bs. {{ item.precioUnitarioBs.toFixed(2) }}</td>
                <td class="py-1 text-right font-bold">Bs. {{ item.subtotalBs.toFixed(2) }}</td>
              </tr>
              <tr v-if="order.costoEnvioBs > 0">
                <td class="py-1 font-bold">1</td>
                <td class="py-1 text-stone-600">Flete Despacho {{ order.departamentoDestino }}</td>
                <td class="py-1 text-right">Bs. {{ order.costoEnvioBs.toFixed(2) }}</td>
                <td class="py-1 text-right font-bold">Bs. {{ order.costoEnvioBs.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totals Table -->
        <div class="border-b border-stone-300 pb-3 space-y-1.5">
          <div class="flex justify-between text-xs font-medium">
            <span>TOTAL FACTURA EN BOLIVIANOS:</span>
            <span class="font-bold text-stone-900 text-sm font-mono">
              Bs. {{ invoice.montoTotalBs.toFixed(2) }}
            </span>
          </div>
          <div class="flex justify-between text-xs font-bold text-stone-900">
            <span>IMPORTE BASE CRÉDITO FISCAL (100%):</span>
            <span class="font-mono">Bs. {{ invoice.montoSujetoCreditoFiscalBs.toFixed(2) }}</span>
          </div>
        </div>

        <!-- SIN Official QR Code & Fiscal Legal Legend -->
        <div class="pt-2 text-center space-y-3">
          <img
            v-if="invoice.qrSiatDataUri"
            :src="invoice.qrSiatDataUri"
            alt="Código QR Tributario SIAT"
            class="w-32 h-32 mx-auto object-contain border border-stone-300 p-1.5 rounded-xl bg-white shadow-sm"
          />

          <p class="text-[10px] text-stone-600 italic leading-relaxed">
            "ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY"
          </p>

          <p class="text-[9px] text-stone-500 font-bold border-t border-stone-200 pt-2 leading-tight">
            {{ invoice.leyendaFiscal }}
          </p>
        </div>

        <!-- Share Actions Bar (Hidden on print) -->
        <div class="pt-3 border-t border-stone-200 flex gap-2 print:hidden">
          <a
            :href="whatsappInvoiceLink"
            target="_blank"
            rel="noopener noreferrer"
            class="flex-1 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <MessageCircle class="w-3.5 h-3.5" /> Compartir por WhatsApp
          </a>

          <button
            @click="printInvoice"
            class="py-2.5 px-4 bg-stone-900 hover:bg-gold-500 text-stone-100 hover:text-obsidian-950 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm border border-stone-800"
          >
            <Printer class="w-3.5 h-3.5" /> Imprimir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
