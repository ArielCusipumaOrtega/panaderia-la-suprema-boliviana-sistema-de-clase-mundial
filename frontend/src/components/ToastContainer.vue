<script setup lang="ts">
import { useToastStore } from '@/stores/toast.store';
import { CheckCircle2, AlertTriangle, XCircle, Sparkles, X } from 'lucide-vue-next';

const toastStore = useToastStore();
</script>

<template>
  <div class="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-4"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto w-full bg-obsidian-950/95 backdrop-blur-md rounded-2xl shadow-2xl border p-4 flex items-start gap-3 relative overflow-hidden group"
        :class="{
          'border-gold-500/40 text-stone-100': toast.type === 'success',
          'border-rose-500/40 text-stone-100': toast.type === 'error',
          'border-amber-500/40 text-stone-100': toast.type === 'warning',
          'border-stone-700/60 text-stone-100': toast.type === 'info',
        }"
      >
        <!-- Icon -->
        <div class="shrink-0 mt-0.5">
          <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5 text-gold-400" />
          <XCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-rose-400" />
          <AlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5 text-amber-400" />
          <Sparkles v-else class="w-5 h-5 text-gold-400" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0 pr-2">
          <p class="text-xs font-serif font-bold text-white tracking-wide leading-tight">
            {{ toast.title }}
          </p>
          <p v-if="toast.message" class="text-[11px] text-stone-300 font-light mt-0.5 leading-relaxed">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close Button -->
        <button
          @click="toastStore.removeToast(toast.id)"
          class="shrink-0 text-stone-500 hover:text-stone-200 p-1 rounded-lg transition"
        >
          <X class="w-4 h-4" />
        </button>

        <!-- Subtle Top Colored Line -->
        <div
          class="absolute top-0 left-0 right-0 h-[2px]"
          :class="{
            'bg-gradient-to-r from-gold-400 to-amber-600': toast.type === 'success',
            'bg-gradient-to-r from-rose-500 to-red-600': toast.type === 'error',
            'bg-gradient-to-r from-amber-400 to-amber-600': toast.type === 'warning',
            'bg-gradient-to-r from-stone-400 to-gold-400': toast.type === 'info',
          }"
        ></div>
      </div>
    </TransitionGroup>
  </div>
</template>
