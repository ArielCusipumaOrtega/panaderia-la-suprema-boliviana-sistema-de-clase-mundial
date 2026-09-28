# Guía Oficial de Integración Frontend (Vue.js 3 + Vite + TypeScript)

> **Panadería La Suprema Boliviana — Backend de Clase Mundial**  
> Backend RESTful empresarial desacoplado con arquitectura limpia, soporte CORS con credenciales, autenticación JWT, pasarela QR Simple interoperable (BCB) y facturación SIAT con CUF.

---

## 1. Conectividad y Endpoints de Desarrollo

| Recurso | URL | Descripción |
| :--- | :--- | :--- |
| **API Base URL** | `http://localhost:3000/api` | Prefijo unificado para todos los servicios REST |
| **Health Check & Uptime** | `http://localhost:3000/api/health` | Verificación de estado, base de datos y departamentos |
| **Swagger UI Interactivo** | `http://localhost:3000/api/docs` | Explorador interactivo con esquemas y prueba de endpoints |
| **Especificación OpenAPI JSON** | `http://localhost:3000/api/docs-json` | Esquema OpenAPI v3 para generación automática de tipos |
| **Overview de la API** | `http://localhost:3000/api` | Metadatos y catálogo de rutas disponibles |

---

## 2. Configuración en tu Repositorio de Vue.js

### 2.1 Variables de Entorno (`.env`)
En la raíz de tu proyecto Vue (Vite), crea o actualiza tu archivo `.env`:

```env
# URL base hacia este backend NestJS
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_DOCS_URL=http://localhost:3000/api/docs
```

### 2.2 Generación de Tipos TypeScript Automáticos
Para sincronizar automáticamente todas las interfaces y DTOs del backend en tu frontend Vue, añade a tu `package.json` de Vue:

```json
{
  "scripts": {
    "api:types": "openapi-typescript http://localhost:3000/api/docs-json -o src/types/api-schema.d.ts"
  },
  "devDependencies": {
    "openapi-typescript": "^7.6.1"
  }
}
```
Ejecuta `npm run api:types` con el backend en ejecución y dispondrás de los tipos exactos en tu frontend sin escribir interfaces a mano.

---

## 3. Cliente HTTP Profesional para Vue 3 (`src/services/api.ts`)

Copia este servicio en tu frontend Vue para gestionar solicitudes, tokens JWT y errores de forma centralizada:

```typescript
import axios, { type AxiosInstance, type AxiosError } from 'axios';

export interface ApiResponse<T = any> {
  exito: boolean;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  exito: false;
  statusCode: number;
  timestamp: string;
  path: string;
  mensaje: string | string[];
}

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  withCredentials: true, // Habilita soporte para cookies y sesiones CORS
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor de Solicitud: Inyecta el token Bearer JWT automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token_suprema_bo');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Respuesta: Desempaqueta `data` y unifica errores
api.interceptors.response.use(
  (response) => {
    // Si la respuesta viene envuelta en { exito: true, data: ... }
    if (response.data && typeof response.data === 'object' && 'exito' in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const { status, data } = error.response;
      const mensaje = Array.isArray(data?.mensaje)
        ? data.mensaje.join(', ')
        : data?.mensaje || 'Error en la operación';

      // Redirección si la sesión expiró
      if (status === 401 && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token_suprema_bo');
        localStorage.removeItem('user_suprema_bo');
        window.location.href = '/login?expired=true';
      }

      return Promise.reject(new Error(mensaje));
    }
    return Promise.reject(new Error('No se pudo conectar con el servidor de la panadería.'));
  }
);

export default api;
```

---

## 4. Tienda de Autenticación con Pinia (`src/stores/auth.ts`)

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';

export interface User {
  id: string;
  email: string;
  nombreCompleto: string;
  role: 'ADMIN' | 'GERENTE_SUCURSAL' | 'MAESTRO_PANADERO' | 'CAJERO' | 'REPARTIDOR' | 'CLIENTE';
  ciNit?: string;
  telefono?: string;
  departamento?: string;
  ciudad?: string;
  sucursalId?: string;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token_suprema_bo'));
  const user = ref<User | null>(
    localStorage.getItem('user_suprema_bo')
      ? JSON.parse(localStorage.getItem('user_suprema_bo')!)
      : null
  );
  const loading = ref(false);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const isPanadero = computed(() => user.value?.role === 'MAESTRO_PANADERO');

