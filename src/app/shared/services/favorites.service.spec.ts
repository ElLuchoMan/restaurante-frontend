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

  describe('getFavorites', () => {
    it('should return observable of favorites set', (done) => {
      service.getFavorites().subscribe((favorites) => {
        expect(favorites).toBeInstanceOf(Set);
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

      service.toggleFavorite(mockProduct);
    });
  });

  describe('toggleFavorite', () => {
    it('should add product to favorites when not favorite', (done) => {
      const result = service.toggleFavorite(mockProduct);

      expect(result).toBeTruthy();

      service.getFavorites().subscribe((favorites) => {
        expect(favorites.has(mockProduct.productoId!)).toBeTruthy();
        done();
      });
    });

    it('should remove product from favorites when already favorite', (done) => {
      // Primero agregar
      service.toggleFavorite(mockProduct);

      // Luego remover
      const result = service.toggleFavorite(mockProduct);

      expect(result).toBeFalsy();

      service.getFavorites().subscribe((favorites) => {
        expect(favorites.has(mockProduct.productoId!)).toBeFalsy();
        done();
      });
    });

    it('should return false when product has no productoId', () => {
      const invalidProduct = { ...mockProduct, productoId: undefined };
      const result = service.toggleFavorite(invalidProduct);

      expect(result).toBeFalsy();
    });
  });

  describe('localStorage integration', () => {
    it('should save favorites to localStorage', (done) => {
      service.toggleFavorite(mockProduct);

      // Esperar a que se guarde
      setTimeout(() => {
        const saved = localStorage.getItem('restaurant_favorites');
        expect(saved).toBeTruthy();

        const favorites = JSON.parse(saved!);
        expect(favorites).toContain(1);
        done();
      }, 10);
    });

    it('should load favorites from localStorage on initialization', (done) => {
      localStorage.clear();
      localStorage.setItem('restaurant_favorites', JSON.stringify([1, 2]));

      // Crear una nueva instancia del servicio para que cargue desde localStorage
      const newService = new FavoritesService(service['platformId']);

      newService.getFavorites().subscribe((favorites) => {
        expect(favorites.has(1)).toBeTruthy();
        expect(favorites.has(2)).toBeTruthy();
        done();
      });
    });

    it('should handle localStorage save errors gracefully', () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Suprimir console.warn para este test
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      expect(() => {
        service.toggleFavorite(mockProduct);
      }).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'No se pudo guardar los favoritos:',
        expect.any(Error),
      );

      setItemSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it('should handle invalid localStorage data gracefully', (done) => {
      localStorage.setItem('restaurant_favorites', 'invalid json');

      // Suprimir console.warn
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Crear una nueva instancia que intente cargar el JSON inválido
      const newService = new FavoritesService(service['platformId']);

      newService.getFavorites().subscribe((favorites) => {
        expect(favorites.size).toBe(0);
        done();
      });

      consoleWarnSpy.mockRestore();
    });

    it('should filter non-number values when loading from localStorage', (done) => {
      localStorage.setItem('restaurant_favorites', JSON.stringify([1, 'invalid', 2, null, 3]));

      const newService = new FavoritesService(service['platformId']);

      newService.getFavorites().subscribe((favorites) => {
        expect(favorites.size).toBe(3);
        expect(favorites.has(1)).toBeTruthy();
        expect(favorites.has(2)).toBeTruthy();
        expect(favorites.has(3)).toBeTruthy();
        done();
      });
    });
  });
});
