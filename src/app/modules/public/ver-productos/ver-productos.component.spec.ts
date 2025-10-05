import { makeStateKey } from '@angular/core';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ErrorBoundaryService } from '../../../core/services/error-boundary.service';
import { LiveAnnouncerService } from '../../../core/services/live-announcer.service';
import { ModalService } from '../../../core/services/modal.service';
import { ProductoService } from '../../../core/services/producto.service';
import { SubcategoriaService } from '../../../core/services/subcategoria.service';
import { UserService } from '../../../core/services/user.service';
import { Producto } from '../../../shared/models/producto.model';
import {
  SearchFilters,
  SmartSearchService,
} from '../../../shared/services/smart-search.service';
import { FavoritesService } from '../../../shared/services/favorites.service';
import { ThemeMode, ThemeService } from '../../../shared/services/theme.service';
import { VerProductosComponent } from './ver-productos.component';

type Mocked<T> = {
  [K in keyof T]: jest.Mock;
};

describe('VerProductosComponent (isolated)', () => {
  let component: VerProductosComponent;
  let productoService: Mocked<ProductoService>;
  let categoriaService: Mocked<CategoriaService>;
  let subcategoriaService: Mocked<SubcategoriaService>;
  let modalService: Mocked<ModalService> & { getObservaciones: jest.Mock }; // narrow typing
  let userService: Mocked<UserService>;
  let router: Mocked<Router>;
  let cartService: Mocked<CartService> & { getItems: jest.Mock };
  let live: Mocked<LiveAnnouncerService>;
  let transferState: { get: jest.Mock; set: jest.Mock };
  let errorBoundary: { safeExecute: jest.Mock; captureError: jest.Mock };
  let smartSearch: {
    getDefaultFilters: jest.Mock;
    getSearchHistory: jest.Mock;
    getCurrentFilters: jest.Mock;
    updateFilters: jest.Mock;
    addToSearchHistory: jest.Mock;
    getSuggestions: jest.Mock;
    searchProducts: jest.Mock;
  };
  let favoritesService: {
    getFavorites: jest.Mock;
    toggleFavorite: jest.Mock;
  };
  let themeService: {
    getCurrentTheme: jest.Mock;
    toggleTheme: jest.Mock;
  };

  let filters$: Subject<SearchFilters>;
  let history$: Subject<string[]>;
  let favorites$: Subject<Set<number>>;
  let theme$: Subject<ThemeMode>;

  const defaultFilters: SearchFilters = {
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

  const productosMock: Producto[] = [
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

  const categoriasMock = [
    { categoriaId: 10, nombre: 'Bebidas' },
    { categoriaId: 20, nombre: 'Platos Principales' },
  ];

  const subcategoriasMock = [
    { subcategoriaId: 100, categoriaId: 10, nombre: 'Calientes' },
    { subcategoriaId: 200, categoriaId: 10, nombre: 'Frescos' },
    { subcategoriaId: 300, categoriaId: 20, nombre: 'Saludable' },
  ];

  const scrollListeners: Record<string, EventListenerOrEventListenerObject> = {};
  let originalAddEventListener: typeof window.addEventListener;
  let originalScrollTo: typeof window.scrollTo;
  let originalSpeechRecognition: any;

  beforeEach(() => {
    Object.keys(scrollListeners).forEach((key) => delete scrollListeners[key]);
    filters$ = new Subject<SearchFilters>();
    history$ = new Subject<string[]>();
    favorites$ = new Subject<Set<number>>();
    theme$ = new Subject<ThemeMode>();

    productoService = {
      getProductos: jest.fn(),
    } as unknown as Mocked<ProductoService>;

    categoriaService = {
      list: jest.fn(),
    } as unknown as Mocked<CategoriaService>;

    subcategoriaService = {
      list: jest.fn(),
    } as unknown as Mocked<SubcategoriaService>;

    modalService = {
      openModal: jest.fn(),
      closeModal: jest.fn(),
      getObservaciones: jest.fn().mockReturnValue('Sin azúcar'),
    } as unknown as Mocked<ModalService> & { getObservaciones: jest.Mock };

    userService = {
      getAuthState: jest.fn().mockReturnValue(of(false)),
      getUserRole: jest.fn().mockReturnValue(null),
    } as unknown as Mocked<UserService>;

    router = {
      navigate: jest.fn(),
    } as unknown as Mocked<Router>;

    cartService = {
      addToCart: jest.fn(),
      changeQty: jest.fn(),
      getItems: jest.fn().mockReturnValue([]),
    } as unknown as Mocked<CartService> & { getItems: jest.Mock };

    live = {
      announce: jest.fn(),
    } as unknown as Mocked<LiveAnnouncerService>;

    const transferStateStore = new Map<string, unknown>();
    transferState = {
      get: jest.fn((key: ReturnType<typeof makeStateKey>, defaultValue: unknown) => {
        const storeKey = key.toString();
        return transferStateStore.has(storeKey) ? transferStateStore.get(storeKey) : defaultValue;
      }),
      set: jest.fn((key: ReturnType<typeof makeStateKey>, value: unknown) => {
        transferStateStore.set(key.toString(), value);
      }),
    };

    errorBoundary = {
      safeExecute: jest.fn((fn: () => unknown, _component: string, _fallback?: unknown, onError?: (error: Error) => void) => {
        try {
          return fn();
        } catch (error) {
          onError?.(error as Error);
          return undefined;
        }
      }),
      captureError: jest.fn(),
    };

    smartSearch = {
      getDefaultFilters: jest.fn(() => ({ ...defaultFilters })),
      getSearchHistory: jest.fn(() => history$.asObservable()),
      getCurrentFilters: jest.fn(() => filters$.asObservable()),
      updateFilters: jest.fn(),
      addToSearchHistory: jest.fn(),
      getSuggestions: jest.fn(() => [{ text: 'Café', type: 'product', count: 1 }]),
      searchProducts: jest.fn((products: Producto[]) => [...products]),
    };

    favoritesService = {
      getFavorites: jest.fn(() => favorites$.asObservable()),
      toggleFavorite: jest.fn().mockReturnValue(true),
    };

    themeService = {
      getCurrentTheme: jest.fn(() => theme$.asObservable()),
      toggleTheme: jest.fn(),
    };

    originalAddEventListener = window.addEventListener;
    window.addEventListener = jest
      .fn((type: string, listener: EventListenerOrEventListenerObject) => {
        scrollListeners[type] = listener;
      })
      .mockName('addEventListener') as unknown as typeof window.addEventListener;

    originalScrollTo = window.scrollTo;
    window.scrollTo = jest.fn();

    originalSpeechRecognition = (window as any).webkitSpeechRecognition;
    (window as any).webkitSpeechRecognition = jest.fn().mockImplementation(() => ({
      start: jest.fn(),
      onresult: null,
      onerror: null,
      onend: null,
      lang: '',
      continuous: false,
      interimResults: false,
    }));

    component = new VerProductosComponent(
      productoService,
      categoriaService,
      subcategoriaService,
      modalService,
      userService,
      router,
      cartService,
      live,
      transferState as unknown as any,
      errorBoundary as unknown as ErrorBoundaryService,
      smartSearch as unknown as SmartSearchService,
      favoritesService as unknown as FavoritesService,
      themeService as unknown as ThemeService,
    );

    component.productos = [...productosMock];
    component.productosFiltrados = [...productosMock];
    component.categorias = ['Bebidas'];

    history$.next(['Anterior']);
    favorites$.next(new Set([1]));
    theme$.next('light');
  });

  afterEach(() => {
    window.addEventListener = originalAddEventListener;
    window.scrollTo = originalScrollTo;
    if (originalSpeechRecognition) {
      (window as any).webkitSpeechRecognition = originalSpeechRecognition;
    } else {
      delete (window as any).webkitSpeechRecognition;
    }
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  function emitSearchFilters(filters: Partial<SearchFilters>) {
    filters$.next({ ...component.searchFilters, ...filters });
  }

  it('inicializa servicios y suscripciones correctamente', () => {
    component['initializeServices']();

    expect(smartSearch.getSearchHistory).toHaveBeenCalled();
    expect(favoritesService.getFavorites).toHaveBeenCalled();
    expect(themeService.getCurrentTheme).toHaveBeenCalled();

    history$.next(['Nueva']);
    expect(component.searchHistory).toEqual(['Nueva']);

    favorites$.next(new Set([2]));
    theme$.next('dark');
    expect(component.favorites.has(2)).toBe(true);
    expect(component.currentTheme).toBe('dark');
  });

  it('configura suscripción de filtros y aplica búsqueda con debounce', () => {
    jest.useFakeTimers();
    const applyFiltersSpy = jest.spyOn(component as any, 'applyFilters');

    component['setupSearchSubscription']();
    emitSearchFilters({ query: 'café' });

    expect(applyFiltersSpy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(350);
    expect(applyFiltersSpy).toHaveBeenCalled();
  });

  it('gestiona obtención de productos usando TransferState como caché', () => {
    const cached = [productosMock[0]];
    transferState.get.mockReturnValue(cached);

    component.obtenerProductos();

    expect(productoService.getProductos).not.toHaveBeenCalled();
    expect(component.productosFiltrados).toEqual(cached);
    expect(component.isLoading).toBe(false);
  });

  it('ejecuta ngOnInit completando flujo de inicialización', () => {
    const setupFiltersSpy = jest.spyOn(component as any, 'setupSearchSubscription');
    const setupScrollSpy = jest.spyOn(component as any, 'setupScrollListener');
    const loadEnhancementsSpy = jest.spyOn(component as any, 'loadProductEnhancements');

    productoService.getProductos.mockReturnValue(of({ data: productosMock, message: '' }));
    categoriaService.list.mockReturnValue(of([]));
    subcategoriaService.list.mockReturnValue(of([]));

    component.ngOnInit();

    expect(productoService.getProductos).toHaveBeenCalled();
    expect(userService.getAuthState).toHaveBeenCalled();
    expect(setupFiltersSpy).toHaveBeenCalled();
    expect(setupScrollSpy).toHaveBeenCalled();
    expect(loadEnhancementsSpy).toHaveBeenCalled();
    expect(component.isWebView).toBe(true);
  });

  it('actualiza el rol de usuario cuando hay sesión activa', () => {
    productoService.getProductos.mockReturnValue(of({ data: [], message: '' }));
    categoriaService.list.mockReturnValue(of([]));
    subcategoriaService.list.mockReturnValue(of([]));
    userService.getAuthState.mockReturnValue(of(true));
    userService.getUserRole.mockReturnValue('Cliente');

    component.ngOnInit();

    expect(component.userRole).toBe('Cliente');
  });

  it('carga productos desde servicio y enriquece categorías y subcategorías', () => {
    productoService.getProductos.mockReturnValue(of({ data: productosMock, message: '' }));
    categoriaService.list.mockReturnValue(of(categoriasMock));
    subcategoriaService.list
      .mockReturnValueOnce(of(subcategoriasMock.filter((s) => s.categoriaId === 10)))
      .mockReturnValueOnce(of(subcategoriasMock.filter((s) => s.categoriaId === 20)));

    component.obtenerProductos();

    expect(component.productos.length).toBe(3);
    expect(component.subcategorias).toEqual(['Calientes', 'Frescos', 'Saludable']);
    expect(transferState.set).toHaveBeenCalled();
  });

  it('maneja respuesta sin datos desde servicio de productos', () => {
    productoService.getProductos.mockReturnValue(of({ data: undefined, message: 'No datos' }));

    component.obtenerProductos();

    expect(component.mensaje).toBe('No datos');
    expect(component.isLoading).toBe(false);
  });

  it('captura errores al cargar productos mediante subscribe', () => {
    const error = new Error('falló');
    productoService.getProductos.mockReturnValue(throwError(() => error));

    component.obtenerProductos();

    expect(errorBoundary.captureError).toHaveBeenCalledWith(error, 'VerProductosComponent', 'Error loading products');
    expect(component.mensaje).toContain('Error al cargar productos');
  });

  it('usa fallback de safeExecute cuando la llamada lanza error sincronamente', () => {
    const syncError = new Error('sync fail');
    productoService.getProductos.mockImplementation(() => {
      throw syncError;
    });

    component.obtenerProductos();

    expect(component.mensaje).toContain('Error al cargar productos');
    expect(component.isLoading).toBe(false);
  });

  it('extrae categorías desde productos cuando falla la carga de catálogos', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    categoriaService.list.mockReturnValue(throwError(() => new Error('boom')));

    component['setProductos']([...productosMock]);

    expect(component.categorias.sort()).toEqual(['Bebidas', 'Platos Principales']);
  });

  it('gestiona búsqueda e historial de sugerencias', () => {
    component.onSearchInput({ target: { value: 'ca' } } as unknown as Event);
    expect(component.showSuggestions).toBe(false);

    component.onSearchInput({ target: { value: 'caf' } } as unknown as Event);
    expect(component.showSuggestions).toBe(true);
    expect(smartSearch.getSuggestions).toHaveBeenCalledWith('caf', component.productos);

    component.onSearchFocus();
    expect(component.showSuggestions).toBe(true);

    jest.useFakeTimers();
    component.onSearchBlur();
    jest.runAllTimers();
    expect(component.showSuggestions).toBe(false);

    component.selectSuggestion({ text: 'Café', type: 'product', count: 1 });
    expect(smartSearch.addToSearchHistory).toHaveBeenCalledWith('Café');

    component.clearSearch();
    expect(component.searchFilters.query).toBe('');
  });

  it('administra filtros avanzados y ordenamientos', () => {
    const applyFiltersSpy = jest.spyOn(component as any, 'applyFilters');

    component.toggleAdvancedFilters();
    expect(component.showAdvancedFilters).toBe(true);

    component.onCategoryChange('Bebidas');
    expect(component.searchFilters.category).toBe('Bebidas');

    component.onSubcategoryChange('Calientes');
    expect(component.searchFilters.subcategory).toBe('Calientes');

    component.onPriceRangeChange(10, 20);
    component.onCaloriesRangeChange(0, 100);

    component.onSortChange('price', 'desc');
    expect(component.sortDirection).toBe('desc');

    component.toggleSortDirection();
    expect(component.sortDirection).toBe('asc');
    expect(applyFiltersSpy).toHaveBeenCalled();
  });

  it('aplica filtros y ordena favoritos primero', () => {
    component.productos = [...productosMock];
    component.favorites = new Set([2]);
    smartSearch.searchProducts.mockReturnValue([...productosMock]);

    component['applyFilters']();

    expect(component.productosFiltrados[0].productoId).toBe(2);
    expect(component.totalProductos).toBe(3);
    expect(component.paginaActual).toBe(1);
  });

  it('limpia filtros y calcula filtros activos', () => {
    component.searchFilters = {
      ...component.searchFilters,
      category: 'Bebidas',
      subcategory: 'Calientes',
      priceRange: { min: 5, max: 15 },
      caloriesRange: { min: 10, max: 50 },
    };

    expect(component.getActiveFiltersCount()).toBe(4);

    component.clearAllFilters();
    expect(component.searchFilters).toEqual(defaultFilters);
  });

  it('obtiene categorías únicas y subcategorías asociadas', () => {
    component.subcategorias = ['Calientes', 'Frescos', 'Saludable'];

    expect(component.getUniqueCategories()).toEqual(['Bebidas']);
    expect(component.getSubcategoriesForCategory('Bebidas')).toEqual(['Calientes', 'Frescos']);
  });

  it('administra favoritos y reordena productos', () => {
    favoritesService.toggleFavorite.mockReturnValueOnce(true).mockReturnValueOnce(false);

    component.productosFiltrados = [...productosMock];
    component.toggleFavorite(productosMock[0]);
    expect(live.announce).toHaveBeenCalledWith('Café Agregado a favoritos');

    component.toggleFavorite(productosMock[0]);
    expect(live.announce).toHaveBeenCalledWith('Café Eliminado de favoritos');

    component.favorites = new Set([1, 2]);
    expect(component.isFavorite(1)).toBe(true);
    expect(component.hasFavorites()).toBe(true);
  });

  it('gestiona carrito de compras', () => {
    cartService.getItems.mockReturnValue([{ productoId: 1, cantidad: 2 }]);

    component.addToCart(productosMock[0]);
    expect(cartService.addToCart).toHaveBeenCalledWith(productosMock[0]);
    expect(live.announce).toHaveBeenCalledWith('Café agregado al carrito');

    component.increaseQuantity(productosMock[0]);
    component.decreaseQuantity(productosMock[0]);
    expect(cartService.changeQty).toHaveBeenNthCalledWith(1, 1, 1);
    expect(cartService.changeQty).toHaveBeenNthCalledWith(2, 1, -1);

    expect(component.getProductQuantity(1)).toBe(2);
    expect(component.getProductQuantity(99)).toBe(0);
  });

  it('interactúa con tema y modos de vista', () => {
    component.toggleTheme();
    expect(themeService.toggleTheme).toHaveBeenCalled();

    component.toggleViewMode();
    expect(component.viewMode).toBe('list');

    component.setViewMode('grid');
    expect(component.viewMode).toBe('grid');
    expect(live.announce).toHaveBeenCalledWith('Vista cambiada a cuadrícula');
  });

  it('gestiona paginación incluyendo elipsis y cambios de página', () => {
    component.productosFiltrados = new Array(5).fill(productosMock[0]);
    component.productosPorPagina = 2;
    expect(component.productosPaginados.length).toBe(2);
    expect(component.totalPaginas).toBe(3);
    expect(component.paginasVisibles).toEqual([1, 2, 3]);

    component.productosFiltrados = new Array(30).fill(productosMock[0]);
    component.paginaActual = 5;
    const pages = component.paginasVisibles;
    expect(pages[0]).toBe(1);
    expect(pages.includes('...')).toBe(true);

    component.goToPage('...');
    expect(component.paginaActual).toBe(5);

    component.goToPage(2);
    expect(component.paginaActual).toBe(2);
    expect(window.scrollTo).toHaveBeenCalled();
    expect(live.announce).toHaveBeenCalledWith('Página 2 de 15');

    component.goToPage(99);
    expect(component.paginaActual).toBe(2);

    component.nextPage();
    expect(component.paginaActual).toBe(3);
    component.prevPage();
    expect(component.paginaActual).toBe(2);

    expect(component.trackByProductId(0, productosMock[0])).toBe(1);
  });

  it('cambia elementos por página y anuncia actualización', () => {
    component.changeItemsPerPage(24);
    expect(component.productosPorPagina).toBe(24);
    expect(live.announce).toHaveBeenCalledWith('Mostrando 24 productos por página');
  });

  it('abre detalle con botones según rol de usuario', () => {
    const producto = { ...productosMock[0], imagen: 'img.webp' };
    component.userRole = 'Cliente';

    component.abrirDetalle(producto);
    const modalConfig = modalService.openModal.mock.calls.at(-1)?.[0];
    expect(modalConfig.buttons).toHaveLength(1);
    modalConfig.buttons[0].action();
    expect(cartService.addToCart).toHaveBeenCalledWith(producto, 'Sin azúcar');
    expect(modalService.closeModal).toHaveBeenCalled();
    expect(live.announce).toHaveBeenCalledWith('Café añadido al carrito');

    component.userRole = 'Administrador';
    component.abrirDetalle({ ...producto, imagen: { src: 'other' } as unknown as string });
    const adminConfig = modalService.openModal.mock.calls.at(-1)?.[0];
    expect(adminConfig.buttons).toHaveLength(1);
    adminConfig.buttons[0].action();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/productos/editar', producto.productoId]);
    expect(modalService.closeModal).toHaveBeenCalledTimes(2);
  });

  it('configura listeners de scroll y detecta modo webview', () => {
    component['setupScrollListener']();
    expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));

    component['detectWebView']();
    expect(component.isWebView).toBe(true);

    const listener = scrollListeners.scroll as EventListener;
    Object.defineProperty(window, 'pageYOffset', { value: 500, configurable: true, writable: true });
    listener(new Event('scroll'));
    expect(component.showScrollToTop).toBe(true);
    Object.defineProperty(window, 'pageYOffset', { value: 0, configurable: true, writable: true });
  });

  it('carga mejoras de producto generando ratings y reviews', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.8);
    jest.spyOn(Math, 'floor').mockImplementation((value: number) => Math.trunc(value));

    component['loadProductEnhancements']();

    expect(component.productRatings.size).toBeGreaterThan(0);
    expect(component.productReviews.size).toBeGreaterThan(0);
  });

  it('gestiona búsqueda por voz con reconocimiento y errores', () => {
    const recognitionInstance = {
      start: jest.fn(),
      onresult: null as null | ((event: any) => void),
      onerror: null as null | (() => void),
      onend: null as null | (() => void),
      lang: '',
      continuous: false,
      interimResults: false,
    };

    (window as any).webkitSpeechRecognition.mockImplementation(() => recognitionInstance);

    component.isVoiceSearchSupported = true;
    component.favorites = new Set();
    const applySpy = jest.spyOn(component as any, 'applyFilters');

    component.startVoiceSearch();
    expect(component.isVoiceSearching).toBe(true);
    expect(recognitionInstance.start).toHaveBeenCalled();

    recognitionInstance.onresult?.({ results: [[{ transcript: 'Café' }]] });
    expect(smartSearch.updateFilters).toHaveBeenCalledWith({ query: 'Café' });
    expect(applySpy).toHaveBeenCalled();
    expect(live.announce).toHaveBeenCalledWith('Búsqueda por voz: Café');

    recognitionInstance.onerror?.();
    expect(live.announce).toHaveBeenCalledWith('Error en la búsqueda por voz');

    recognitionInstance.onend?.();
    expect(component.isVoiceSearching).toBe(false);

    component.isVoiceSearchSupported = false;
    component.startVoiceSearch();

    component.isVoiceSearchSupported = true;
    component.isVoiceSearching = true;
    component.startVoiceSearch();
  });

  it('restablece filtros y controla paginación pública', () => {
    const clearSpy = jest.spyOn(component, 'clearAllFilters');
    component.showAllProducts();
    expect(clearSpy).toHaveBeenCalled();

    component.totalPaginas;
    component.jumpToPage(1);
    component.jumpToPage('2');
    expect(component.paginaActual).toBe(1);

    expect(component.trackByPageNumber(0, 5)).toBe(5);

    component.scrollToTopPublic();
    expect(window.scrollTo).toHaveBeenCalled();
  });

  it('reemplaza imagen de producto cuando falla la carga', () => {
    const image = { src: 'otro.webp', classList: { add: jest.fn() } } as unknown as HTMLImageElement;

    component.onProductImageError({ target: image } as unknown as Event);
    expect(image.src).toContain('logo2.webp');
    expect(image.classList.add).toHaveBeenCalledWith('fallback-logo');

    component.onProductImageError({ target: image } as unknown as Event);
    expect(image.classList.add).toHaveBeenCalledTimes(1);
  });

  it('calcula tiempos de preparación y precios originales simulados', () => {
    const producto = productosMock[0];
    expect(component.getProductPrepTime(producto)).toBe(5);
    expect(component.getProductPrepTime({ ...producto, categoria: 'Desconocida' })).toBe(15);

    const randomSpy = jest.spyOn(Math, 'random');
    randomSpy.mockReturnValueOnce(0.8);
    expect(component.getProductOriginalPrice(producto)).toBe(Math.round(producto.precio * 1.2));

    randomSpy.mockReturnValue(0.1);
    expect(component.getProductOriginalPrice(producto)).toBeNull();
  });

  it('provee trackBy alternativo e iconos de categoría', () => {
    expect(component.trackByProductoId(0, productosMock[0])).toBe(1);
    expect(component.getCategoryIcon('Bebidas')).toBe('fas fa-coffee');
    expect(component.getCategoryIcon('Otra')).toBe('fas fa-utensils');
  });

  it('devuelve números de paginación compactados y acceso a Math global', () => {
    component.productosFiltrados = new Array(6).fill(productosMock[0]);
    component.productosPorPagina = 1;
    expect(component.getPaginationNumbers()).toEqual([1, 2, 3, 4, 5, 6]);

    component.productosFiltrados = new Array(50).fill(productosMock[0]);
    component.paginaActual = 4;
    const pages = component.getPaginationPages();
    expect(pages[0]).toBe(1);
    expect(pages.at(-1)).toBe(50);

    expect(component.Math).toBe(Math);
  });

  it('ejecuta ngAfterViewInit con y sin referencia de búsqueda', () => {
    const setupSpy = jest.spyOn(component as any, 'setupSearchInput');
    component.ngAfterViewInit();
    expect(setupSpy).not.toHaveBeenCalled();

    component.searchInput = {
      nativeElement: document.createElement('input'),
    } as any;
    component.ngAfterViewInit();
    expect(setupSpy).toHaveBeenCalled();
  });

  it('completa ciclo de vida onDestroy', () => {
    const nextSpy = jest.spyOn((component as any).destroy$, 'next');
    const completeSpy = jest.spyOn((component as any).destroy$, 'complete');
    component.ngOnDestroy();
    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});

