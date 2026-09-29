<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCatalogStore } from '@/stores/catalog.store';
import { useCartStore } from '@/stores/cart.store';
import type { Product } from '@/types';
import ProductDetailModal from '@/components/ProductDetailModal.vue';
import {
  Sparkles,
  Search,
  Truck,
  Plus,
  Minus,
  Check,
  Clock,
  Wheat,
  ShieldCheck,
  Flame,
  Info,
} from 'lucide-vue-next';

const catalogStore = useCatalogStore();
const cartStore = useCartStore();

const selectedProduct = ref<Product | null>(null);
const isDetailModalOpen = ref<boolean>(false);

function openDetailModal(product: Product) {
  selectedProduct.value = product;
  isDetailModalOpen.value = true;
}

onMounted(async () => {
  if (catalogStore.products.length === 0) {
    await catalogStore.fetchProducts();
  }
});
</script>

<template>
  <div class="space-y-12 pb-20">
    <!-- Hero Editorial Banner -->
    <section class="relative bg-gradient-to-br from-obsidian-950 via-stone-950 to-obsidian-900 text-stone-100 rounded-3xl overflow-hidden shadow-2xl mx-4 sm:mx-6 lg:mx-8 mt-6 border border-stone-800/90">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#c5a03a_1px,transparent_1px)] [background-size:20px_20px]"></div>
      
      <div class="max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div class="lg:col-span-7 space-y-6">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 text-gold-300 text-xs font-medium tracking-widest uppercase border border-gold-500/30">
            <Sparkles class="w-3.5 h-3.5 text-gold-400" />
            <span>Maison de Panadería • Tradición de Bolivia 🇧🇴</span>
          </div>
          
          <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] tracking-tight text-white">
            El Arte del Pan <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-amber-200">
              Cocido a la Piedra Viva
            </span>
          </h1>

          <p class="text-sm sm:text-base text-stone-300 max-w-xl leading-relaxed font-light">
            De nuestras soleras refractarias a tu mesa en los <strong>9 departamentos de Bolivia</strong>. Marraquetas paceñas de fermentación lenta, cuñapés con queso chaqueño curado, panes de Arani del Valle cochabambino y pastelería fina con Singani de altura.
          </p>

          <!-- Key Trust Badges -->
          <div class="grid grid-cols-3 gap-3.5 pt-3 max-w-lg">
            <div class="bg-obsidian-900/90 p-4 rounded-2xl border border-stone-800/80 text-center shadow-inner">
              <span class="block text-2xl font-serif font-bold text-gold-400">9</span>
              <span class="text-[11px] text-stone-400 tracking-wider uppercase font-medium">Departamentos</span>
            </div>
            <div class="bg-obsidian-900/90 p-4 rounded-2xl border border-stone-800/80 text-center shadow-inner">
              <span class="block text-2xl font-serif font-bold text-gold-400">30 min</span>
              <span class="text-[11px] text-stone-400 tracking-wider uppercase font-medium">Despacho Boutique</span>
            </div>
            <div class="bg-obsidian-900/90 p-4 rounded-2xl border border-stone-800/80 text-center shadow-inner">
              <span class="block text-2xl font-serif font-bold text-gold-400">SIAT</span>
              <span class="text-[11px] text-stone-400 tracking-wider uppercase font-medium">Factura con CUF</span>
            </div>
          </div>
        </div>

        <!-- Hero Feature Card -->
        <div class="lg:col-span-5 relative">
          <div class="relative mx-auto max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-gold-500/30 group bg-stone-900">
            <img
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
              alt="Marraqueta Paceña Tradicional"
              class="w-full h-84 object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-obsidian-950/40 to-transparent flex flex-col justify-end p-6">
              <div class="flex items-center justify-between mb-1">
                <span class="text-gold-400 text-[10px] uppercase tracking-[0.2em] font-semibold">Pieza Insignia</span>
                <span class="bg-gold-500/20 text-gold-300 text-[10px] font-medium px-2 py-0.5 rounded border border-gold-500/30">Piedra Viva</span>
              </div>
              <h3 class="font-serif text-2xl font-bold text-white tracking-wide">Marraqueta Paceña</h3>
              <p class="text-xs text-stone-300 mt-1 line-clamp-2 font-light">Corteza crocante cocida al vapor sobre solera de piedra refractaria.</p>
              <div class="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between">
                <div>
                  <span class="text-xs text-stone-400 uppercase tracking-widest block font-medium">Precio</span>
                  <span class="text-xl font-bold text-gold-300 font-mono">Bs. 0.80</span>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    v-if="catalogStore.products[0]"
                    @click="openDetailModal(catalogStore.products[0])"
                    class="bg-stone-800/90 hover:bg-stone-700 text-stone-300 hover:text-white px-3 py-2 rounded-xl text-xs font-medium transition-all border border-stone-700 active:scale-95"
                  >
                    Ver Ficha
                  </button>
                  <button
                    @click="cartStore.addItem(catalogStore.products[0] || { id: 'prod-001', nombre: 'Marraqueta Paceña Clásica', precioBs: 0.80 }, 1)"
                    class="bg-gold-500 hover:bg-gold-400 text-obsidian-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    Agregar a Canasta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters & Search Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-stone-200/80">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <Search class="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            v-model="catalogStore.searchQuery"
            type="text"
            placeholder="Buscar marraqueta, cuñapé, pan de arani..."
            class="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 focus:bg-white transition text-stone-900 placeholder:text-stone-400"
          />
        </div>

        <!-- National Shipping Toggle -->
        <label class="flex items-center gap-3 cursor-pointer select-none bg-stone-50 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-gold-500/40 transition">
          <input
            v-model="catalogStore.onlyNationalShipping"
            type="checkbox"
            class="w-4 h-4 text-gold-600 rounded focus:ring-gold-500 border-stone-300"
          />
          <div class="flex items-center gap-2 text-xs font-semibold text-stone-800">
            <Truck class="w-4 h-4 text-gold-600" />
            <span>Apto para Envío Nacional (9 Departamentos)</span>
          </div>
        </label>
      </div>

      <!-- Categories Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          v-for="cat in catalogStore.categories"
          :key="cat.id"
          @click="catalogStore.selectedCategory = cat.id"
          class="px-4 py-2 rounded-xl text-xs font-medium tracking-wide uppercase whitespace-nowrap transition-all flex items-center gap-1.5"
          :class="catalogStore.selectedCategory === cat.id ? 'bg-stone-900 text-gold-300 shadow-sm border border-stone-800' : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 border border-stone-200/90'"
        >
          <span>{{ cat.label }}</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="catalogStore.loading" class="text-center py-24">
        <div class="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-xs uppercase tracking-widest text-stone-500 font-medium">Preparando catálogo de panes artesanales...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="catalogStore.filteredProducts.length === 0"
        class="text-center py-20 bg-white rounded-3xl border border-stone-200/90 p-8 shadow-sm space-y-4 max-w-xl mx-auto"
      >
        <div class="w-14 h-14 mx-auto rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-500/20 text-gold-600">
          <Wheat class="w-7 h-7 stroke-1" />
        </div>
        <h3 class="font-serif text-xl font-bold text-stone-900">No encontramos variedades con esos criterios</h3>
        <p class="text-xs text-stone-500 leading-relaxed font-light">
          No hay productos disponibles para los filtros seleccionados. Intenta restablecer los filtros para explorar la colección completa.
        </p>
        <button
          @click="catalogStore.resetFilters()"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-gold-500 text-stone-100 hover:text-obsidian-950 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 border border-stone-800"
        >
          <Sparkles class="w-3.5 h-3.5 text-gold-400 group-hover:text-obsidian-950" />
          Restablecer Filtros
        </button>
      </div>

      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="product in catalogStore.filteredProducts"
          :key="product.id"
          @click="openDetailModal(product)"
          class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-gold-500/50 transition-all duration-300 border border-stone-200/80 flex flex-col justify-between group cursor-pointer"
        >
          <!-- Product Image Frame -->
          <div>
            <div class="relative h-48 overflow-hidden bg-stone-100">
              <img
                :src="product.imagenUrl"
                :alt="product.nombre"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95 group-hover:brightness-100"
                loading="lazy"
              />
              <!-- Badges -->
              <div class="absolute top-3 left-3 flex flex-col gap-1.5">
                <span
                  v-if="product.destacado"
                  class="bg-obsidian-950/90 text-gold-300 font-medium text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-md shadow border border-gold-500/30 backdrop-blur-sm"
                >
                  ★ Colección Insignia
                </span>
                <span
                  v-if="product.aptoEnvioNacional"
                  class="bg-stone-900/90 text-stone-200 font-medium text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow flex items-center gap-1 backdrop-blur-sm border border-stone-700"
                >
                  <Truck class="w-3 h-3 text-gold-400" /> Envío 9 Deptos
                </span>
              </div>
              <div class="absolute bottom-3 right-3">
                <span class="bg-obsidian-950/80 backdrop-blur-sm text-stone-300 text-[10px] font-medium px-2 py-0.5 rounded-md border border-stone-800">
                  Horneada {{ product.horarioRecomendado }}
                </span>
              </div>

              <!-- Quick View Floating Cue on Hover -->
              <div class="absolute inset-0 bg-obsidian-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span class="bg-obsidian-950/90 text-gold-300 text-[11px] font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full border border-gold-500/40 shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <Info class="w-3.5 h-3.5 text-gold-400" /> Ver Ficha Técnica
                </span>
              </div>
            </div>

            <!-- Product Details -->
            <div class="p-5 space-y-3">
              <h3 class="font-serif font-bold text-base text-stone-900 group-hover:text-amber-900 transition-colors leading-snug">
                {{ product.nombre }}
              </h3>
              <p class="text-xs text-stone-500 line-clamp-2 leading-relaxed font-light">
                {{ product.descripcion }}
              </p>

              <!-- Ingredients Chips -->
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span
                  v-for="ing in product.ingredientesPrincipales.slice(0, 3)"
                  :key="ing"
                  class="bg-stone-100 text-stone-600 text-[10px] px-2 py-0.5 rounded font-medium"
                >
                  {{ ing }}
                </span>
              </div>
            </div>
          </div>

          <!-- Price and Cart Action -->
          <div class="p-5 pt-0">
            <div class="pt-3 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span class="text-[10px] uppercase tracking-wider text-stone-400 block font-medium">Precio Unitario</span>
                <span class="text-base font-bold text-stone-900 font-mono">
                  Bs. {{ product.precioBs.toFixed(2) }}
                </span>
              </div>

              <button
                @click.stop="cartStore.addItem(product, 1)"
                class="bg-stone-900 hover:bg-gold-500 text-stone-100 hover:text-obsidian-950 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 border border-stone-800 hover:border-gold-400"
              >
                <Plus class="w-3.5 h-3.5" /> Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Ficha Técnica Artesanal y Maridajes -->
    <ProductDetailModal
      :product="selectedProduct"
      :is-open="isDetailModalOpen"
      @close="isDetailModalOpen = false"
    />
  </div>
</template>
