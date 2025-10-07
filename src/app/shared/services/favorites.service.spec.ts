import { firstValueFrom } from 'rxjs';
import { skip } from 'rxjs/operators';

import { Producto } from '../models/producto.model';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let mockProduct: Producto;

  beforeEach(() => {
    localStorage.clear();
    service = new FavoritesService('browser' as any);

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
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should invoke loadFavorites when running in browser', () => {
    const loadSpy = jest.spyOn(FavoritesService.prototype as any, 'loadFavorites');

    const newService = new FavoritesService('browser' as any);

    expect(newService).toBeTruthy();
    expect(loadSpy).toHaveBeenCalledTimes(1);

    loadSpy.mockRestore();
  });

  it('should skip loadFavorites when not running in browser', () => {
    const loadSpy = jest.spyOn(FavoritesService.prototype as any, 'loadFavorites');

    const serverService = new FavoritesService('server' as any);

    expect(serverService).toBeTruthy();
    expect(loadSpy).not.toHaveBeenCalled();

    loadSpy.mockRestore();
  });

  describe('getFavorites', () => {
    it('should return observable of favorites set', async () => {
      const favorites = await firstValueFrom(service.getFavorites());

      expect(favorites).toBeInstanceOf(Set);
      expect(favorites.size).toBe(0);
    });

    it('should emit updates when favorites change', async () => {
      const nextFavoritesPromise = firstValueFrom(service.getFavorites().pipe(skip(1)));

      service.toggleFavorite(mockProduct);

      const favorites = await nextFavoritesPromise;
      expect(favorites.has(mockProduct.productoId!)).toBe(true);
    });
  });

  describe('toggleFavorite', () => {
    it('should add product to favorites when not favorite', async () => {
      const result = service.toggleFavorite(mockProduct);

      expect(result).toBeTruthy();

      const favorites = await firstValueFrom(service.getFavorites());
      expect(favorites.has(mockProduct.productoId!)).toBeTruthy();
    });

    it('should remove product from favorites when already favorite', async () => {
      // Primero agregar
      service.toggleFavorite(mockProduct);

      // Luego remover
      const result = service.toggleFavorite(mockProduct);

      expect(result).toBeFalsy();

      const favorites = await firstValueFrom(service.getFavorites());
      expect(favorites.has(mockProduct.productoId!)).toBeFalsy();
    });

    it('should return false when product has no productoId', () => {
      const invalidProduct = { ...mockProduct, productoId: undefined };
      const result = service.toggleFavorite(invalidProduct);

      expect(result).toBeFalsy();
    });
  });

  describe('localStorage integration', () => {
    it('should save favorites to localStorage', async () => {
      service.toggleFavorite(mockProduct);

      const saved = localStorage.getItem('restaurant_favorites');
      expect(saved).toBeTruthy();

      const favorites = JSON.parse(saved!);
      expect(favorites).toContain(1);

      const favoritesSet = await firstValueFrom(service.getFavorites());
      expect(favoritesSet.has(mockProduct.productoId!)).toBe(true);
    });

    it('should load favorites from localStorage on initialization', async () => {
      localStorage.clear();
      localStorage.setItem('restaurant_favorites', JSON.stringify([1, 2]));

      // Crear una nueva instancia del servicio para que cargue desde localStorage
      const newService = new FavoritesService(service['platformId']);

      const favorites = await firstValueFrom(newService.getFavorites());
      expect(favorites.has(1)).toBeTruthy();
      expect(favorites.has(2)).toBeTruthy();
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

    it('should handle invalid localStorage data gracefully', async () => {
      localStorage.setItem('restaurant_favorites', 'invalid json');

      // Suprimir console.warn
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Crear una nueva instancia que intente cargar el JSON inválido
      const newService = new FavoritesService(service['platformId']);

      const favorites = await firstValueFrom(newService.getFavorites());
      expect(favorites.size).toBe(0);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'No se pudo cargar los favoritos:',
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });

    it('should filter non-number values when loading from localStorage', async () => {
      localStorage.setItem('restaurant_favorites', JSON.stringify([1, 'invalid', 2, null, 3]));

      const newService = new FavoritesService(service['platformId']);

      const favorites = await firstValueFrom(newService.getFavorites());
      expect(favorites.size).toBe(3);
      expect(favorites.has(1)).toBeTruthy();
      expect(favorites.has(2)).toBeTruthy();
      expect(favorites.has(3)).toBeTruthy();
    });

    it('should keep favorites empty when nothing stored', async () => {
      localStorage.clear();

      const newService = new FavoritesService(service['platformId']);

      const favorites = await firstValueFrom(newService.getFavorites());
      expect(favorites.size).toBe(0);
    });

    it('should avoid persisting favorites when not running in browser', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      const serverService = new FavoritesService('server' as any);

      serverService.addFavorite(99);

      const favorites = await firstValueFrom(serverService.getFavorites());
      expect(favorites.has(99)).toBe(true);
      expect(setItemSpy).not.toHaveBeenCalled();
    });
  });
});
