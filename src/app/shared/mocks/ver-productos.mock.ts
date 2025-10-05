import { Producto } from '../models/producto.model';
import { SearchFilters, SearchSuggestion } from '../services/smart-search.service';

export const mockProductosVerProductos: Producto[] = [
  {
    productoId: 1,
    nombre: 'Café',
    precio: 10,
    cantidad: 1,
    categoria: 'Bebidas',
    subcategoria: 'Calientes',
    calorias: 20,
    descripcion: 'Tostado',
  },
  {
    productoId: 2,
    nombre: 'Jugo',
    precio: 12,
    cantidad: 1,
    categoria: 'Bebidas',
    subcategoria: 'Frescos',
    calorias: 80,
    descripcion: 'Natural',
  },
  {
    productoId: 3,
    nombre: 'Ensalada',
    precio: 20,
    cantidad: 1,
    categoria: 'Platos Principales',
    subcategoria: 'Saludable',
    calorias: 200,
    descripcion: 'Verde',
  },
];

export const mockCategoriasVerProductos = [
  { categoriaId: 10, nombre: 'Bebidas' },
  { categoriaId: 20, nombre: 'Platos Principales' },
];

export const mockSubcategoriasVerProductos = [
  { subcategoriaId: 100, categoriaId: 10, nombre: 'Calientes' },
  { subcategoriaId: 200, categoriaId: 10, nombre: 'Frescos' },
  { subcategoriaId: 300, categoriaId: 20, nombre: 'Saludable' },
];

export const mockDefaultSearchFilters: SearchFilters = {
  query: '',
  category: '',
  subcategory: '',
  priceRange: { min: 0, max: 100 },
  caloriesRange: { min: 0, max: 1000 },
  prepTimeRange: { min: 0, max: 60 },
  allergens: [],
  dietary: [],
  sortBy: 'name',
  sortOrder: 'asc',
};

export const mockSearchSuggestions: SearchSuggestion[] = [
  { text: 'Café', type: 'product', count: 1 },
  { text: 'Jugo', type: 'product', count: 1 },
];
