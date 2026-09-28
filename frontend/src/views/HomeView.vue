<script setup lang="ts">
import { onMounted } from 'vue';
import { useCatalogStore } from '@/stores/catalog.store';
import { useCartStore } from '@/stores/cart.store';
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
} from 'lucide-vue-next';

const catalogStore = useCatalogStore();
const cartStore = useCartStore();

onMounted(async () => {
  if (catalogStore.products.length === 0) {
    await catalogStore.fetchProducts();
  }
});
</script>

<template>
  <div class="space-y-12 pb-16">
    <!-- Hero Banner -->
    <section class="relative bg-gradient-to-br from-bakery-950 via-bakery-900 to-amber-950 text-white rounded-3xl overflow-hidden shadow-2xl mx-4 sm:mx-6 lg:mx-8 mt-6 border border-amber-900/40">
      <div class="absolute inset-0 opacity-15 bg-[radial-gradient(#D58235_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div class="max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div class="lg:col-span-7 space-y-6">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Sparkles class="w-3.5 h-3.5" />
            <span>Pan Artesanal a la Piedra • Tradición de Bolivia 🇧🇴</span>
          </div>
          
          <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
            El Verdadero Pan <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
              Crujiente & Caliente
            </span>
          </h1>

          <p class="text-sm sm:text-base text-bakery-200/90 max-w-xl leading-relaxed">
            De la piedra a tu mesa en los <strong>9 departamentos de Bolivia</strong>. Marraquetas paceñas crujientes, cuñapés con auténtico queso chaqueño, Pan de Arani del Valle y pastelería fina macerada con Singani.
          </p>

          <!-- Key Badges -->
          <div class="grid grid-cols-3 gap-3 pt-2 max-w-lg">
            <div class="bg-bakery-900/80 p-3 rounded-2xl border border-bakery-800 text-center">
              <span class="block text-xl font-black text-amber-400">9</span>
              <span class="text-[11px] text-bakery-300">Departamentos</span>
            </div>
            <div class="bg-bakery-900/80 p-3 rounded-2xl border border-bakery-800 text-center">
              <span class="block text-xl font-black text-amber-400">30 min</span>
              <span class="text-[11px] text-bakery-300">Delivery Express</span>
            </div>
            <div class="bg-bakery-900/80 p-3 rounded-2xl border border-bakery-800 text-center">
              <span class="block text-xl font-black text-amber-400">SIAT</span>
              <span class="text-[11px] text-bakery-300">Factura con CUF</span>
            </div>
          </div>
        </div>

        <!-- Hero Feature Card -->
        <div class="lg:col-span-5 relative">
          <div class="relative mx-auto max-w-sm rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-500/30 group">
            <img
              src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80"
              alt="Marraqueta Paceña Tradicional"
              class="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6">
              <span class="text-amber-400 text-xs font-bold uppercase tracking-wider">Pan Insignia</span>
              <h3 class="font-serif text-2xl font-bold text-white">Marraqueta Paceña Tradicional</h3>
              <p class="text-xs text-bakery-200 mt-1">Corteza crocante cocida al vapor sobre piso refractario.</p>
              <div class="mt-3 flex items-center justify-between">
                <span class="text-xl font-black text-white">Bs. 0.80 <span class="text-xs font-normal text-bakery-300">/ unidad</span></span>
                <span class="bg-bolivia-red text-white text-[10px] font-bold px-2 py-1 rounded-md">Horneada Madrugada</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters & Search Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-bakery-200">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <Search class="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            v-model="catalogStore.searchQuery"
            type="text"
            placeholder="Buscar marraqueta, cuñapé, pan de arani..."
            class="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-bakery-50 rounded-2xl border border-bakery-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
          />
        </div>

        <!-- National Shipping Toggle -->
        <label class="flex items-center gap-3 cursor-pointer select-none bg-bakery-50 px-4 py-2.5 rounded-2xl border border-bakery-200 hover:border-amber-400 transition">
          <input
            v-model="catalogStore.onlyNationalShipping"
            type="checkbox"
            class="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-gray-300"
          />
          <div class="flex items-center gap-1.5 text-xs font-bold text-bakery-900">
            <Truck class="w-4 h-4 text-amber-600" />
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
          class="px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5"
          :class="catalogStore.selectedCategory === cat.id ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20' : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'"
        >
          <span>{{ cat.label }}</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="catalogStore.loading" class="text-center py-20">
        <div class="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-sm font-semibold text-gray-600">Cargando catálogo artesanal boliviano...</p>
      </div>

      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="product in catalogStore.filteredProducts"
          :key="product.id"
          class="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-bakery-200 flex flex-col group"
        >
          <!-- Product Image -->
          <div class="relative h-48 overflow-hidden bg-bakery-100">
            <img
              :src="product.imagenUrl"
              :alt="product.nombre"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <!-- Badges -->
            <div class="absolute top-3 left-3 flex flex-col gap-1">
              <span
                v-if="product.destacado"
                class="bg-amber-500 text-bakery-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow"
              >
                ★ Favorito
              </span>
              <span
                v-if="product.aptoEnvioNacional"
                class="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow flex items-center gap-1"
              >
                <Truck class="w-3 h-3" /> Envío Nacional
              </span>
            </div>
            <div class="absolute bottom-3 right-3">
              <span class="bg-black/75 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-lg">
                Turno {{ product.horarioRecomendado }}
              </span>
            </div>
          </div>

          <!-- Product Details -->
          <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <h3 class="font-serif font-bold text-base text-gray-900 group-hover:text-amber-700 transition">
                {{ product.nombre }}
              </h3>
              <p class="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                {{ product.descripcion }}
              </p>

              <!-- Ingredients Tags -->
              <div class="flex flex-wrap gap-1 mt-3">
                <span
                  v-for="ing in product.ingredientesPrincipales.slice(0, 3)"
                  :key="ing"
                  class="bg-bakery-50 text-bakery-800 text-[10px] px-2 py-0.5 rounded-md font-medium border border-bakery-200"
                >
                  {{ ing }}
                </span>
              </div>
            </div>

            <!-- Price and Cart Action -->
            <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span class="text-xs text-gray-400 block font-medium">Precio</span>
                <span class="text-lg font-black text-bakery-950">
                  Bs. {{ product.precioBs.toFixed(2) }}
                </span>
              </div>

              <button
                @click="cartStore.addItem(product, 1)"
                class="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <Plus class="w-4 h-4" /> Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
