import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CartItem, Product, DepartamentoBolivia, ShippingQuote } from '@/types';
import api from '@/services/api';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(
    JSON.parse(localStorage.getItem('cart_suprema_bo') || '[]')
  );

  const selectedDepartment = ref<DepartamentoBolivia>('Santa Cruz');
  const selectedCity = ref<string>('Santa Cruz de la Sierra');
  const deliveryType = ref<'EXPRESS_LOCAL' | 'PROGRAMADO' | 'DESPACHO_INTERDEPARTAMENTAL'>('EXPRESS_LOCAL');
  const shippingQuote = ref<ShippingQuote | null>(null);
  const loadingShipping = ref<boolean>(false);

  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.cantidad, 0);
  });

  const subtotalBs = computed(() => {
    const sum = items.value.reduce(
      (total, item) => total + item.producto.precioBs * item.cantidad,
      0
    );
    return Math.round(sum * 100) / 100;
  });

  const shippingCostBs = computed(() => {
    return shippingQuote.value?.costoEnvioBs || (deliveryType.value === 'EXPRESS_LOCAL' ? 10 : 25);
  });

  const totalBs = computed(() => {
    return Math.round((subtotalBs.value + shippingCostBs.value) * 100) / 100;
  });

  function persistCart() {
    localStorage.setItem('cart_suprema_bo', JSON.stringify(items.value));
  }

  function addItem(producto: Product, cantidad = 1) {
    const existing = items.value.find((i) => i.producto.id === producto.id);
    if (existing) {
      existing.cantidad += cantidad;
    } else {
      items.value.push({ producto, cantidad });
    }
    persistCart();
  }

  function updateQuantity(productoId: string, delta: number) {
    const item = items.value.find((i) => i.producto.id === productoId);
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      removeItem(productoId);
    } else {
      persistCart();
    }
  }

  function removeItem(productoId: string) {
    items.value = items.value.filter((i) => i.producto.id !== productoId);
    persistCart();
  }

  function clearCart() {
    items.value = [];
    persistCart();
  }

  async function calculateShipping() {
    loadingShipping.value = true;
    try {
      const quote = await api.post<ShippingQuote>('/logistica/cotizar-envio', {
        departamentoDestino: selectedDepartment.value,
        ciudadDestino: selectedCity.value || selectedDepartment.value,
        tipoEntrega: deliveryType.value,
        items: items.value.map((i) => ({
          productoId: i.producto.id,
          cantidad: i.cantidad,
        })),
      });
      shippingQuote.value = quote;
    } catch (err) {
      console.warn('Error al cotizar envío, usando flete estándar:', err);
    } finally {
      loadingShipping.value = false;
    }
  }

  return {
    items,
    selectedDepartment,
    selectedCity,
    deliveryType,
    shippingQuote,
    loadingShipping,
    itemCount,
    subtotalBs,
    shippingCostBs,
    totalBs,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    calculateShipping,
  };
});
