import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import type { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token_suprema_bo'));
  const user = ref<User | null>(
    localStorage.getItem('user_suprema_bo')
      ? JSON.parse(localStorage.getItem('user_suprema_bo')!)
      : null
  );
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const isPanadero = computed(() => user.value?.role === 'MAESTRO_PANADERO');
  const isCajero = computed(() => user.value?.role === 'CAJERO');

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
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
    } catch (err: any) {
      error.value = err.message || 'Error al iniciar sesión';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(data: {
    email: string;
    password: string;
    nombreCompleto: string;
    telefono: string;
    ciNit: string;
    departamento: string;
    ciudad: string;
    direccion: string;
  }) {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.post<{ token: string; usuario: User }>('/auth/register', data);
      token.value = response.token;
      user.value = response.usuario;
      localStorage.setItem('token_suprema_bo', response.token);
      localStorage.setItem('user_suprema_bo', JSON.stringify(response.usuario));
      return response.usuario;
    } catch (err: any) {
      error.value = err.message || 'Error al registrar usuario';
      throw err;
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
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isPanadero,
    isCajero,
    login,
    register,
    fetchProfile,
    logout,
  };
});
