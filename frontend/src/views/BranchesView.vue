<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCatalogStore } from '@/stores/catalog.store';
import { useCartStore } from '@/stores/cart.store';
import { useToastStore } from '@/stores/toast.store';
import {
  MapPin,
  Phone,
  Clock,
  Flame,
  CheckCircle2,
  Navigation,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Wheat,
  Sunrise,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  Building,
} from 'lucide-vue-next';
import type { DepartamentoBolivia, Branch } from '@/types';

const router = useRouter();
const catalogStore = useCatalogStore();
const cartStore = useCartStore();
const toastStore = useToastStore();

const selectedDept = ref<DepartamentoBolivia | 'TODOS'>('TODOS');
const selectedRegion = ref<'TODAS' | 'ALTIPLANO' | 'VALLES' | 'LLANOS'>('TODAS');

// Regional grouping for Bolivia
const regions = [
  { id: 'TODAS', label: 'Todas las Regiones', desc: 'Presencia en los 9 departamentos' },
  { id: 'ALTIPLANO', label: '🏔️ Altiplano & Cordillera', desc: 'La Paz, Oruro, Potosí' },
  { id: 'VALLES', label: '🌄 Valles Fértiles', desc: 'Cochabamba, Chuquisaca, Tarija' },
  { id: 'LLANOS', label: '🌿 Llanos & Amazonía', desc: 'Santa Cruz, Beni, Pando' },
];

const departmentMetadata: Record<
  DepartamentoBolivia,
  { altitud: string; especialidad: string; region: 'ALTIPLANO' | 'VALLES' | 'LLANOS' }
> = {
  'La Paz': {
    altitud: '3,640 msnm',
    especialidad: 'Marraqueta crocante de solera y Sarnitas paceñas',
    region: 'ALTIPLANO',
  },
  'Santa Cruz': {
    altitud: '416 msnm',
    especialidad: 'Cuñapé almidón de yuca con queso chaqueño curado',
    region: 'LLANOS',
  },
  'Cochabamba': {
    altitud: '2,558 msnm',
    especialidad: 'Pan de Arani tradicional con canela y queso criollo',
    region: 'VALLES',
  },
  'Chuquisaca': {
    altitud: '2,790 msnm',
    especialidad: 'Empanadas de queso chuquisaqueño y pan de batalla',
    region: 'VALLES',
  },
  'Tarija': {
    altitud: '1,874 msnm',
    especialidad: 'Empanadas blanqueadas maceradas en Singani de altura',
    region: 'VALLES',
  },
  'Oruro': {
    altitud: '3,735 msnm',
    especialidad: 'Pan dulce andino y marraquetas de altitud',
    region: 'ALTIPLANO',
  },
  'Potosí': {
    altitud: '4,067 msnm',
    especialidad: 'Chambergos potosinos y sopaipillas de solera',
    region: 'ALTIPLANO',
  },
  'Beni': {
    altitud: '155 msnm',
    especialidad: 'Pan de arroz beniano y empanadas de maíz',
    region: 'LLANOS',
  },
  'Pando': {
    altitud: '280 msnm',
    especialidad: 'Rosquitas de castaña amazónica y pan rústico',
    region: 'LLANOS',
  },
};

const departments: Array<DepartamentoBolivia | 'TODOS'> = [
  'TODOS',
  'La Paz',
  'Santa Cruz',
  'Cochabamba',
  'Chuquisaca',
  'Tarija',
  'Oruro',
  'Potosí',
  'Beni',
  'Pando',
];

