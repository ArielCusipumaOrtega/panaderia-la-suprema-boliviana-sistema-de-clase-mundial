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

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor de Solicitud: Inyecta Bearer token JWT si existe en localStorage
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token_suprema_bo');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Respuesta: Desempaqueta `data` y maneja errores legibles
axiosInstance.interceptors.response.use(
  (response) => {
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
        : data?.mensaje || 'Ocurrió un error en la solicitud.';

      if (status === 401 && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token_suprema_bo');
        localStorage.removeItem('user_suprema_bo');
      }

      return Promise.reject(new Error(mensaje));
    }
    return Promise.reject(
      new Error('No se pudo establecer conexión con el servidor de la panadería.')
    );
  }
);

export const api = {
  get: async <T = any>(url: string, config?: any): Promise<T> => {
    return (await axiosInstance.get(url, config)) as unknown as T;
  },
  post: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return (await axiosInstance.post(url, data, config)) as unknown as T;
  },
  patch: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
    return (await axiosInstance.patch(url, data, config)) as unknown as T;
  },
  delete: async <T = any>(url: string, config?: any): Promise<T> => {
    return (await axiosInstance.delete(url, config)) as unknown as T;
  },
};

export default api;
