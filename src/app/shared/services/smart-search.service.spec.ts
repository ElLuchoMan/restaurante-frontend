import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { Producto } from '../models/producto.model';
import { SearchFilters, SmartSearchService } from './smart-search.service';

describe('SmartSearchService', () => {
  let service: SmartSearchService;
  let mockProducts: Producto[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmartSearchService);

    mockProducts = [
      {
        productoId: 1,
        nombre: 'Hamburguesa Clásica',
        descripcion: 'Deliciosa hamburguesa con carne de res, lechuga, tomate y queso',
        precio: 25000,
        categoria: 'Platos Principales',
        subcategoria: 'Hamburguesas',
        calorias: 650,
        imagen: 'hamburguesa.jpg',
        cantidad: 1,
      },
      {
        productoId: 2,
        nombre: 'Ensalada César',
        descripcion: 'Ensalada fresca con lechuga, pollo, queso parmesano y aderezo césar',
        precio: 18000,
        categoria: 'Ensaladas',
        subcategoria: 'Ensaladas Verdes',
        calorias: 320,
        imagen: 'ensalada.jpg',
        cantidad: 1,
      },
      {
        productoId: 3,
        nombre: 'Café Colombiano',
        descripcion: 'Café 100% colombiano, tostado artesanalmente',
        precio: 5000,
        categoria: 'Bebidas',
        subcategoria: 'Café',
        calorias: 5,
        imagen: 'cafe.jpg',
        cantidad: 1,
      },
      {
        productoId: 4,
        nombre: 'Tacos Picantes',
        descripcion: 'Tortillas con pollo y salsa de ají muy picante',
        precio: 22000,
        categoria: 'Platos Principales',
        subcategoria: 'Tacos',
        calorias: 550,
        imagen: 'tacos.jpg',
        cantidad: 1,
      },
    ];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDefaultFilters', () => {
    it('should return default search filters', () => {
      const filters = service.getDefaultFilters();

      expect(filters.query).toBe('');
      expect(filters.category).toBe('');
      expect(filters.subcategory).toBe('');
      expect(filters.priceRange.min).toBe(0);
      expect(filters.priceRange.max).toBe(100000);
      expect(filters.caloriesRange.min).toBe(0);
      expect(filters.caloriesRange.max).toBe(2000);
      expect(filters.allergens).toEqual([]);
      expect(filters.dietary).toEqual([]);
      expect(filters.sortBy).toBe('popularity');
      expect(filters.sortOrder).toBe('desc');
    });
  });

  describe('updateFilters', () => {
    it('should update filters correctly', async () => {
      const newFilters: Partial<SearchFilters> = {
        query: 'hamburguesa',
        category: 'Platos Principales',
        priceRange: { min: 20000, max: 30000 },
      };

      service.updateFilters(newFilters);

      const filters = await firstValueFrom(service.getCurrentFilters());
      expect(filters.query).toBe('hamburguesa');
      expect(filters.category).toBe('Platos Principales');
      expect(filters.priceRange.min).toBe(20000);
      expect(filters.priceRange.max).toBe(30000);
    });
  });

  describe('addToSearchHistory', () => {
    it('should add query to search history', async () => {
      service.addToSearchHistory('hamburguesa');

      const history = await firstValueFrom(service.getSearchHistory());
      expect(history).toContain('hamburguesa');
      expect(history[0]).toBe('hamburguesa');
    });

    it('should not add empty queries', async () => {
      service.addToSearchHistory('');
      service.addToSearchHistory('   ');

      const history = await firstValueFrom(service.getSearchHistory());
      expect(history).not.toContain('');
      expect(history).not.toContain('   ');
    });

    it('should limit history to 10 items', async () => {
      for (let i = 0; i < 15; i++) {
        service.addToSearchHistory(`query${i}`);
      }

      const history = await firstValueFrom(service.getSearchHistory());
      expect(history.length).toBe(10);
      expect(history[0]).toBe('query14');
      expect(history[9]).toBe('query5');
    });

    it('should not add duplicate queries', async () => {
      service.addToSearchHistory('hamburguesa');
      service.addToSearchHistory('ensalada');
      service.addToSearchHistory('hamburguesa');

      const history = await firstValueFrom(service.getSearchHistory());
      expect(history).toEqual(['hamburguesa', 'ensalada']);
    });
  });

  describe('getSuggestions', () => {
    it('should return empty array for empty query', () => {
      const suggestions = service.getSuggestions('', mockProducts);
      expect(suggestions).toEqual([]);
    });

    it('should return category suggestions', () => {
      const suggestions = service.getSuggestions('platos', mockProducts);

      expect(suggestions.length).toBeGreaterThan(0);
      const categorySuggestion = suggestions.find((s) => s.type === 'category');
      expect(categorySuggestion).toBeTruthy();
      expect(categorySuggestion?.text).toContain('Platos');
    });

    it('should return product suggestions', () => {
      const suggestions = service.getSuggestions('hamburguesa', mockProducts);

      expect(suggestions.length).toBeGreaterThan(0);
      const productSuggestion = suggestions.find((s) => s.type === 'product');
      expect(productSuggestion).toBeTruthy();
      expect(productSuggestion?.text).toContain('Hamburguesa');
    });

    it('should return semantic suggestions when matching keywords', () => {
      const suggestions = service.getSuggestions('picante', mockProducts);

      const dietarySuggestion = suggestions.find((s) => s.type === 'dietary');
      expect(dietarySuggestion).toBeTruthy();
      expect(dietarySuggestion?.count).toBeGreaterThan(0);
    });

    it('should not add semantic suggestions when no product matches keywords', () => {
      const suggestions = service.getSuggestions('rápido', mockProducts);

      expect(suggestions.some((s) => s.type === 'dietary')).toBe(false);
    });

    it('should limit suggestions to 8 items', () => {
      const suggestions = service.getSuggestions('a', mockProducts);
      expect(suggestions.length).toBeLessThanOrEqual(8);
    });
  });

  describe('searchProducts', () => {
    it('should return all products with empty filters', () => {
      const filters = service.getDefaultFilters();
      const results = service.searchProducts(mockProducts, filters);

      expect(results.length).toBe(mockProducts.length);
    });

    it('should filter by query', () => {
      const filters = service.getDefaultFilters();
      filters.query = 'hamburguesa';

      const results = service.searchProducts(mockProducts, filters);

      expect(results.length).toBe(1);
      expect(results[0].nombre).toContain('Hamburguesa');
    });

    it('should filter by category', () => {
      const filters = service.getDefaultFilters();
      filters.category = 'Bebidas';

      const results = service.searchProducts(mockProducts, filters);

      expect(results.length).toBe(1);
      expect(results[0].categoria).toBe('Bebidas');
    });

    it('should filter by subcategory', () => {
      const filters = service.getDefaultFilters();
      filters.subcategory = 'Hamburguesas';

      const results = service.searchProducts(mockProducts, filters);

      expect(results.length).toBe(1);
      expect(results[0].subcategoria).toBe('Hamburguesas');
    });

    it('should filter by price range', () => {
      const filters = service.getDefaultFilters();
      filters.priceRange = { min: 10000, max: 20000 };

      const results = service.searchProducts(mockProducts, filters);

      expect(results.length).toBe(1);
      expect(results[0].precio).toBe(18000);
    });

    it('should filter by calories range', () => {
      const filters = service.getDefaultFilters();
      filters.caloriesRange = { min: 300, max: 700 };

      const results = service.searchProducts(mockProducts, filters);

      // Hamburguesa (650), Ensalada (320) y Tacos (550) están en el rango
      expect(results.length).toBe(3);
      expect(results.some((p) => p.calorias === 650)).toBeTruthy();
      expect(results.some((p) => p.calorias === 320)).toBeTruthy();
      expect(results.some((p) => p.calorias === 550)).toBeTruthy();
    });

    it('should filter by allergens', () => {
      const filters = service.getDefaultFilters();
      filters.allergens = ['queso']; // 'queso' aparece en Hamburguesa y Ensalada

      const results = service.searchProducts(mockProducts, filters);

      // Debe excluir productos con 'queso' en la descripción
      expect(results.length).toBe(2);
      expect(results.map((product) => product.nombre)).toEqual(
        expect.arrayContaining(['Café Colombiano', 'Tacos Picantes']),
      );
    });

    it('should sort by name ascending', () => {
      const filters = service.getDefaultFilters();
      filters.sortBy = 'name';
      filters.sortOrder = 'asc';

      const results = service.searchProducts(mockProducts, filters);

      expect(results.map((product) => product.nombre)).toEqual([
        'Café Colombiano',
        'Ensalada César',
        'Hamburguesa Clásica',
        'Tacos Picantes',
      ]);
    });

    it('should sort by price descending', () => {
      const filters = service.getDefaultFilters();
      filters.sortBy = 'price';
      filters.sortOrder = 'desc';

      const results = service.searchProducts(mockProducts, filters);

      expect(results.map((product) => product.precio)).toEqual([25000, 22000, 18000, 5000]);
    });

    it('should apply semantic search', () => {
      const filters = service.getDefaultFilters();
      filters.query = 'comida picante';

      const results = service.searchProducts(mockProducts, filters);

      expect(results.some((product) => product.nombre === 'Tacos Picantes')).toBe(true);
    });

    it('should sort by calories ascending', () => {
      const filters = service.getDefaultFilters();
      filters.sortBy = 'calories';
      filters.sortOrder = 'asc';

      const results = service.searchProducts(mockProducts, filters);

      expect(results.map((product) => product.calorias)).toEqual([5, 320, 550, 650]);
    });

    it('should sort by popularity descending using productoId', () => {
      const filters = service.getDefaultFilters();
      filters.sortBy = 'popularity';
      filters.sortOrder = 'desc';

      const results = service.searchProducts(mockProducts, filters);

      expect(results.map((product) => product.productoId)).toEqual([4, 3, 2, 1]);
    });

    it('should sort by rating using Math.random value', () => {
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.8);
      const filters = service.getDefaultFilters();
      filters.sortBy = 'rating';
      filters.sortOrder = 'asc';

      const results = service.searchProducts(mockProducts, filters);

      expect(results).toEqual(mockProducts);
      expect(randomSpy).toHaveBeenCalled();
      randomSpy.mockRestore();
    });
  });

  describe('localStorage integration', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should save and load search history', async () => {
      service.addToSearchHistory('test query');

      // Create new service instance to test persistence
      const newService = new SmartSearchService();
      newService.loadSearchHistory();

      const history = await firstValueFrom(newService.getSearchHistory());
      expect(history).toContain('test query');
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Suprimir console.warn para este test
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      expect(() => {
        service.addToSearchHistory('test');
      }).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'No se pudo guardar el historial de búsqueda:',
        expect.any(Error),
      );

      setItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should load history when stored value exists', async () => {
      localStorage.setItem('restaurant_search_history', JSON.stringify(['arepa']));

      const newService = new SmartSearchService();
      newService.loadSearchHistory();

      const history = await firstValueFrom(newService.getSearchHistory());
      expect(history).toEqual(['arepa']);
    });

    it('should handle invalid JSON when loading history', async () => {
      localStorage.setItem('restaurant_search_history', 'invalid json');

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const newService = new SmartSearchService();

      newService.loadSearchHistory();

      const history = await firstValueFrom(newService.getSearchHistory());
      expect(history).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(
        'No se pudo cargar el historial de búsqueda:',
        expect.any(Error),
      );

      warnSpy.mockRestore();
    });

    it('should clear search history and remove data from localStorage', async () => {
      service.addToSearchHistory('picada');
      localStorage.setItem('restaurant_search_history', JSON.stringify(['picada']));
      const removeSpy = jest.spyOn(Storage.prototype, 'removeItem');

      service.clearSearchHistory();

      const history = await firstValueFrom(service.getSearchHistory());
      expect(history).toEqual([]);
      expect(removeSpy).toHaveBeenCalledWith('restaurant_search_history');

      removeSpy.mockRestore();
    });
  });
});
