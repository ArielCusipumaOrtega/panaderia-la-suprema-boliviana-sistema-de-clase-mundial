<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart.store';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, ShieldCheck } from 'lucide-vue-next';
import type { DepartamentoBolivia } from '@/types';

const router = useRouter();
const cartStore = useCartStore();

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

function goToCheckout() {
  cartStore.closeDrawer();
  router.push('/carrito');
}
</script>

<template>
  <!-- Backdrop -->
  <div
    v-if="cartStore.isDrawerOpen"
    class="fixed inset-0 z-50 bg-obsidian-950/75 backdrop-blur-sm transition-opacity duration-300"
    @click="cartStore.closeDrawer"
  >
    <!-- Drawer Panel -->
    <div
      class="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10"
      @click.stop
    >
      <div class="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-300">
        <!-- Header -->
        <div class="p-5 sm:p-6 bg-white border-b border-stone-200 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-stone-900 text-gold-300 flex items-center justify-center text-base border border-stone-800">
              🥖
            </div>
            <div>
              <h2 class="font-serif text-lg font-bold text-stone-900 leading-tight">
                Canasta Artesanal
              </h2>
              <p class="text-[11px] text-stone-500 font-light font-mono">
                {{ cartStore.itemCount }} {{ cartStore.itemCount === 1 ? 'pieza seleccionada' : 'piezas seleccionadas' }}
              </p>
            </div>
          </div>

          <button
            @click="cartStore.closeDrawer"
            class="text-stone-400 hover:text-stone-800 p-2 rounded-xl hover:bg-stone-100 transition"
            title="Cerrar canasta"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Body / Items List -->
        <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <!-- Empty State -->
          <div
            v-if="cartStore.items.length === 0"
            class="text-center py-16 space-y-3"
          >
            <div class="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center text-2xl mx-auto border border-stone-200">
              🛒
            </div>
            <h3 class="font-serif text-base font-bold text-stone-800">Tu canasta está vacía</h3>
            <p class="text-xs text-stone-500 font-light max-w-xs mx-auto">
              Añade marraquetas crujientes, cuñapés o panes tradicionales para recibirlos calientes.
            </p>
            <button
              @click="cartStore.closeDrawer"
              class="mt-2 inline-flex items-center gap-2 bg-stone-900 hover:bg-gold-500 text-stone-100 hover:text-obsidian-950 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border border-stone-800"
            >
              Ver Catálogo
            </button>
          </div>

          <!-- Items Stream -->
          <div v-else class="space-y-3">
            <div
              v-for="item in cartStore.items"
              :key="item.producto.id"
              class="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-sm flex items-center justify-between gap-3 group"
            >
              <img
                :src="item.producto.imagenUrl"
                :alt="item.producto.nombre"
                class="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-100"
              />

              <div class="flex-1 min-w-0 pr-1">
                <p class="font-medium text-xs text-stone-900 truncate">
                  {{ item.producto.nombre }}
                </p>
                <p class="text-stone-400 font-mono text-[11px] mt-0.5">
                  Bs. {{ item.producto.precioBs.toFixed(2) }} c/u
                </p>

                <!-- Quantity Controls -->
                <div class="flex items-center gap-2 mt-2">
                  <div class="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-lg p-0.5">
                    <button
                      @click="cartStore.updateQuantity(item.producto.id, -1)"
                      class="w-5 h-5 rounded bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center transition shadow-xs"
                    >
                      <Minus class="w-3 h-3" />
                    </button>
                    <span class="font-mono text-xs font-bold text-stone-900 w-5 text-center">
                      {{ item.cantidad }}
                    </span>
                    <button
                      @click="cartStore.updateQuantity(item.producto.id, 1)"
                      class="w-5 h-5 rounded bg-white hover:bg-stone-200 text-stone-700 flex items-center justify-center transition shadow-xs"
                    >
                      <Plus class="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    @click="cartStore.removeItem(item.producto.id)"
                    class="text-stone-400 hover:text-rose-600 p-1 rounded transition"
                    title="Eliminar de la canasta"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- Item Total -->
              <div class="text-right shrink-0">
                <span class="font-mono font-bold text-xs text-stone-950">
                  Bs. {{ (item.producto.precioBs * item.cantidad).toFixed(2) }}
                </span>
              </div>
            </div>

            <!-- Quick Department Selector inside Drawer -->
            <div class="bg-white p-3.5 rounded-2xl border border-stone-200/90 text-xs space-y-1.5 mt-4">
              <label class="block text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Cotizar Flete por Departamento
              </label>
              <select
                v-model="cartStore.selectedDepartment"
                @change="cartStore.calculateShipping"
                class="w-full p-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium text-stone-900 focus:outline-none focus:ring-1 focus:ring-gold-500"
              >
                <option v-for="d in departments" :key="d" :value="d">
                  {{ d }} (Bolivia)
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          v-if="cartStore.items.length > 0"
          class="p-5 sm:p-6 bg-white border-t border-stone-200 space-y-4"
        >
          <div class="space-y-2 text-xs font-light">
            <div class="flex justify-between text-stone-600">
              <span>Subtotal Panadería</span>
              <span class="font-mono font-semibold text-stone-900">Bs. {{ cartStore.subtotalBs.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-stone-600">
              <span class="flex items-center gap-1.5">
                <Truck class="w-3.5 h-3.5 text-gold-600" /> Flete {{ cartStore.selectedDepartment }}
              </span>
              <span class="font-mono font-semibold text-stone-900">Bs. {{ cartStore.shippingCostBs.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-stone-900 border-t border-stone-100 pt-2 font-serif">
              <span>Total Estimado</span>
              <span class="font-mono text-xl text-stone-950">Bs. {{ cartStore.totalBs.toFixed(2) }}</span>
            </div>
          </div>

          <button
            @click="goToCheckout"
            class="w-full bg-stone-900 hover:bg-gold-500 text-stone-100 hover:text-obsidian-950 font-semibold py-3.5 px-5 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 border border-stone-800 hover:border-gold-400"
          >
            <span>Finalizar Compra & Pagar</span>
            <ArrowRight class="w-4 h-4" />
          </button>

          <p class="text-[10px] text-stone-400 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck class="w-3.5 h-3.5 text-emerald-600" />
            Facturación Oficial SIAT / QR Simple BCB
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
