<script setup lang="ts">
import { computed } from 'vue';
import { useOrderStore } from '@/stores/order.store';
import { Printer, X, ShieldCheck } from 'lucide-vue-next';

const orderStore = useOrderStore();
const invoice = computed(() => orderStore.currentInvoice);

function printInvoice() {
  window.print();
}
</script>

<template>
  <div
    v-if="orderStore.isInvoiceModalOpen && invoice"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
  >
    <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 my-8">
      <!-- Actions Bar -->
      <div class="bg-bakery-950 p-4 text-white flex items-center justify-between print:hidden">
        <div class="flex items-center gap-2">
          <ShieldCheck class="w-5 h-5 text-emerald-400" />
          <span class="text-xs font-bold uppercase tracking-wider text-amber-300">
            Factura Oficial SIAT / SIN Bolivia
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="printInvoice"
            class="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Printer class="w-4 h-4" /> Imprimir
          </button>
          <button
            @click="orderStore.isInvoiceModalOpen = false"
            class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-bakery-800 transition"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Printable Invoice Sheet -->
      <div class="p-8 text-gray-800 text-xs font-mono space-y-4 print:p-0">
        <!-- Tax Header -->
        <div class="text-center border-b border-gray-300 pb-4 space-y-1">
          <h2 class="font-bold text-sm text-gray-900">{{ invoice.razonSocialEmisor }}</h2>
          <p class="text-[11px] font-bold text-gray-700">CASA MATRIZ: {{ invoice.sucursalNombre }}</p>
          <p class="text-[11px] text-gray-600">{{ invoice.departamento }} - Bolivia</p>
          <div class="bg-gray-100 p-2 rounded-lg font-bold text-xs mt-2">
            NIT: {{ invoice.nitEmisor }}
          </div>
        </div>

        <!-- Factura Details -->
        <div class="border-b border-gray-300 pb-3 space-y-1 text-[11px]">
          <div class="flex justify-between font-bold text-gray-900">
            <span>FACTURA N°: {{ invoice.numeroFactura }}</span>
            <span>CÓD. AUTORIZACIÓN: SIAT-SIN</span>
          </div>
          <p class="break-all text-[9px] text-gray-500">
            <strong>CUF:</strong> {{ invoice.cuf }}
          </p>
          <p class="break-all text-[9px] text-gray-500">
            <strong>CUFD:</strong> {{ invoice.cufd }}
          </p>
        </div>

        <!-- Client Info -->
        <div class="border-b border-gray-300 pb-3 space-y-1 text-[11px]">
          <p><strong>FECHA EMISIÓN:</strong> {{ new Date(invoice.fechaEmision).toLocaleString('es-BO') }}</p>
          <p><strong>SEÑOR(ES):</strong> {{ invoice.razonSocialCliente }}</p>
          <p><strong>NIT / CI CLIENTE:</strong> {{ invoice.nitCiCliente }}</p>
        </div>

        <!-- Totals Table -->
        <div class="border-b border-gray-300 pb-3 space-y-2">
          <div class="flex justify-between text-xs">
            <span>TOTAL FACTURA EN BS:</span>
            <span class="font-bold">Bs. {{ invoice.montoTotalBs.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-xs font-bold text-gray-900">
            <span>IMPORTE BASE CRÉDITO FISCAL:</span>
            <span>Bs. {{ invoice.montoSujetoCreditoFiscalBs.toFixed(2) }}</span>
          </div>
        </div>

        <!-- SIN Official QR Code & Fiscal Legend -->
        <div class="pt-2 text-center space-y-3">
          <img
            v-if="invoice.qrSiatDataUri"
            :src="invoice.qrSiatDataUri"
            alt="Código QR Tributario SIAT"
            class="w-36 h-36 mx-auto object-contain border border-gray-300 p-1 rounded-lg"
          />
          <p class="text-[10px] text-gray-600 italic leading-relaxed">
            "ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY"
          </p>
          <p class="text-[9px] text-gray-500 font-bold border-t border-gray-200 pt-2">
            {{ invoice.leyendaFiscal }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
