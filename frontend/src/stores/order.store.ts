import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';
import type { Order, Invoice } from '@/types';
import { useToastStore } from './toast.store';

export const useOrderStore = defineStore('order', () => {
  const toastStore = useToastStore();
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
      // Open the payment & confirmation hub for all payment methods
      isQrModalOpen.value = true;
      toastStore.success(
        'Pedido Registrado',
        `Código ${order.codigoPedido} generado en sucursal ${order.departamentoDestino}`
      );
      return order;
    } catch (err: any) {
      error.value = err.message || 'Error al procesar el pedido';
      toastStore.error('Error al generar pedido', error.value || 'Intenta nuevamente');
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
      toastStore.success(
        'Factura SIAT Emitida',
        `Factura N° ${invoice.numeroFactura} registrada con CUF oficial del SIN`
      );
      return invoice;
    } catch (err: any) {
      error.value = err.message || 'Error al emitir factura SIAT';
      toastStore.error('Error de Facturación SIAT', error.value || 'Verifica datos fiscales');
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function simulatePaymentSuccess(
    orderId: string,
    metodoPago: string = 'QR_SIMPLE',
    referencia?: string
  ) {
    loading.value = true;
    try {
      const defaultRef =
        metodoPago === 'TIGO_MONEY'
          ? `TM-BO-${Date.now().toString().slice(-6)}`
          : metodoPago === 'TARJETA'
          ? `ENLACE-VISA-${Date.now().toString().slice(-6)}`
          : `BCB-QR-${Date.now().toString().slice(-6)}`;

      await api.post('/pagos/confirmar', {
        pedidoId: orderId,
        metodoPago,
        numeroTransaccion: referencia || defaultRef,
      });

      await checkOrderStatus(orderId);
      toastStore.success(
        '¡Abono Confirmado!',
        'El pedido ingresa a preparación y horneada artesanal'
      );
    } catch (err: any) {
      console.error('Error al simular pago:', err);
      toastStore.error('Error al confirmar pago', err.message || 'No se pudo registrar');
    } finally {
      loading.value = false;
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
