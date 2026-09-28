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
  <header class="sticky top-0 z-40 bg-bakery-950 text-white shadow-xl border-b border-bakery-800">
    <!-- Top Announcement Bar -->
    <div class="bg-gradient-to-r from-bolivia-red via-bolivia-yellow to-bolivia-green h-1"></div>
    <div class="bg-bakery-900/60 py-1.5 px-4 text-xs text-bakery-200 border-b border-bakery-800/60">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1 text-amber-300 font-semibold">
            <Sparkles class="w-3.5 h-3.5" /> Horneado Artesanal Hoy:
          </span>
          <span class="hidden sm:inline">Turno Madrugada (04:30 AM) & Tarde (15:30 PM) en caliente</span>
        </div>
        <div class="flex items-center gap-3 text-xs">
          <div class="flex items-center gap-1.5" :title="isBackendOnline ? 'Backend PostgreSQL Conectado' : 'Backend Desconectado'">
            <span
              class="w-2 h-2 rounded-full"
              :class="isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"
            ></span>
            <span class="text-[11px] text-bakery-300 font-medium">
              {{ isBackendOnline ? 'PostgreSQL 9 Deptos Conectado' : 'Sin Conexión' }}
            </span>
          </div>
          <span class="hidden md:inline text-bakery-500">|</span>
          <span class="hidden md:inline">NIT SIAT: 3049182019</span>
        </div>
      </div>
    </div>

    <!-- Main Navigation Header -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Logo Brand -->
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-2xl shadow-lg border border-amber-300/30 group-hover:scale-105 transition-transform">
            🥖
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                La Suprema
              </span>
              <span class="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold">
                Bolivia 🇧🇴
              </span>
            </div>
            <p class="text-[11px] text-bakery-300 tracking-wider uppercase font-medium">
              Panadería & Pastelería de Clase Mundial
            </p>
          </div>
        </router-link>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-1 lg:gap-2">
          <router-link
            to="/"
            class="px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
            :class="$route.path === '/' ? 'bg-bakery-800 text-amber-300 shadow-inner' : 'text-bakery-200 hover:text-white hover:bg-bakery-900'"
          >
            Catálogo de Panes
          </router-link>

          <router-link
            to="/sucursales"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
            :class="$route.path === '/sucursales' ? 'bg-bakery-800 text-amber-300 shadow-inner' : 'text-bakery-200 hover:text-white hover:bg-bakery-900'"
          >
            <MapPin class="w-4 h-4 text-amber-400" />
            9 Departamentos
          </router-link>

          <router-link
            to="/rastreo"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
            :class="$route.path === '/rastreo' ? 'bg-bakery-800 text-amber-300 shadow-inner' : 'text-bakery-200 hover:text-white hover:bg-bakery-900'"
          >
            <FileText class="w-4 h-4 text-amber-400" />
            Rastreo & SIAT
          </router-link>

          <router-link
            to="/tablero"
            class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
            :class="$route.path === '/tablero' ? 'bg-bakery-800 text-amber-300 shadow-inner' : 'text-bakery-200 hover:text-white hover:bg-bakery-900'"
          >
            <BarChart3 class="w-4 h-4 text-amber-400" />
            Tablero Gerencial
          </router-link>
        </nav>

        <!-- Right Action Buttons -->
        <div class="flex items-center gap-3">
          <!-- Auth User Button -->
          <div v-if="authStore.isAuthenticated" class="relative group">
            <button
              class="flex items-center gap-2 bg-bakery-800 hover:bg-bakery-700 text-amber-200 px-3 py-2 rounded-xl text-xs font-semibold border border-bakery-700 transition-colors"
            >
              <div class="w-6 h-6 rounded-full bg-amber-500 text-bakery-950 flex items-center justify-center font-bold">
                {{ authStore.user?.nombreCompleto?.charAt(0) || 'U' }}
              </div>
              <span class="max-w-[120px] truncate hidden sm:inline">{{ authStore.user?.nombreCompleto }}</span>
            </button>
            <div class="absolute right-0 mt-1 w-48 bg-white text-gray-800 rounded-xl shadow-2xl py-2 hidden group-hover:block border border-gray-100">
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-xs font-bold text-gray-900">{{ authStore.user?.nombreCompleto }}</p>
                <p class="text-[11px] text-amber-700 font-semibold">{{ authStore.user?.role }}</p>
              </div>
              <button
                @click="authStore.logout"
                class="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
              >
                <LogOut class="w-3.5 h-3.5" /> Cerrar Sesión
              </button>
            </div>
          </div>

          <button
            v-else
            @click="showAuthModal = true"
            class="flex items-center gap-1.5 bg-bakery-800 hover:bg-bakery-700 text-amber-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-bakery-700 transition-colors"
          >
            <UserIcon class="w-4 h-4 text-amber-400" />
            <span class="hidden sm:inline">Ingresar</span>
          </button>

          <!-- Cart Trigger Button -->
          <router-link
            to="/carrito"
            class="relative flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all hover:scale-105"
          >
            <ShoppingBag class="w-5 h-5" />
            <span class="hidden sm:inline font-semibold">Bs. {{ cartStore.totalBs.toFixed(2) }}</span>
            <span
              v-if="cartStore.itemCount > 0"
              class="absolute -top-2 -right-2 bg-bolivia-red text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-bakery-950 shadow-lg"
            >
              {{ cartStore.itemCount }}
            </span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>
