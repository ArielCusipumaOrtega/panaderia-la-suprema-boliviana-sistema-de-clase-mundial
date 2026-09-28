import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import type { Order, Invoice } from '@/types';

export const useOrderStore = defineStore('order', () => {
  const currentOrder = ref<Order | null>(null);
  const currentInvoice = ref<Invoice | null>(null);
  const loading = ref<boolean>(false);
  const isQrModalOpen = ref<boolean>(false);
  const isInvoiceModalOpen = ref<boolean>(false);
  const error = ref<string | null>(null);

  async function createOrder(payload: {
    clienteNombre: string;
    clienteTelefono: string;
    clienteCiNit: string;
    razonSocialFactura?: string;
    departamentoDestino: string;
    ciudadDestino: string;
    direccionEntrega: string;
    referenciaDireccion?: string;
    tipoEntrega: string;
    items: Array<{ productoId: string; cantidad: number }>;
    metodoPago: string;
    observaciones?: string;
  }) {
    loading.value = true;
    error.value = null;
    try {
      const order = await api.post<Order>('/pedidos', payload);
      currentOrder.value = order;
      if (order.metodoPago === 'QR_SIMPLE') {
        isQrModalOpen.value = true;
      }
      return order;
    } catch (err: any) {
      error.value = err.message || 'Error al procesar el pedido';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function checkOrderStatus(orderId: string) {
    try {
      const order = await api.get<Order>(`/pedidos/${orderId}`);
      if (currentOrder.value && currentOrder.value.id === orderId) {
        currentOrder.value = order;
      }
      return order;
    } catch (err) {
      console.error('Error al consultar estado del pedido:', err);
      return null;
    }
  }

  async function emitInvoice(orderId: string) {
    loading.value = true;
    try {
      const invoice = await api.post<Invoice>('/facturacion/emitir', { pedidoId: orderId });
      currentInvoice.value = invoice;
      isInvoiceModalOpen.value = true;
      return invoice;
    } catch (err: any) {
      error.value = err.message || 'Error al emitir factura SIAT';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function simulatePaymentSuccess(orderId: string) {
    try {
      await api.post('/pagos/confirmar', {
        pedidoId: orderId,
        referenciaTransaccion: `BCB-TEST-${Date.now()}`,
      });
      await checkOrderStatus(orderId);
    } catch (err) {
      console.error('Error al simular pago:', err);
    }
  }

  return {
    currentOrder,
    currentInvoice,
    loading,
    error,
    isQrModalOpen,
    isInvoiceModalOpen,
    createOrder,
    checkOrderStatus,
    emitInvoice,
    simulatePaymentSuccess,
  };
});