// Live baking shifts calculation based on local Bolivian time (UTC-4)
const currentShiftInfo = computed(() => {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const currentDecimal = hour + minutes / 60;

  if (currentDecimal >= 4.5 && currentDecimal < 8.5) {
    return {
      turno: 'MADRUGADA',
      icon: Sunrise,
      label: 'Horneada al Alba en Solera (04:30 - 08:30)',
      sub: 'Marraquetas crocantes y sarnitas recién salidas del horno a la piedra',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
  } else if (currentDecimal >= 15 && currentDecimal < 18.5) {
    return {
      turno: 'TARDE',
      icon: Sun,
      label: 'Horneada del Lonche (15:00 - 18:30)',
      sub: 'Cuñapés calientes con queso chaqueño y Pan de Arani saliendo de solera',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    };
  } else if (currentDecimal >= 18.5 && currentDecimal < 22) {
    return {
      turno: 'NOCTURNO',
      icon: Moon,
      label: 'Horneada Nocturna & Rústicos (18:30 - 22:00)',
      sub: 'Baguettes de masa madre, panes andinos y pastelería fina',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    };
  } else {
    return {
      turno: 'REPOSO',
      icon: Clock,
      label: 'Fermentación en Frío de Masa Madre',
      sub: 'Soleras refractarias precalentando para el próximo turno de horneada',
      badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
    };
  }
});

onMounted(async () => {
  if (catalogStore.branches.length === 0) {
    await catalogStore.fetchBranches();
  }
});

const filteredBranches = computed(() => {
  let list = catalogStore.branches;

  if (selectedRegion.value !== 'TODAS') {
    list = list.filter((b) => {
      const meta = departmentMetadata[b.departamento];
      return meta && meta.region === selectedRegion.value;
    });
  }

  if (selectedDept.value !== 'TODOS') {
    list = list.filter((b) => b.departamento === selectedDept.value);
  }

  return list;
});

function selectBranchForDelivery(branch: Branch) {
  cartStore.selectedDepartment = branch.departamento;
  cartStore.selectedCity = branch.ciudad;
  cartStore.calculateShipping();
  toastStore.success(
    'Sucursal Seleccionada',
    `Despacho asignado desde ${branch.nombre} (${branch.departamento})`
  );
  cartStore.openDrawer();
}

function getGoogleMapsUrl(branch: Branch) {
  const query = encodeURIComponent(`${branch.nombre}, ${branch.direccion}, ${branch.ciudad}, Bolivia`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function getWhatsAppUrl(branch: Branch) {
  const phone = branch.telefono.replace(/[^\d]/g, '');
  const text = encodeURIComponent(
    `🥖 *Consulta de Pan Recién Horneado - Panadería La Suprema*\n\n` +
      `¡Hola *${branch.nombre}*! Quisiera consultar la disponibilidad de piezas recién horneadas para entrega hoy en *${branch.ciudad}*.`
  );
  return `https://wa.me/${phone}?text=${text}`;
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
    <!-- Header -->
    <div class="text-center max-w-3xl mx-auto space-y-3">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 text-gold-700 text-[10px] font-semibold tracking-[0.2em] uppercase border border-gold-500/30">
        <Sparkles class="w-3.5 h-3.5 text-gold-600" />
        <span>Red Nacional de Soleras Refractarias • Bolivia 🇧🇴</span>
      </div>

      <h1 class="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight">
        Nuestras Boutiques en los 9 Departamentos
      </h1>

      <p class="text-xs sm:text-sm text-stone-600 leading-relaxed font-light max-w-2xl mx-auto">
        Desde el Altiplano a 3,600 metros hasta los Llanos orientales y la Amazonía, cada boutique cuenta con hornos de solera viva y maestros panaderos que encienden las piedras al alba.
      </p>
    </div>

    <!-- Live Shift Announcement Banner -->
    <div class="bg-gradient-to-r from-obsidian-950 via-stone-950 to-obsidian-900 text-stone-100 rounded-3xl p-5 sm:p-6 shadow-xl border border-stone-800 relative overflow-hidden">
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-400 flex items-center justify-center border border-gold-500/30 shrink-0">
            <component :is="currentShiftInfo.icon" class="w-6 h-6 text-gold-400" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span class="text-[10px] uppercase font-bold tracking-widest text-gold-400">
                Turno en Vivo
              </span>
            </div>
            <h3 class="font-serif text-lg sm:text-xl font-bold text-white">
              {{ currentShiftInfo.label }}
            </h3>
            <p class="text-xs text-stone-300 font-light mt-0.5">
              {{ currentShiftInfo.sub }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="bg-obsidian-900/90 px-4 py-2 rounded-2xl border border-stone-800 text-center font-mono text-xs">
            <span class="text-stone-400 block text-[9px] uppercase tracking-wider font-sans">Capacidad Red</span>
            <span class="text-gold-300 font-bold text-sm">45,000 pzs/día</span>
          </div>
          <div class="bg-obsidian-900/90 px-4 py-2 rounded-2xl border border-stone-800 text-center font-mono text-xs">
            <span class="text-stone-400 block text-[9px] uppercase tracking-wider font-sans">Despacho</span>
            <span class="text-emerald-400 font-bold text-sm">Moto Térmica 30'</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Macro-Region Tabs & Department Pills -->
    <div class="space-y-4">
      <!-- Region Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-start sm:justify-center">
        <button
          v-for="reg in regions"
          :key="reg.id"
          @click="selectedRegion = reg.id as any; selectedDept = 'TODOS'"
          class="px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap"
          :class="selectedRegion === reg.id ? 'bg-stone-900 text-gold-300 shadow-md border border-stone-800' : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'"
        >
          {{ reg.label }}
        </button>
      </div>

      <!-- Department Selector Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
        <button
          v-for="dept in departments"
          :key="dept"
          @click="selectedDept = dept"
          class="px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-all"
          :class="selectedDept === dept ? 'bg-gold-500 text-obsidian-950 font-bold shadow-sm' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'"
        >
          {{ dept }}
        </button>
      </div>
    </div>

    <!-- Branches Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="branch in filteredBranches"
        :key="branch.id"
        class="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-gold-500/50 transition-all duration-300 border border-stone-200/90 flex flex-col justify-between group space-y-6"
      >
        <!-- Branch Top Info -->
        <div class="space-y-4">
          <!-- Badges Bar -->
          <div class="flex items-center justify-between">
            <span
              class="text-[9px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-md shadow-sm"
              :class="branch.esMatriz ? 'bg-obsidian-950 text-gold-300 border border-gold-500/40' : 'bg-stone-100 text-stone-700 border border-stone-200'"
            >
              {{ branch.esMatriz ? '★ Casa Matriz' : branch.codigo }}
            </span>

            <span class="text-[11px] font-medium text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Horneando en Vivo
            </span>
          </div>

          <!-- Name & Department -->
          <div>
            <h3 class="font-serif text-xl font-bold text-stone-900 group-hover:text-amber-900 transition-colors leading-snug">
              {{ branch.nombre }}
            </h3>

            <div class="flex items-center gap-2 mt-1 text-xs">
              <span class="font-semibold text-gold-700 uppercase tracking-wider">
                {{ branch.departamento }} • {{ branch.ciudad }}
              </span>
              <span v-if="departmentMetadata[branch.departamento]" class="text-stone-400 font-mono text-[10px]">
                ({{ departmentMetadata[branch.departamento].altitud }})
              </span>
            </div>
          </div>

          <!-- Regional Bread Specialty Highlight -->
          <div
            v-if="departmentMetadata[branch.departamento]"
            class="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 text-xs space-y-1"
          >
            <span class="text-[10px] text-stone-400 font-semibold uppercase tracking-widest block">
              Especialidad de la Casa
            </span>
            <p class="text-stone-800 font-medium">
              {{ departmentMetadata[branch.departamento].especialidad }}
            </p>
          </div>

          <!-- Address, Phone & Schedule Specs -->
          <div class="space-y-2.5 text-xs text-stone-600 font-light border-t border-stone-100 pt-3">
            <p class="flex items-start gap-2.5">
              <MapPin class="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
              <span class="text-stone-700">{{ branch.direccion }}</span>
            </p>

            <p class="flex items-center gap-2.5">
              <Phone class="w-4 h-4 text-gold-600 shrink-0" />
              <a :href="`tel:${branch.telefono}`" class="font-mono text-stone-700 hover:text-stone-900 underline underline-offset-2">
                {{ branch.telefono }}
              </a>
            </p>

            <p class="flex items-center gap-2.5">
              <Clock class="w-4 h-4 text-gold-600 shrink-0" />
              <span>{{ branch.horarioAtencion }}</span>
            </p>

            <p class="flex items-center gap-2.5 text-stone-800 font-medium">
              <Flame class="w-4 h-4 text-gold-600 shrink-0" />
              <span>Solera: <strong class="font-mono">{{ branch.capacidadProduccionDiaria.toLocaleString() }}</strong> piezas / día</span>
            </p>
          </div>
        </div>

        <!-- Action Links -->
        <div class="space-y-2.5 pt-4 border-t border-stone-100">
          <button
            @click="selectBranchForDelivery(branch)"
            class="w-full bg-stone-900 hover:bg-gold-500 text-stone-100 hover:text-obsidian-950 font-semibold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 border border-stone-800 hover:border-gold-400"
          >
            <Navigation class="w-3.5 h-3.5" />
            <span>Seleccionar como Sucursal de Despacho</span>
          </button>

          <div class="flex gap-2">
            <a
              :href="getWhatsAppUrl(branch)"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition border border-emerald-200"
            >
              <MessageCircle class="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
            </a>

            <a
              :href="getGoogleMapsUrl(branch)"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 py-2 px-3 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition border border-stone-200"
            >
              <ExternalLink class="w-3.5 h-3.5 text-stone-500" /> Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
