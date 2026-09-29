<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Product } from '@/types';
import { useCartStore } from '@/stores/cart.store';
import {
  X,
  Truck,
  Plus,
  Minus,
  Clock,
  Flame,
  Wheat,
  Coffee,
  CheckCircle2,
  Sparkles,
} from 'lucide-vue-next';

const props = defineProps<{
  product: Product | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const cartStore = useCartStore();
const quantity = ref(1);

function increment() {
  quantity.value++;
}

function decrement() {
  if (quantity.value > 1) {
    quantity.value--;
  }
}

function handleAddToCart() {
  if (!props.product) return;
  cartStore.addItem(props.product, quantity.value, true);
  emit('close');
  quantity.value = 1;
}

const maridajeSugerido = computed(() => {
  if (!props.product) return '';
  const nombre = props.product.nombre.toLowerCase();

  if (nombre.includes('marraqueta')) {
    return 'Café Yungueño de altura pasado en filtro de tela, Api Morado caliente con pastel frito o queso criollo chaqueño a la plancha.';
  }
  if (nombre.includes('cuñapé') || nombre.includes('cunape')) {
    return 'Café con leche espumosa, Chocolate puro beniano o té caliente con hierba luisa y limón sutil.';
  }
  if (nombre.includes('arani') || nombre.includes('valle')) {
    return 'Tojorí caliente de maíz blanco con canela y leche, o chocolate espeso del Valle Alto.';
  }
  if (nombre.includes('sarnita') || nombre.includes('laja')) {
    return 'Mate de coca con muña, té negro con canela de Ceilán o queso fresco de Colomi.';
  }
  if (nombre.includes('empanada') || nombre.includes('blanqueada') || nombre.includes('pastel')) {
    return 'Singani de uva Moscatel de Alejandría, infusión de cedrón o café espresso de grano Caranavi.';
  }
  return 'Café de especialidad de los Yungas paceños o infusión de manzanilla silvestre andina con miel virgen.';
});
</script>

<template>
  <div
    v-if="isOpen && product"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    @click="$emit('close')"
  >
    <div
      class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-stone-200 my-8 flex flex-col md:flex-row relative"
      @click.stop
    >
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 z-10 text-stone-400 hover:text-stone-900 p-1.5 rounded-full bg-white/80 hover:bg-stone-100 backdrop-blur-sm transition border border-stone-200"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Left Column: Visual Showcase -->
      <div class="md:w-5/12 bg-stone-100 relative min-h-[260px] md:min-h-full overflow-hidden flex items-center justify-center">
        <img
          :src="product.imagenUrl"
          :alt="product.nombre"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-obsidian-950/60 via-transparent to-transparent"></div>

        <!-- Badges Overlay -->
        <div class="absolute bottom-4 left-4 right-4 flex flex-wrap gap-1.5">
          <span
            v-if="product.destacado"
            class="bg-obsidian-950/90 text-gold-300 font-medium text-[9px] uppercase tracking-widest px-2.5 py-1 rounded shadow border border-gold-500/30 backdrop-blur-sm"
          >
            ★ Colección Insignia
          </span>
          <span
            v-if="product.aptoEnvioNacional"
            class="bg-stone-900/90 text-stone-200 font-medium text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow flex items-center gap-1 backdrop-blur-sm border border-stone-700"
          >
            <Truck class="w-3 h-3 text-gold-400" /> Envío 9 Departamentos
          </span>
        </div>
      </div>

      <!-- Right Column: Technical & Tasting Notes -->
      <div class="md:w-7/12 p-6 sm:p-7 space-y-5 flex flex-col justify-between">
        <div class="space-y-4">
          <!-- Header Category & SKU -->
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-semibold uppercase tracking-widest text-gold-600 bg-gold-100/60 px-2.5 py-0.5 rounded border border-gold-300/40">
              {{ product.categoria }}
            </span>
            <span class="text-[10px] font-mono text-stone-400">SKU: {{ product.codigoSku }}</span>
          </div>

          <!-- Title & Price -->
          <div>
            <h2 class="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-snug">
              {{ product.nombre }}
            </h2>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="font-mono text-2xl font-bold text-stone-950">
                Bs. {{ product.precioBs.toFixed(2) }}
              </span>
              <span class="text-xs text-stone-400 font-light">/ {{ product.unidadMedida }}</span>
            </div>
          </div>

          <!-- Description -->
          <p class="text-xs text-stone-600 leading-relaxed font-light">
            {{ product.descripcion }}
          </p>

          <!-- Ficha Técnica de Panadería -->
          <div class="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
            <h4 class="font-serif font-bold text-stone-900 text-xs flex items-center gap-1.5 border-b border-stone-200/80 pb-1.5">
              <Sparkles class="w-3.5 h-3.5 text-gold-600" />
              Ficha Técnica de Panadería
            </h4>
            <div class="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
              <div class="flex items-center gap-1.5">
                <Flame class="w-3.5 h-3.5 text-gold-600 shrink-0" />
                <span>Horno: <strong>Solera de Piedra</strong></span>
              </div>
              <div class="flex items-center gap-1.5">
                <Wheat class="w-3.5 h-3.5 text-gold-600 shrink-0" />
                <span>Fermentación: <strong>Masa Madre 24h</strong></span>
              </div>
              <div class="flex items-center gap-1.5">
                <Clock class="w-3.5 h-3.5 text-gold-600 shrink-0" />
                <span>Horneada: <strong>Turno {{ product.horarioRecomendado }}</strong></span>
              </div>
              <div class="flex items-center gap-1.5">
                <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Frescura: <strong>{{ product.tiempoVidaUtilHoras }}h vida útil</strong></span>
              </div>
            </div>
          </div>

          <!-- Maridaje Tradicional Boliviano -->
          <div class="bg-gold-50/50 p-3.5 rounded-2xl border border-gold-300/40 text-xs space-y-1">
            <span class="font-serif font-bold text-gold-800 text-xs flex items-center gap-1.5">
              <Coffee class="w-3.5 h-3.5 text-gold-600" />
              Maridaje Tradicional Sugerido
            </span>
            <p class="text-[11px] text-stone-600 italic leading-relaxed">
              "{{ maridajeSugerido }}"
            </p>
          </div>
        </div>

        <!-- Cart Action Footer -->
        <div class="pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
          <!-- Quantity Stepper -->
          <div class="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl p-1 shrink-0">
            <button
              @click="decrement"
              class="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center transition shadow-xs"
            >
              <Minus class="w-3.5 h-3.5" />
            </button>
            <span class="font-mono text-sm font-bold text-stone-900 w-8 text-center">
              {{ quantity }}
            </span>
            <button
              @click="increment"
              class="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center transition shadow-xs"
            >
              <Plus class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Add to Cart CTA -->
          <button
            @click="handleAddToCart"
            class="flex-1 bg-stone-900 hover:bg-gold-500 text-stone-100 hover:text-obsidian-950 font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 border border-stone-800 hover:border-gold-400"
          >
            <Plus class="w-4 h-4" />
            <span>Agregar • Bs. {{ (product.precioBs * quantity).toFixed(2) }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
