import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import type { Product, Branch, DepartamentoBolivia } from '@/types';

export const useCatalogStore = defineStore('catalog', () => {
  const products = ref<Product[]>([]);
  const branches = ref<Branch[]>([]);
  const selectedCategory = ref<string>('TODOS');
  const searchQuery = ref<string>('');
  const onlyNationalShipping = ref<boolean>(false);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const categories = [
    { id: 'TODOS', label: 'Todos los Productos', icon: 'Sparkles' },
    { id: 'PANES_TRADICIONALES', label: 'Panes Tradicionales', icon: 'Wheat' },
    { id: 'MASA_MADRE_ARTESANAL', label: 'Masa Madre & Rústicos', icon: 'Layers' },
    { id: 'EMPANADAS_MASAS_CALIENTES', label: 'Cuñapés & Masas', icon: 'Flame' },
    { id: 'PASTELERIA_REPOSTERIA', label: 'Pastelería con Singani', icon: 'Cake' },
    { id: 'LINEA_SALUDABLE_ANDINA', label: 'Quinua & Chía Andina', icon: 'Heart' },
    { id: 'COMBOS_CANASTAS', label: 'Canastas Bolivianas', icon: 'Package' },
  ];

  const filteredProducts = computed(() => {
    return products.value.filter((p) => {
      const matchCategory =
        selectedCategory.value === 'TODOS' || p.categoria === selectedCategory.value;
      const matchSearch =
        !searchQuery.value ||
        p.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchQuery.value.toLowerCase());
      const matchShipping = !onlyNationalShipping.value || p.aptoEnvioNacional;
      return matchCategory && matchSearch && matchShipping && p.activo;
    });
  });

  const featuredProducts = computed(() => {
    return products.value.filter((p) => p.destacado && p.activo);
  });

  async function fetchProducts() {
    loading.value = true;
    error.value = null;
    try {
      const data = await api.get<Product[]>('/productos');
      products.value = data;
    } catch (err: any) {
      error.value = err.message || 'Error al cargar productos';
    } finally {
      loading.value = false;
    }
  }

  async function fetchBranches(departamento?: DepartamentoBolivia) {
    try {
      const data = await api.get<Branch[]>('/sucursales', {
        params: departamento ? { departamento } : {},
      });
      branches.value = data;
    } catch (err: any) {
      console.error('Error al cargar sucursales:', err);
    }
  }

  return {
    products,
    branches,
    categories,
    selectedCategory,
    searchQuery,
    onlyNationalShipping,
    loading,
    error,
    filteredProducts,
    featuredProducts,
    fetchProducts,
    fetchBranches,
  };
});
