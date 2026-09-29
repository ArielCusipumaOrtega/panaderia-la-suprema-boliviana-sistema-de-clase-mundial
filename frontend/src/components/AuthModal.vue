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
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
    <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
      <!-- Header -->
      <div class="bg-obsidian-950 p-6 text-stone-100 text-center relative border-b border-stone-800">
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition"
        >
          <X class="w-5 h-5" />
        </button>
        <div class="w-12 h-12 rounded-xl bg-stone-900 text-gold-300 border border-gold-500/30 flex items-center justify-center text-xl mx-auto mb-3 shadow-inner">
          🥖
        </div>
        <h3 class="font-serif text-2xl font-bold text-white tracking-wide">Maison La Suprema</h3>
        <p class="text-xs text-stone-400 mt-1 font-light">Portal de Clientes & Maestros de Sucursal</p>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-5">
        <div v-if="errorMsg" class="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-200">
          {{ errorMsg }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Correo Electrónico</label>
            <div class="relative">
              <Mail class="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                v-model="email"
                type="email"
                required
                placeholder="ejemplo@panaderia.bo"
                class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition text-stone-900 placeholder:text-stone-400"
              />
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Contraseña</label>
            <div class="relative">
              <Lock class="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                v-model="password"
                type="password"
                required
                placeholder="••••••••"
                class="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition text-stone-900 placeholder:text-stone-400"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full bg-stone-900 hover:bg-gold-600 text-stone-100 hover:text-white font-semibold py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all active:scale-98 disabled:opacity-50 border border-stone-800 hover:border-gold-500"
          >
            {{ authStore.loading ? 'Verificando...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <!-- Demo Accounts Quick Fill -->
        <div class="border-t border-stone-100 pt-4">
          <p class="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-gold-500" /> Cuentas de Acceso Rápido (Demo):
          </p>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <button
              @click="quickFill('admin@panaderia.bo', 'Admin123!')"
              class="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-gold-500/40 rounded-xl text-left transition"
            >
              <span class="block font-semibold text-stone-900 text-xs">👑 Administrador</span>
              <span class="block text-[10px] text-stone-500 font-light">Acceso Total</span>
            </button>
            <button
              @click="quickFill('panadero@panaderia.bo', 'Pan123!')"
              class="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-gold-500/40 rounded-xl text-left transition"
            >
              <span class="block font-semibold text-stone-900 text-xs">👨‍🍳 Maestro Panadero</span>
              <span class="block text-[10px] text-stone-500 font-light">Hornadas & Soleras</span>
            </button>
            <button
              @click="quickFill('cajero@panaderia.bo', 'Cajero123!')"
              class="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-gold-500/40 rounded-xl text-left transition"
            >
              <span class="block font-semibold text-stone-900 text-xs">💵 Cajero Boutique</span>
              <span class="block text-[10px] text-stone-500 font-light">POS & Arqueo</span>
            </button>
            <button
              @click="quickFill('cliente@gmail.com', 'Cliente123!')"
              class="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-gold-500/40 rounded-xl text-left transition"
            >
              <span class="block font-semibold text-stone-900 text-xs">🛒 Cliente Frecuente</span>
              <span class="block text-[10px] text-stone-500 font-light">Pedidos & Factura</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
