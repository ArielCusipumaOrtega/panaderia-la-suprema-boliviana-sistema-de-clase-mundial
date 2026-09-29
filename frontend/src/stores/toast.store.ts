import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  durationMs?: number;
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);

  function addToast(options: Omit<Toast, 'id'>) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const duration = options.durationMs ?? 3500;
    const toast: Toast = { id, ...options, durationMs: duration };

    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function success(title: string, message?: string) {
    return addToast({ type: 'success', title, message });
  }

  function info(title: string, message?: string) {
    return addToast({ type: 'info', title, message });
  }

  function warning(title: string, message?: string) {
    return addToast({ type: 'warning', title, message });
  }

  function error(title: string, message?: string) {
    return addToast({ type: 'error', title, message, durationMs: 5000 });
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    info,
    warning,
    error,
  };
});