  async function login(email: string, password: string) {
    loading.value = true;
    try {
      const response = await api.post<{ token: string; usuario: User }>('/auth/login', {
        email,
        password,
      });
      token.value = response.token;
      user.value = response.usuario;
      localStorage.setItem('token_suprema_bo', response.token);
      localStorage.setItem('user_suprema_bo', JSON.stringify(response.usuario));
      return response.usuario;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProfile() {
    if (!token.value) return null;
    try {
      const profile = await api.get<User>('/auth/perfil');
      user.value = profile;
      localStorage.setItem('user_suprema_bo', JSON.stringify(profile));
      return profile;
    } catch {
      logout();
      return null;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token_suprema_bo');
    localStorage.removeItem('user_suprema_bo');
    window.location.href = '/login';
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isPanadero,
    login,
    fetchProfile,
    logout,
  };
});
```

---

## 5. Módulo de Catálogo & Productos (`src/services/products.service.ts`)

```typescript
import api from '@/services/api';

export interface Product {
  id: string;
  codigoSku: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precioBs: number;
  unidadMedida: string;
  tiempoVidaUtilHoras: number;
  aptoEnvioNacional: boolean;
  horarioRecomendado: 'MADRUGADA' | 'TARDE' | 'NOCTURNO';
  ingredientesPrincipales: string[];
  imagenUrl: string;
  destacado: boolean;
  activo: boolean;
}

export const productsService = {
  // Obtener catálogo con filtros reactivos
  async getProducts(params?: {
    categoria?: string;
    aptoEnvioNacional?: boolean;
    destacado?: boolean;
    busqueda?: string;
  }): Promise<Product[]> {
    return api.get<Product[]>('/productos', { params });
  },

  // Obtener detalle con inventario por sucursal
  async getProductById(id: string, sucursalId?: string): Promise<Product & { inventario: any[] }> {
    return api.get(`/productos/${id}`, { params: { sucursalId } });
  },
};
```

---

## 6. Pasarela de Pagos Bolivia (QR Simple) & Pedidos

El backend genera códigos **QR Simple Interoperables (BCB)** en formato `dataUri` base64 listos para renderizar directamente en una etiqueta `<img :src="..." />`.

### Componente de Pago QR en Vue 3 (`src/components/QrSimplePayment.vue`):

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import api from '@/services/api';

const props = defineProps<{
  pedidoId: string;
  qrSimpleDataUri: string;
  totalBs: number;
  codigoPedido: string;
}>();

const emit = defineEmits<{
  (e: 'pago-confirmado'): void;
}>();

const verificando = ref(false);
const pagado = ref(false);
let intervalId: any = null;

async function verificarEstado() {
  try {
    const pedido = await api.get<any>(`/pedidos/${props.pedidoId}`);
    if (pedido.estadoPago === 'PAGADO') {
      pagado.value = true;
      clearInterval(intervalId);
      emit('pago-confirmado');
    }
  } catch (err) {
    console.error('Error al verificar estado de pago:', err);
  }
}

onMounted(() => {
  // Consultar estado cada 4 segundos
  intervalId = setInterval(verificarEstado, 4000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div class="bg-amber-50 p-6 rounded-2xl border border-amber-200 text-center max-w-sm mx-auto shadow-lg">
    <div class="inline-block bg-white p-3 rounded-xl shadow-inner border border-gray-100 mb-4">
      <img
        :src="props.qrSimpleDataUri"
        alt="QR Simple Interoperable BCB"
        class="w-56 h-56 mx-auto object-contain"
      />
    </div>

    <div class="text-xs uppercase tracking-wider font-semibold text-amber-800 mb-1">
      {{ props.codigoPedido }}
    </div>
    <div class="text-2xl font-black text-amber-950 mb-2">
      Bs. {{ props.totalBs.toFixed(2) }}
    </div>
    
    <p class="text-xs text-gray-600 mb-4">
      Escanea desde cualquier app bancaria de Bolivia (Banco Unión, BCP, BNB, BancoSol, Banco FIE, Tigo Money).
    </p>

    <div v-if="pagado" class="bg-emerald-100 text-emerald-800 text-sm font-bold py-2 px-4 rounded-lg">
      ✓ ¡Pago Recibido Exitosamente!
    </div>
    <div v-else class="flex items-center justify-center gap-2 text-xs text-amber-700 animate-pulse">
      <span>●</span> Esperando confirmación de transferencia...
    </div>
  </div>
</template>
```

---

## 7. Emisión de Factura Computarizada SIAT / SIN Bolivia

Cuando el pedido esté pagado o se solicite la factura:

```typescript
import api from '@/services/api';

export interface FacturaSiat {
  id: string;
  numeroFactura: number;
  cuf: string;
  cufd: string;
  nitEmisor: string;
  razonSocialEmisor: string;
  fechaEmision: string;
  montoTotalBs: number;
  montoSujetoCreditoFiscalBs: number;
  qrSiatDataUri: string;
  leyendaFiscal: string;
}

export async function emitirFactura(pedidoId: string): Promise<FacturaSiat> {
  return api.post<FacturaSiat>('/facturacion/emitir', { pedidoId });
}
```

---

## 8. Cotización de Flete en los 9 Departamentos de Bolivia

```typescript
import api from '@/services/api';

export type DepartamentoBolivia =
  | 'La Paz'
  | 'Santa Cruz'
  | 'Cochabamba'
  | 'Tarija'
  | 'Chuquisaca'
  | 'Oruro'
  | 'Potosí'
  | 'Beni'
  | 'Pando';

export async function cotizarEnvio(data: {
  departamentoDestino: DepartamentoBolivia;
  ciudadDestino: string;
  tipoEntrega: 'EXPRESS_LOCAL' | 'PROGRAMADO' | 'DESPACHO_INTERDEPARTAMENTAL';
}) {
  return api.post('/logistica/cotizar-envio', data);
}
```

---

## 9. Lista Rápida de Rutas del Backend

| Método | Ruta | Uso Frontend | Autenticación |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del backend y base de datos | Público |
| `POST` | `/api/auth/login` | Inicio de sesión (retorna token y datos) | Público |
| `POST` | `/api/auth/register` | Registro de nuevos clientes | Público |
| `GET` | `/api/auth/perfil` | Obtener perfil del usuario actual | Bearer JWT |
| `GET` | `/api/productos` | Catálogo de productos con filtros | Público |
| `GET` | `/api/productos/:id` | Detalle del producto e inventario | Público |
| `GET` | `/api/sucursales` | Sucursales en los 9 departamentos | Público |
| `POST` | `/api/logistica/cotizar-envio` | Cotizador de flete nacional | Público |
| `GET` | `/api/pedidos` | Listar pedidos (filtrable por CI/NIT) | Público |
| `POST` | `/api/pedidos` | Crear pedido y generar QR Simple | Público |
| `GET` | `/api/pedidos/:id` | Consultar estado de pedido y pago | Público |
| `POST` | `/api/facturacion/emitir` | Emitir Factura Electrónica SIAT con CUF | Público |
| `GET` | `/api/analitica/dashboard` | Métricas y gráficos en Bs. | Público |
