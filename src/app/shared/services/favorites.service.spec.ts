import { TestBed } from '@angular/core/testing';
import { Producto } from '../models/producto.model';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let mockProduct: Producto;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoritesService);

    mockProduct = {
      productoId: 1,
      nombre: 'Hamburguesa Clásica',
      descripcion: 'Deliciosa hamburguesa con carne de res',
      precio: 25000,
      categoria: 'Platos Principales',
      subcategoria: 'Hamburguesas',
      calorias: 650,
      imagen: 'hamburguesa.jpg',
      cantidad: 1,
    };
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isFavorite', () => {
    it('should return false for non-favorite product', () => {
      expect(service.isFavorite(1)).toBeFalsy();
    });

    it('should return true for favorite product', () => {
      service.addFavorite(1);
      expect(service.isFavorite(1)).toBeTruthy();
    });
  });

  describe('toggleFavorite', () => {
    it('should add product to favorites when not favorite', () => {
      const result = service.toggleFavorite(mockProduct);

      expect(result).toBeTruthy();
      expect(service.isFavorite(mockProduct.productoId!)).toBeTruthy();
    });

    it('should remove product from favorites when already favorite', () => {
      service.addFavorite(mockProduct.productoId!);

      const result = service.toggleFavorite(mockProduct);

      expect(result).toBeFalsy();
      expect(service.isFavorite(mockProduct.productoId!)).toBeFalsy();
    });
  });

  describe('addFavorite', () => {
    it('should add product to favorites', () => {
      service.addFavorite(1);

      expect(service.isFavorite(1)).toBeTruthy();
    });

    it('should emit updated favorites', (done) => {
      service.getFavorites().subscribe((favorites) => {
        if (favorites.has(1)) {
          expect(favorites.has(1)).toBeTruthy();
          done();
        }
      });

      service.addFavorite(1);
    });
  });

  describe('removeFavorite', () => {
    it('should remove product from favorites', () => {
      service.addFavorite(1);
      service.removeFavorite(1);

      expect(service.isFavorite(1)).toBeFalsy();
    });

    it('should emit updated favorites', (done) => {
      service.addFavorite(1);

      service.getFavorites().subscribe((favorites) => {
        if (!favorites.has(1)) {
          expect(favorites.has(1)).toBeFalsy();
          done();
        }
      });

      service.removeFavorite(1);
    });
  });

  describe('getFavoriteProducts', () => {
    it('should return empty array when no favorites', () => {
      const allProducts = [mockProduct];
      const favorites = service.getFavoriteProducts(allProducts);

      expect(favorites).toEqual([]);
    });

    it('should return favorite products', () => {
      const allProducts = [mockProduct];
      service.addFavorite(mockProduct.productoId!);

      const favorites = service.getFavoriteProducts(allProducts);

      expect(favorites).toEqual([mockProduct]);
    });

    it('should return multiple favorite products', () => {
      const product2 = { ...mockProduct, productoId: 2, nombre: 'Ensalada' };
      const allProducts = [mockProduct, product2];

      service.addFavorite(1);
      service.addFavorite(2);

      const favorites = service.getFavoriteProducts(allProducts);

      expect(favorites.length).toBe(2);
      expect(favorites).toContain(mockProduct);
      expect(favorites).toContain(product2);
    });
  });

  describe('clearFavorites', () => {
    it('should clear all favorites', () => {
      service.addFavorite(1);
      service.addFavorite(2);
      service.clearFavorites();

      expect(service.isFavorite(1)).toBeFalsy();
      expect(service.isFavorite(2)).toBeFalsy();
    });

    it('should emit empty favorites set', (done) => {
      service.addFavorite(1);

      service.getFavorites().subscribe((favorites) => {
        if (favorites.size === 0) {
          expect(favorites.size).toBe(0);
          done();
        }
      });

      service.clearFavorites();
    });
  });

  describe('localStorage integration', () => {
    it('should save favorites to localStorage', () => {
      service.addFavorite(1);

      const saved = localStorage.getItem('restaurant_favorites');
      expect(saved).toBeTruthy();

      const favorites = JSON.parse(saved!);
      expect(favorites).toContain(1);
    });

    it('should load favorites from localStorage', () => {
      localStorage.clear();
      localStorage.setItem('restaurant_favorites', JSON.stringify([1, 2]));

      // Reiniciar el service manualmente
      service['loadFavorites']();

      // Los favoritos deberían haberse cargado
      expect(service.isFavorite(1)).toBeTruthy();
      expect(service.isFavorite(2)).toBeTruthy();
    });

    it('should handle localStorage errors gracefully', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Suprimir console.warn para este test
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      expect(() => {
        service.addFavorite(1);
      }).not.toThrow();

      setItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('restaurant_favorites', 'invalid json');

      // Intentar cargar los favoritos con JSON inválido
      service['loadFavorites']();

      // No debería lanzar error y no debería tener favoritos
      expect(service.isFavorite(1)).toBeFalsy();
    });
  });

  describe('observable behavior', () => {
    it('should emit initial empty set', (done) => {
      service.getFavorites().subscribe((favorites) => {
        expect(favorites.size).toBe(0);
        done();
      });
    });

    it('should emit updates when favorites change', (done) => {
      let callCount = 0;

      service.getFavorites().subscribe((favorites) => {
        callCount++;

        if (callCount === 1) {
          expect(favorites.size).toBe(0);
        } else if (callCount === 2) {
          expect(favorites.has(1)).toBeTruthy();
          done();
        }
      });

      service.addFavorite(1);
    });
  });
});
