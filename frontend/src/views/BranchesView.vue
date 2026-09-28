<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCatalogStore } from '@/stores/catalog.store';
import { MapPin, Phone, Clock, Flame, CheckCircle, Navigation } from 'lucide-vue-next';
import type { DepartamentoBolivia } from '@/types';

const catalogStore = useCatalogStore();
const selectedDept = ref<DepartamentoBolivia | 'TODOS'>('TODOS');

const departments: Array<DepartamentoBolivia | 'TODOS'> = [
  'TODOS',
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

onMounted(async () => {
  await catalogStore.fetchBranches();
});

const filteredBranches = computed(() => {
  if (selectedDept.value === 'TODOS') return catalogStore.branches;
  return catalogStore.branches.filter((b) => b.departamento === selectedDept.value);
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
    <!-- Header -->
    <div class="text-center max-w-2xl mx-auto space-y-3">
      <span class="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">
        Red de Sucursales Físicas
      </span>
      <h1 class="font-serif text-3xl sm:text-4xl font-black text-gray-900">
        Presencia en los 9 Departamentos de Bolivia 🇧🇴
      </h1>
      <p class="text-xs sm:text-sm text-gray-600">
        Cada sucursal cuenta con hornos de piedra refractaria propios y maestros panaderos certificados para garantizar pan caliente tanto de madrugada como de tarde.
      </p>
    </div>

    <!-- Department Selector -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start lg:justify-center">
      <button
        v-for="dept in departments"
        :key="dept"
        @click="selectedDept = dept"
        class="px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all"
        :class="selectedDept === dept ? 'bg-amber-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'"
      >
        {{ dept }}
      </button>
    </div>

    <!-- Branches Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="branch in filteredBranches"
        :key="branch.id"
        class="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all border border-bakery-200 space-y-4 flex flex-col justify-between"
      >
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" :class="branch.esMatriz ? 'bg-bolivia-red text-white' : 'bg-amber-100 text-amber-800'">
              {{ branch.esMatriz ? 'Casa Matriz' : branch.codigo }}
            </span>
            <span class="text-xs font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle class="w-3.5 h-3.5" /> Abierto Hoy
            </span>
          </div>

          <h3 class="font-serif text-lg font-bold text-gray-900">{{ branch.nombre }}</h3>

          <div class="space-y-2 text-xs text-gray-600">
            <p class="flex items-start gap-2">
              <MapPin class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{{ branch.direccion }}, {{ branch.ciudad }}</span>
            </p>
            <p class="flex items-center gap-2">
              <Phone class="w-4 h-4 text-amber-600 shrink-0" />
              <span>{{ branch.telefono }}</span>
            </p>
            <p class="flex items-center gap-2">
              <Clock class="w-4 h-4 text-amber-600 shrink-0" />
              <span>{{ branch.horarioAtencion }}</span>
            </p>
            <p class="flex items-center gap-2 text-bakery-800 font-semibold">
              <Flame class="w-4 h-4 text-amber-600 shrink-0" />
              <span>Capacidad: {{ branch.capacidadProduccionDiaria }} piezas/día</span>
            </p>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100">
          <router-link
            to="/"
            class="w-full bg-bakery-50 hover:bg-amber-100 text-amber-900 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition"
          >
            <Navigation class="w-3.5 h-3.5" />
            Pedir desde esta sucursal
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
