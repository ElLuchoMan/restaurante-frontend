import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Producto } from '../models/producto.model';

export interface SearchFilters {
  query: string;
  category: string;
  subcategory: string;
  priceRange: { min: number; max: number };
  caloriesRange: { min: number; max: number };
  prepTimeRange: { min: number; max: number };
  allergens: string[];
  dietary: string[];
  sortBy: 'name' | 'price' | 'calories' | 'popularity' | 'rating';
  sortOrder: 'asc' | 'desc';
}

export interface SearchSuggestion {
  text: string;
  type: 'category' | 'product' | 'ingredient' | 'dietary';
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class SmartSearchService {
  private searchHistory$ = new BehaviorSubject<string[]>([]);
  private currentFilters$ = new BehaviorSubject<SearchFilters>(this.getDefaultFilters());

  // Diccionario de búsquedas semánticas
  private semanticMap = new Map<string, string[]>([
    ['picante', ['ají', 'chile', 'pimiento', 'especias', 'condimentos']],
    ['sin gluten', ['gluten free', 'celiaco', 'sin trigo']],
    ['vegetariano', ['vegetal', 'vegano', 'sin carne', 'plantas']],
    ['proteína', ['carne', 'pollo', 'pescado', 'huevo', 'queso']],
    ['dulce', ['postre', 'azúcar', 'miel', 'caramelo', 'chocolate']],
    ['saludable', ['bajo calorías', 'light', 'orgánico', 'natural']],
    ['rápido', ['express', 'rápido', 'menos de 15 min']],
    ['tradicional', ['colombiano', 'típico', 'clásico', 'auténtico']],
  ]);

  getDefaultFilters(): SearchFilters {
    return {
      query: '',
      category: '',
      subcategory: '',
      priceRange: { min: 0, max: 100000 },
      caloriesRange: { min: 0, max: 2000 },
      prepTimeRange: { min: 0, max: 120 },
      allergens: [],
      dietary: [],
      sortBy: 'popularity',
      sortOrder: 'desc',
    };
  }

  getSearchHistory(): Observable<string[]> {
    return this.searchHistory$.asObservable();
  }

  getCurrentFilters(): Observable<SearchFilters> {
    return this.currentFilters$.asObservable();
  }

  updateFilters(filters: Partial<SearchFilters>): void {
    const current = this.currentFilters$.value;
    const updated = { ...current, ...filters };
    this.currentFilters$.next(updated);
  }

  addToSearchHistory(query: string): void {
    if (!query.trim()) return;

    const history = this.searchHistory$.value;
    const filtered = history.filter((item) => item.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, 10); // Mantener solo 10 elementos
    this.searchHistory$.next(updated);
    this.saveSearchHistory(updated);
  }

  getSuggestions(query: string, products: Producto[]): SearchSuggestion[] {
    if (!query.trim()) return [];

    const suggestions: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();

    // Sugerencias de categorías
    const categories = [...new Set(products.map((p) => p.categoria).filter(Boolean))];
    categories.forEach((cat) => {
      if (cat && cat.toLowerCase().includes(queryLower)) {
        const count = products.filter((p) => p.categoria === cat).length;
        suggestions.push({ text: cat!, type: 'category', count });
      }
    });

    // Sugerencias de productos
    products.forEach((product) => {
      if (product.nombre.toLowerCase().includes(queryLower)) {
        suggestions.push({ text: product.nombre, type: 'product', count: 1 });
      }
    });

    // Sugerencias semánticas
    this.semanticMap.forEach((keywords, semantic) => {
      if (
        semantic.toLowerCase().includes(queryLower) ||
        keywords.some((keyword) => keyword.toLowerCase().includes(queryLower))
      ) {
        const count = this.countSemanticMatches(products, keywords);
        if (count > 0) {
          suggestions.push({ text: semantic, type: 'dietary', count });
        }
      }
    });

    return suggestions.slice(0, 8); // Limitar a 8 sugerencias
  }

  searchProducts(products: Producto[], filters: SearchFilters): Producto[] {
    let results = [...products];

    // Filtro por query (búsqueda semántica)
    if (filters.query.trim()) {
      results = this.applySemanticSearch(results, filters.query);
    }

    // Filtro por categoría
    if (filters.category) {
      results = results.filter((p) => p.categoria === filters.category);
    }

    // Filtro por subcategoría
    if (filters.subcategory) {
      results = results.filter((p) => p.subcategoria === filters.subcategory);
    }

    // Filtro por precio
    results = results.filter(
      (p) => p.precio >= filters.priceRange.min && p.precio <= filters.priceRange.max,
    );

    // Filtro por calorías
    results = results.filter(
      (p) =>
        p.calorias &&
        p.calorias >= filters.caloriesRange.min &&
        p.calorias <= filters.caloriesRange.max,
    );

    // Filtro por alérgenos (asumiendo que los productos tienen un campo allergens)
    if (filters.allergens.length > 0) {
      results = results.filter(
        (p) =>
          !filters.allergens.some((allergen) =>
            p.descripcion?.toLowerCase().includes(allergen.toLowerCase()),
          ),
      );
    }

    // Ordenamiento
    results = this.sortProducts(results, filters.sortBy, filters.sortOrder);

    return results;
  }

  private applySemanticSearch(products: Producto[], query: string): Producto[] {
    const queryLower = query.toLowerCase();

    return products.filter((product) => {
      // Búsqueda directa en nombre y descripción
      const directMatch =
        product.nombre.toLowerCase().includes(queryLower) ||
        product.descripcion?.toLowerCase().includes(queryLower) ||
        product.categoria?.toLowerCase().includes(queryLower) ||
        product.subcategoria?.toLowerCase().includes(queryLower);

      // Búsqueda semántica
      const semanticMatch = Array.from(this.semanticMap.entries()).some(([semantic, keywords]) => {
        if (queryLower.includes(semantic.toLowerCase())) {
          return keywords.some(
            (keyword) =>
              product.nombre.toLowerCase().includes(keyword) ||
              product.descripcion?.toLowerCase().includes(keyword),
          );
        }
        return false;
      });

      return directMatch || semanticMatch;
    });
  }

  private countSemanticMatches(products: Producto[], keywords: string[]): number {
    return products.filter((product) =>
      keywords.some(
        (keyword) =>
          product.nombre.toLowerCase().includes(keyword) ||
          product.descripcion?.toLowerCase().includes(keyword),
      ),
    ).length;
  }

  private sortProducts(products: Producto[], sortBy: string, order: 'asc' | 'desc'): Producto[] {
    return products.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.nombre.localeCompare(b.nombre);
          break;
        case 'price':
          comparison = a.precio - b.precio;
          break;
        case 'calories':
          comparison = (a.calorias || 0) - (b.calorias || 0);
          break;
        case 'popularity':
          // Simular popularidad basada en ID (en producción sería un campo real)
          comparison = (a.productoId || 0) - (b.productoId || 0);
          break;
        case 'rating':
          // Simular rating (en producción sería un campo real)
          comparison = Math.random() - 0.5;
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }

  private saveSearchHistory(history: string[]): void {
    try {
      localStorage.setItem('restaurant_search_history', JSON.stringify(history));
    } catch (error) {
      console.warn('No se pudo guardar el historial de búsqueda:', error);
    }
  }

  loadSearchHistory(): void {
    try {
      const saved = localStorage.getItem('restaurant_search_history');
      if (saved) {
        const history = JSON.parse(saved);
        this.searchHistory$.next(history);
      }
    } catch (error) {
      console.warn('No se pudo cargar el historial de búsqueda:', error);
    }
  }

  clearSearchHistory(): void {
    this.searchHistory$.next([]);
    localStorage.removeItem('restaurant_search_history');
  }
}
