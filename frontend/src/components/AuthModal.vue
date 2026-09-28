<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { X, Lock, Mail, Shield, User, Sparkles } from 'lucide-vue-next';

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const errorMsg = ref('');

async function handleLogin() {
  errorMsg.value = '';
  try {
    await authStore.login(email.value, password.value);
    emit('close');
  } catch (err: any) {
    errorMsg.value = err.message || 'Error al iniciar sesión';
  }
}

function quickFill(demoEmail: string, demoPass: string) {
  email.value = demoEmail;
  password.value = demoPass;
  handleLogin();
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
    <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
      <!-- Header -->
      <div class="bg-bakery-950 p-6 text-white text-center relative">
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 text-bakery-400 hover:text-white p-1 rounded-full hover:bg-bakery-800 transition"
        >
          <X class="w-5 h-5" />
        </button>
        <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl mx-auto mb-3">
          🥖
        </div>
        <h3 class="font-serif text-2xl font-bold">Portal Panadería La Suprema</h3>
        <p class="text-xs text-bakery-300 mt-1">Acceso para Clientes y Personal de Sucursal</p>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-5">
        <div v-if="errorMsg" class="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-200">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Correo Electrónico</label>
            <div class="relative">
              <Mail class="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                v-model="email"
                type="email"
                required
                placeholder="ejemplo@panaderia.bo"
                class="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Contraseña</label>
            <div class="relative">
              <Lock class="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                v-model="password"
                type="password"
                required
                placeholder="••••••••"
                class="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs shadow-md transition disabled:opacity-50"
          >
            {{ authStore.loading ? 'Verificando...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <!-- Demo Accounts Quick Fill -->
        <div class="border-t border-gray-100 pt-4">
          <p class="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles class="w-3.5 h-3.5 text-amber-500" /> Cuentas de Prueba Rápida (Demo):
          </p>
          <div class="grid grid-cols-2 gap-2 text-[11px]">
            <button
              @click="quickFill('admin@panaderia.bo', 'Admin123!')"
              class="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left font-semibold text-amber-900 transition"
            >
              👑 Administrador
              <span class="block text-[10px] text-gray-500 font-normal">Acceso Total</span>
            </button>
            <button
              @click="quickFill('panadero@panaderia.bo', 'Pan123!')"
              class="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left font-semibold text-amber-900 transition"
            >
              👨‍🍳 Maestro Panadero
              <span class="block text-[10px] text-gray-500 font-normal">Hornadas & Mermas</span>
            </button>
            <button
              @click="quickFill('cajero@panaderia.bo', 'Cajero123!')"
              class="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left font-semibold text-amber-900 transition"
            >
              💵 Cajero Sucursal
              <span class="block text-[10px] text-gray-500 font-normal">POS & Arqueo</span>
            </button>
            <button
              @click="quickFill('cliente@gmail.com', 'Cliente123!')"
              class="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left font-semibold text-amber-900 transition"
            >
              🛒 Cliente Frecuente
              <span class="block text-[10px] text-gray-500 font-normal">Compras & Facturas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
