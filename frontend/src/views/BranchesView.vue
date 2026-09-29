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
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
    <!-- Header -->
    <div class="text-center max-w-2xl mx-auto space-y-3">
      <span class="text-[10px] font-semibold text-gold-600 uppercase tracking-[0.25em] bg-gold-100/60 border border-gold-300/40 px-3.5 py-1 rounded-full">
        Boutiques & Hornos Artesanales
      </span>
      <h1 class="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
        Presencia en los 9 Departamentos de Bolivia 🇧🇴
      </h1>
      <p class="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
        Cada una de nuestras boutiques cuenta con hornos de solera refractaria propios y maestros panaderos dedicados a elaborar piezas recién horneadas al alba y al caer la tarde.
      </p>
    </div>

    <!-- Department Selector -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start lg:justify-center">
      <button
        v-for="dept in departments"
        :key="dept"
        @click="selectedDept = dept"
        class="px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all"
        :class="selectedDept === dept ? 'bg-stone-900 text-gold-300 shadow-sm border border-stone-800' : 'bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50 border border-stone-200/90'"
      >
        {{ dept }}
      </button>
    </div>

    <!-- Branches Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="branch in filteredBranches"
        :key="branch.id"
        class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-gold-500/40 transition-all duration-300 border border-stone-200/80 space-y-5 flex flex-col justify-between group"
      >
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span
              class="text-[9px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded"
              :class="branch.esMatriz ? 'bg-obsidian-950 text-gold-300 border border-gold-500/40' : 'bg-stone-100 text-stone-700 border border-stone-200'"
            >
              {{ branch.esMatriz ? 'Maison Matriz' : branch.codigo }}
            </span>
            <span class="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Horneando Hoy
            </span>
          </div>

          <div>
            <h3 class="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
              {{ branch.nombre }}
            </h3>
            <p class="text-[11px] text-gold-600 font-medium uppercase tracking-wider mt-0.5">
              {{ branch.departamento }} • {{ branch.ciudad }}
            </p>
          </div>

          <div class="space-y-2.5 text-xs text-stone-600 font-light border-t border-stone-100 pt-3">
            <p class="flex items-start gap-2.5">
              <MapPin class="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
              <span class="text-stone-700">{{ branch.direccion }}</span>
            </p>
            <p class="flex items-center gap-2.5">
              <Phone class="w-4 h-4 text-gold-600 shrink-0" />
              <span class="font-mono text-stone-700">{{ branch.telefono }}</span>
            </p>
            <p class="flex items-center gap-2.5">
              <Clock class="w-4 h-4 text-gold-600 shrink-0" />
              <span>{{ branch.horarioAtencion }}</span>
            </p>
            <p class="flex items-center gap-2.5 text-stone-800 font-medium">
              <Flame class="w-4 h-4 text-gold-600 shrink-0" />
              <span>Capacidad: <strong class="font-mono">{{ branch.capacidadProduccionDiaria.toLocaleString() }}</strong> piezas / día</span>
            </p>
          </div>
        </div>

        <div class="pt-4 border-t border-stone-100">
          <router-link
            to="/"
            class="w-full bg-stone-50 hover:bg-stone-900 hover:text-gold-300 text-stone-800 font-medium py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-stone-200/80 hover:border-stone-900"
          >
            <Navigation class="w-3.5 h-3.5" />
            Ordenar desde esta sucursal
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
