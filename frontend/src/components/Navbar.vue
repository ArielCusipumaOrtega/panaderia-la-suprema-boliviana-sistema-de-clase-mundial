<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import {
  ShoppingBag,
  MapPin,
  FileText,
  BarChart3,
  User as UserIcon,
  LogOut,
  Sparkles,
  Search,
} from 'lucide-vue-next';
import api from '@/services/api';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const isBackendOnline = ref(true);
const backendInfo = ref<any>(null);
const showAuthModal = defineModel<boolean>('showAuth', { default: false });

onMounted(async () => {
  try {
    const res = await api.get<any>('/health');
    isBackendOnline.value = res?.status === 'ok';
    backendInfo.value = res;
  } catch {
    isBackendOnline.value = false;
  }
});
</script>

<template>
  <header class="sticky top-0 z-40 bg-obsidian-950/95 backdrop-blur-md text-stone-100 shadow-2xl border-b border-stone-800/80">
    <!-- Top Hairline Bolivian Flag Accent -->
    <div class="h-[2px] w-full bg-gradient-to-r from-bolivia-red via-gold-400 to-bolivia-green opacity-80"></div>

    <!-- Micro Announcement Bar -->
    <div class="bg-obsidian-900/90 py-1.5 px-4 text-xs text-stone-400 border-b border-stone-800/50">
      <div class="max-w-7xl mx-auto flex items-center justify-between tracking-wide">
        <div class="flex items-center gap-2.5">
          <span class="inline-flex items-center gap-1.5 text-gold-400 font-medium text-[11px] uppercase tracking-widest">
            <Sparkles class="w-3 h-3 text-gold-400" /> Selección Artesanal Diaria
          </span>
          <span class="hidden md:inline text-stone-600 text-xs">•</span>
          <span class="hidden md:inline text-stone-300 text-[11px]">
            Horneadas en piedra viva: <strong>04:30 AM</strong> & <strong>15:30 PM</strong>
          </span>
        </div>

        <div class="flex items-center gap-4 text-[11px]">
          <div
            class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-obsidian-800/80 border border-stone-700/60"
            :title="isBackendOnline ? 'Backend PostgreSQL Conectado' : 'Backend Desconectado'"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"
            ></span>
            <span class="text-stone-300 font-medium">
              {{ isBackendOnline ? 'Red 9 Departamentos Activa' : 'Offline' }}
            </span>
          </div>
          <span class="hidden sm:inline text-stone-600">|</span>
          <span class="hidden sm:inline text-stone-400 font-mono text-[10px]">NIT SIAT: 3049182019</span>
        </div>
      </div>
    </div>

    <!-- Main Navigation Bar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Logo & Maison Brand -->
        <router-link to="/" class="flex items-center gap-3.5 group">
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-stone-900 to-obsidian-950 flex items-center justify-center text-xl shadow-lg border border-gold-500/30 group-hover:border-gold-400 transition-colors">
            🥖
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-serif text-xl sm:text-2xl font-bold tracking-wider text-stone-100 group-hover:text-gold-300 transition-colors">
                LA SUPREMA
              </span>
              <span class="text-[9px] uppercase tracking-widest bg-gold-500/10 text-gold-400 px-2 py-0.5 rounded-sm border border-gold-500/30 font-semibold">
                Bolivia
              </span>
            </div>
            <p class="text-[10px] text-stone-400 tracking-[0.2em] uppercase font-medium">
              Panadería & Repostería Artesanal
            </p>
          </div>
        </router-link>

        <!-- Centered Navigation Links -->
        <nav class="hidden md:flex items-center gap-1.5">
          <router-link
            to="/"
            class="px-3.5 py-2 rounded-lg text-xs tracking-wider uppercase font-medium transition-all"
            :class="$route.path === '/' ? 'bg-stone-900/90 text-gold-300 border border-stone-800 shadow-sm' : 'text-stone-300 hover:text-white hover:bg-stone-900/50'"
          >
            Catálogo de Panes
          </router-link>

          <router-link
            to="/sucursales"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs tracking-wider uppercase font-medium transition-all"
            :class="$route.path === '/sucursales' ? 'bg-stone-900/90 text-gold-300 border border-stone-800 shadow-sm' : 'text-stone-300 hover:text-white hover:bg-stone-900/50'"
          >
            <MapPin class="w-3.5 h-3.5 text-gold-400" />
            9 Departamentos
          </router-link>

          <router-link
            to="/rastreo"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs tracking-wider uppercase font-medium transition-all"
            :class="$route.path === '/rastreo' ? 'bg-stone-900/90 text-gold-300 border border-stone-800 shadow-sm' : 'text-stone-300 hover:text-white hover:bg-stone-900/50'"
          >
            <FileText class="w-3.5 h-3.5 text-gold-400" />
            Rastreo & SIAT
          </router-link>

          <router-link
            to="/tablero"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs tracking-wider uppercase font-medium transition-all"
            :class="$route.path === '/tablero' ? 'bg-stone-900/90 text-gold-300 border border-stone-800 shadow-sm' : 'text-stone-300 hover:text-white hover:bg-stone-900/50'"
          >
            <BarChart3 class="w-3.5 h-3.5 text-gold-400" />
            Tablero Gerencial
          </router-link>
        </nav>

        <!-- Right Controls -->
        <div class="flex items-center gap-3">
          <!-- Auth User Menu -->
          <div v-if="authStore.isAuthenticated" class="relative group">
            <button
              class="flex items-center gap-2 bg-obsidian-900 hover:bg-obsidian-850 text-stone-200 px-3 py-2 rounded-xl text-xs font-medium border border-stone-800 transition-colors"
            >
              <div class="w-6 h-6 rounded-full bg-gold-600/30 text-gold-300 border border-gold-500/40 flex items-center justify-center font-bold text-xs">
                {{ authStore.user?.nombreCompleto?.charAt(0) || 'U' }}
              </div>
              <span class="max-w-[120px] truncate hidden sm:inline text-xs">{{ authStore.user?.nombreCompleto }}</span>
            </button>
            <div class="absolute right-0 mt-2 w-52 bg-obsidian-900 text-stone-200 rounded-2xl shadow-2xl py-2 hidden group-hover:block border border-stone-800">
              <div class="px-4 py-2 border-b border-stone-800">
                <p class="text-xs font-bold text-stone-100">{{ authStore.user?.nombreCompleto }}</p>
                <p class="text-[10px] text-gold-400 uppercase tracking-widest font-mono mt-0.5">{{ authStore.user?.role }}</p>
              </div>
              <button
                @click="authStore.logout"
                class="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 font-medium transition"
              >
                <LogOut class="w-3.5 h-3.5" /> Cerrar Sesión
              </button>
            </div>
          </div>

          <button
            v-else
            @click="showAuthModal = true"
            class="flex items-center gap-1.5 bg-obsidian-900 hover:bg-obsidian-850 text-stone-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-medium border border-stone-800 hover:border-gold-500/40 transition-all"
          >
            <UserIcon class="w-3.5 h-3.5 text-gold-400" />
            <span class="hidden sm:inline tracking-wider uppercase text-[11px]">Acceso</span>
          </button>

          <!-- Shopping Cart Pill Trigger -->
          <button
            @click="cartStore.openDrawer"
            class="relative flex items-center gap-2.5 bg-gradient-to-r from-stone-900 via-obsidian-900 to-stone-900 hover:border-gold-400 text-stone-100 px-4 py-2.5 rounded-xl text-xs font-medium border border-stone-700/80 shadow-lg hover:shadow-gold-500/5 transition-all group"
            title="Abrir Canasta Artesanal"
          >
            <ShoppingBag class="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
            <span class="hidden sm:inline font-mono text-xs tracking-tight font-semibold text-stone-200">
              Bs. {{ cartStore.totalBs.toFixed(2) }}
            </span>
            <span
              v-if="cartStore.itemCount > 0"
              class="bg-gold-500 text-obsidian-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md"
            >
              {{ cartStore.itemCount }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
