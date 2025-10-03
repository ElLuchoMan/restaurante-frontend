import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  makeStateKey,
  OnDestroy,
  OnInit,
  TransferState,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ErrorBoundaryService } from '../../../core/services/error-boundary.service';
import { LiveAnnouncerService } from '../../../core/services/live-announcer.service';
import { ModalService } from '../../../core/services/modal.service';
import { ProductoService } from '../../../core/services/producto.service';
import { SubcategoriaService } from '../../../core/services/subcategoria.service';
import { UserService } from '../../../core/services/user.service';
import { FloatingCartComponent } from '../../../shared/components/floating-cart/floating-cart.component';
import { Producto } from '../../../shared/models/producto.model';
import { FavoritesService } from '../../../shared/services/favorites.service';
import {
  SearchFilters,
  SearchSuggestion,
  SmartSearchService,
} from '../../../shared/services/smart-search.service';
import { ThemeMode, ThemeService } from '../../../shared/services/theme.service';

@Component({
  selector: 'app-ver-productos',
  templateUrl: './ver-productos.component.html',
  styleUrls: ['./ver-productos.component.scss'],
  imports: [CommonModule, FormsModule, FloatingCartComponent],
})
export class VerProductosComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private staticStateKey = makeStateKey<Producto[]>('ver_productos_initial');
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  mensaje: string = '';
  categorias: string[] = [];
  subcategorias: string[] = [];
  userRole: string | null = null;
  carrito: Producto[] = [];
  private destroy$ = new Subject<void>();

  // Nuevas propiedades para funcionalidades avanzadas
  searchFilters: SearchFilters;
  searchSuggestions: SearchSuggestion[] = [];
  showSuggestions = false;
  searchHistory: string[] = [];
  currentTheme: ThemeMode = 'light';
  favorites: Set<number> = new Set();
  viewMode: 'grid' | 'list' = 'grid';
  isWebView = false;
  sortOptions = [
    { value: 'name', label: 'Nombre', icon: 'fas fa-sort-alpha-down' },
    { value: 'price', label: 'Precio', icon: 'fas fa-dollar-sign' },
    { value: 'calories', label: 'Calorías', icon: 'fas fa-fire' },
  ];
  sortDirection: 'asc' | 'desc' = 'asc';

  // Paginación mejorada
  paginaActual = 1;
  productosPorPagina = 12;
  totalProductos = 0;

  // Filtros avanzados
  showAdvancedFilters = false;
  categoriasCompletas: any[] = []; // Categorías desde el servicio
  subcategoriasCompletas: any[] = []; // Subcategorías desde el servicio

  // Estados de carga y UI
  isLoading = false;
  isSearching = false;
  isAddingToCart = false;
  showScrollToTop = false;

  // Funcionalidades sorprendentes
  isVoiceSearchSupported = false;
  isVoiceSearching = false;
  pageJumpValue = 1;

  // Datos adicionales para mejorar UX
  productRatings: Map<number, number> = new Map();
  productReviews: Map<number, number> = new Map();
  searchSuggestionsSimple: string[] = [];

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private subcategoriaService: SubcategoriaService,
    private modalService: ModalService,
    private userService: UserService,
    private router: Router,
    private cartService: CartService,
    private live: LiveAnnouncerService,
    private ts: TransferState,
    private errorBoundary: ErrorBoundaryService,
    private smartSearch: SmartSearchService,
    private favoritesService: FavoritesService,
    private themeService: ThemeService,
  ) {
    this.searchFilters = this.smartSearch.getDefaultFilters();
    this.initializeEnhancements();
  }

  ngOnInit(): void {
    this.obtenerProductos();
    this.initializeServices();
    this.detectWebView();
    this.setupSearchSubscription();
    this.setupScrollListener();
    this.loadProductEnhancements();

    this.userService
      .getAuthState()
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLogged) => {
        this.userRole = isLogged ? this.userService.getUserRole() : null;
      });
  }

  ngAfterViewInit(): void {
    // Configurar búsqueda con debounce
    if (this.searchInput) {
      this.setupSearchInput();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== INICIALIZACIÓN =====
  private initializeServices(): void {
    // Cargar historial de búsqueda
    this.smartSearch
      .getSearchHistory()
      .pipe(takeUntil(this.destroy$))
      .subscribe((history) => (this.searchHistory = history));

    // Cargar favoritos
    this.favoritesService
      .getFavorites()
      .pipe(takeUntil(this.destroy$))
      .subscribe((favorites) => (this.favorites = favorites));

    // Cargar tema
    this.themeService
      .getCurrentTheme()
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme) => (this.currentTheme = theme));
  }

  private setupSearchSubscription(): void {
    this.smartSearch
      .getCurrentFilters()
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((filters) => {
        this.searchFilters = filters;
        this.applyFilters();
      });
  }

  private setupSearchInput(): void {
    // Implementar búsqueda con debounce en el input
    // Esto se puede hacer con reactive forms o con un Subject
  }

  // ===== CARGA DE PRODUCTOS =====
  obtenerProductos(): void {
    this.isLoading = true;
    this.errorBoundary.safeExecute(
      () => {
        const cached = this.ts.get(this.staticStateKey, [] as Producto[]);
        if (cached.length) {
          this.setProductos(cached);
          this.isLoading = false;
          return;
        }

        this.productoService
          .getProductos({ onlyActive: true, includeImage: true })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.data) {
                this.setProductos(response.data);
                this.ts.set(this.staticStateKey, response.data);
              } else {
                this.mensaje = response.message;
              }
              this.isLoading = false;
            },
            error: (error) => {
              this.errorBoundary.captureError(
                error,
                'VerProductosComponent',
                'Error loading products',
              );
              this.mensaje = 'Error al cargar productos. Por favor, intenta nuevamente.';
              this.isLoading = false;
            },
          });
      },
      'VerProductosComponent',
      undefined,
      (error) => {
        this.mensaje = 'Error al cargar productos. Por favor, intenta nuevamente.';
        this.isLoading = false;
      },
    );
  }

  private setProductos(list: Producto[]): void {
    this.productos = list;
    this.productosFiltrados = list;
    this.totalProductos = list.length;

    // Cargar categorías y subcategorías desde la API después de tener los productos
    this.cargarCategoriasYSubcategorias();
  }

  private cargarCategoriasYSubcategorias(): void {
    // Primero cargar categorías
    this.categoriaService
      .list()
      .pipe(
        takeUntil(this.destroy$),
        switchMap((categorias) => {
          this.categoriasCompletas = categorias;
          this.categorias = categorias.map((c) => c.nombre);

          // Luego cargar todas las subcategorías
          const subcategoriaObservables = categorias.map((cat) =>
            this.subcategoriaService.list(cat.categoriaId!).pipe(catchError(() => of([]))),
          );

          return forkJoin(subcategoriaObservables.length > 0 ? subcategoriaObservables : [of([])]);
        }),
      )
      .subscribe({
        next: (subcategoriasArrays) => {
          // Aplanar el array de arrays
          this.subcategoriasCompletas = subcategoriasArrays.flat();

          // Enriquecer productos con nombres de categoría y subcategoría
          this.productos = this.productos.map((producto) => {
            const subcategoria = this.subcategoriasCompletas.find(
              (s) => s.subcategoriaId === producto.subcategoriaId,
            );

            if (subcategoria) {
              // Extraer el ID real de categoriaId (puede ser un objeto o un número)
              const catId =
                typeof subcategoria.categoriaId === 'object' && subcategoria.categoriaId !== null
                  ? (subcategoria.categoriaId as any).categoriaId ||
                    (subcategoria.categoriaId as any).pkIdCategoria
                  : subcategoria.categoriaId;

              const categoria = this.categoriasCompletas.find((c) => c.categoriaId === catId);

              return {
                ...producto,
                subcategoria: subcategoria.nombre,
                categoria: categoria?.nombre || '',
              };
            }

            return producto;
          });

          // Actualizar productos filtrados
          this.productosFiltrados = [...this.productos];

          // Extraer nombres únicos de subcategorías desde los productos enriquecidos
          const subcategoriasSet = new Set<string>();
          this.productos.forEach((p) => {
            if (p.subcategoria) subcategoriasSet.add(p.subcategoria);
          });
          this.subcategorias = Array.from(subcategoriasSet);
        },
        error: (error) => {
          console.error('Error cargando categorías y subcategorías:', error);
          // Fallback: extraer lo que se pueda de los productos
          this.extraerCategoriasDeProductos();
        },
      });
  }

  // ===== BÚSQUEDA INTELIGENTE =====
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value;

    this.searchFilters.query = query;
    this.smartSearch.updateFilters({ query });

    if (query.length > 2) {
      this.searchSuggestions = this.smartSearch.getSuggestions(query, this.productos);
      this.showSuggestions = true;
    } else {
      this.showSuggestions = false;
    }
  }

  onSearchFocus(): void {
    if (this.searchFilters.query.length > 2) {
      this.showSuggestions = true;
    }
  }

  onSearchBlur(): void {
    // Delay para permitir clicks en sugerencias
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  selectSuggestion(suggestion: SearchSuggestion): void {
    this.searchFilters.query = suggestion.text;
    this.smartSearch.updateFilters({ query: suggestion.text });
    this.smartSearch.addToSearchHistory(suggestion.text);
    this.showSuggestions = false;
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchFilters.query = '';
    this.smartSearch.updateFilters({ query: '' });
    this.showSuggestions = false;
    this.applyFilters();
  }

  // ===== FILTROS AVANZADOS =====
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  onCategoryChange(category: string): void {
    this.searchFilters.category = category;
    this.searchFilters.subcategory = '';
    this.updateSubcategories();
    this.smartSearch.updateFilters({ category, subcategory: '' });
    this.applyFilters();
  }

  onSubcategoryChange(subcategory: string): void {
    this.searchFilters.subcategory = subcategory;
    this.smartSearch.updateFilters({ subcategory });
    this.applyFilters();
  }

  onPriceRangeChange(min: number, max: number): void {
    this.searchFilters.priceRange = { min, max };
    this.smartSearch.updateFilters({ priceRange: { min, max } });
    this.applyFilters();
  }

  onCaloriesRangeChange(min: number, max: number): void {
    this.searchFilters.caloriesRange = { min, max };
    this.smartSearch.updateFilters({ caloriesRange: { min, max } });
    this.applyFilters();
  }

  // Métodos eliminados: onAllergenToggle y onDietaryToggle (no están en el modelo Producto)

  onSortChange(sortBy: string, sortOrder?: 'asc' | 'desc'): void {
    this.searchFilters.sortBy = sortBy as any;
    if (sortOrder) {
      this.sortDirection = sortOrder;
    }
    this.searchFilters.sortOrder = this.sortDirection;
    this.smartSearch.updateFilters({ sortBy: sortBy as any, sortOrder: this.sortDirection });
    this.applyFilters();
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.onSortChange(this.searchFilters.sortBy, this.sortDirection);
  }

  private updateSubcategories(): void {
    const set = new Set<string>();
    this.productos
      .filter((p) => p.categoria === this.searchFilters.category)
      .forEach((p) => {
        if (p.subcategoria) set.add(p.subcategoria);
      });
    this.subcategorias = Array.from(set);
  }

  private applyFilters(): void {
    this.productosFiltrados = this.smartSearch.searchProducts(this.productos, this.searchFilters);
    this.totalProductos = this.productosFiltrados.length;
    this.paginaActual = 1; // Reset a la primera página
  }

  clearAllFilters(): void {
    this.searchFilters = this.smartSearch.getDefaultFilters();
    this.sortDirection = 'asc';
    this.smartSearch.updateFilters(this.searchFilters);
    this.applyFilters();
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchFilters.category) count++;
    if (this.searchFilters.subcategory) count++;
    if (this.searchFilters.priceRange.min || this.searchFilters.priceRange.max) count++;
    if (this.searchFilters.caloriesRange.min || this.searchFilters.caloriesRange.max) count++;
    return count;
  }

  private extraerCategoriasDeProductos(): void {
    const categoriasSet = new Set<string>();
    this.productos.forEach((p) => {
      if (p.categoria) categoriasSet.add(p.categoria);
    });
    this.categorias = Array.from(categoriasSet);
  }

  getUniqueCategories(): string[] {
    return this.categorias;
  }

  getSubcategoriesForCategory(category: string): string[] {
    return this.subcategorias.filter((sub) =>
      this.productos.some((p) => p.categoria === category && p.subcategoria === sub),
    );
  }

  // ===== FAVORITOS =====
  toggleFavorite(producto: Producto): void {
    const isNowFavorite = this.favoritesService.toggleFavorite(producto);
    const message = isNowFavorite ? 'Agregado a favoritos' : 'Eliminado de favoritos';
    this.live.announce(`${producto.nombre} ${message}`);
  }

  isFavorite(productId: number): boolean {
    return this.favorites.has(productId);
  }

  // ===== CARRITO =====
  addToCart(producto: Producto): void {
    this.cartService.addToCart(producto);
    this.live.announce(`${producto.nombre} agregado al carrito`);
  }

  increaseQuantity(producto: Producto): void {
    this.cartService.changeQty(producto.productoId!, 1);
  }

  decreaseQuantity(producto: Producto): void {
    this.cartService.changeQty(producto.productoId!, -1);
  }

  getProductQuantity(productId: number): number {
    const item = this.cartService.getItems().find((i) => i.productoId === productId);
    return item ? item.cantidad : 0;
  }

  // ===== TEMA =====
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  // ===== VISTA =====
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  // ===== PAGINACIÓN =====
  get productosPaginados(): Producto[] {
    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    return this.productosFiltrados.slice(inicio, inicio + this.productosPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.productosFiltrados.length / this.productosPorPagina);
  }

  goToPage(page: number | string): void {
    if (typeof page === 'string') return; // Ignorar ellipsis
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ===== DETALLE DE PRODUCTO =====
  abrirDetalle(producto: Producto): void {
    const botones = [];

    if (this.userRole === 'Cliente') {
      botones.push({
        label: '🛒 Agregar al carrito',
        class: 'btn btn-primary',
        action: () => {
          this.cartService.addToCart(producto);
          this.live.announce(`${producto.nombre} añadido al carrito`);
          this.modalService.closeModal();
        },
      });
    }

    if (this.userRole === 'Administrador') {
      botones.push({
        label: '✏️ Editar',
        class: 'btn btn-warning',
        action: () => {
          this.router.navigate(['/admin/productos/editar', producto.productoId]);
          this.modalService.closeModal();
        },
      });
    }

    this.modalService.openModal({
      title: producto.nombre,
      image:
        typeof producto.imagen === 'string' ? producto.imagen : '../../../../assets/img/logo2.webp',
      details: {
        precio: producto.precio,
        calorias: producto.calorias,
        categoria: producto.categoria,
        subcategoria: producto.subcategoria,
        descripcion: producto.descripcion,
      },
      buttons: botones,
    });
  }

  // ===== FUNCIONALIDADES SORPRENDENTES =====

  private initializeEnhancements(): void {
    // Verificar soporte para búsqueda por voz
    this.isVoiceSearchSupported =
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

    // Inicializar sugerencias de búsqueda
    this.searchSuggestionsSimple = [
      'Bandeja paisa',
      'Arepas',
      'Sancocho',
      'Empanadas',
      'Tamales',
      'Vegetariano',
      'Sin gluten',
      'Picante',
      'Postres',
      'Bebidas',
    ];
  }

  private setupScrollListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.showScrollToTop = window.pageYOffset > 300;
      });
    }
  }

  // Detectar si estamos en WebView
  private detectWebView(): void {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      // TEMPORAL: Forzar WebView mode para pruebas
      // TODO: Remover después de probar
      this.isWebView = true;

      /* Detección normal (comentada temporalmente):
      this.isWebView = !!(
        (window as any).cordova ||
        (window as any).PhoneGap ||
        (window as any).phonegap ||
        (window as any).ionic ||
        navigator.userAgent.includes('wv') ||
        navigator.userAgent.includes('WebView') ||
        (navigator as any).standalone ||
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
      );
      */
    }
  }

  private loadProductEnhancements(): void {
    // Simular datos de ratings y reviews (en producción vendrían del backend)
    this.productos.forEach((producto) => {
      if (producto.productoId) {
        this.productRatings.set(producto.productoId, Math.random() * 2 + 3); // 3-5 estrellas
        this.productReviews.set(producto.productoId, Math.floor(Math.random() * 50) + 5); // 5-55 reviews
      }
    });
  }

  // Búsqueda por voz
  startVoiceSearch(): void {
    if (!this.isVoiceSearchSupported || this.isVoiceSearching) return;

    this.isVoiceSearching = true;
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.searchFilters.query = transcript;
      this.smartSearch.updateFilters({ query: transcript });
      this.applyFilters();
      this.live.announce(`Búsqueda por voz: ${transcript}`);
    };

    recognition.onerror = () => {
      this.live.announce('Error en la búsqueda por voz');
    };

    recognition.onend = () => {
      this.isVoiceSearching = false;
    };

    recognition.start();
  }

  // Gestión de vista mejorada
  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    this.live.announce(`Vista cambiada a ${mode === 'grid' ? 'cuadrícula' : 'lista'}`);
  }

  // Funciones para ratings y reviews
  getProductRating(productId: number | undefined): number {
    return productId ? this.productRatings.get(productId) || 0 : 0;
  }

  getProductReviewCount(productId: number | undefined): number {
    return productId ? this.productReviews.get(productId) || 0 : 0;
  }

  getStarsArray(rating: number): boolean[] {
    return Array(5)
      .fill(false)
      .map((_, i) => i < Math.floor(rating));
  }

  // Funciones para metadatos de productos
  isProductVegetarian(producto: Producto): boolean {
    return (
      producto.descripcion?.toLowerCase().includes('vegetariano') ||
      producto.categoria?.toLowerCase().includes('vegetariano') ||
      false
    );
  }

  isProductSpicy(producto: Producto): boolean {
    const spicyKeywords = ['picante', 'ají', 'chile', 'jalapeño', 'habanero'];
    return spicyKeywords.some(
      (keyword) =>
        producto.descripcion?.toLowerCase().includes(keyword) ||
        producto.nombre?.toLowerCase().includes(keyword),
    );
  }

  // Colores por categoría
  getCategoryColor(category: string): string {
    const colorMap: { [key: string]: string } = {
      Bebidas: '#17a2b8',
      Postres: '#e83e8c',
      'Platos Principales': '#fd7e14',
      Entradas: '#28a745',
      Sopas: '#6f42c1',
      Ensaladas: '#20c997',
      Carnes: '#dc3545',
      Pescados: '#007bff',
      Vegetariano: '#28a745',
      Vegano: '#20c997',
    };
    return colorMap[category] || '#6c757d';
  }

  // Descuentos y precios - CORREGIDO
  getProductDiscount(producto: Producto): number {
    const originalPrice = this.getProductOriginalPrice(producto);
    if (!originalPrice || originalPrice <= producto.precio) return 0;
    return Math.round(((originalPrice - producto.precio) / originalPrice) * 100);
  }

  // Sugerencias de búsqueda
  getSearchSuggestions(): Array<{ text: string; icon: string }> {
    if (this.searchFilters.query || this.getActiveFiltersCount() === 0) return [];

    return [
      { text: 'Platos principales', icon: 'fa-utensils' },
      { text: 'Vegetariano', icon: 'fa-leaf' },
      { text: 'Bebidas', icon: 'fa-coffee' },
      { text: 'Postres', icon: 'fa-ice-cream' },
    ];
  }

  applySuggestion(suggestion: { text: string; icon: string }): void {
    this.searchFilters.query = suggestion.text;
    this.smartSearch.updateFilters({ query: suggestion.text });
    this.applyFilters();
  }

  showAllProducts(): void {
    this.clearAllFilters();
  }

  // Paginación mejorada
  jumpToPage(page: string | number): void {
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    if (pageNum >= 1 && pageNum <= this.totalPaginas) {
      this.goToPage(pageNum);
    }
  }

  trackByPageNumber(index: number, page: number | string): number | string {
    return page;
  }

  // Scroll to top (público)
  scrollToTopPublic(): void {
    this.scrollToTop();
  }

  // Manejo de errores de imagen
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Usar una imagen de producto existente como fallback
    const fallbackImages = [
      'assets/img/product-1.webp',
      'assets/img/product-2.webp',
      'assets/img/product-3.webp',
      'assets/img/product-4.webp',
      'assets/img/product-5.webp',
    ];
    const randomIndex = Math.floor(Math.random() * fallbackImages.length);
    img.src = fallbackImages[randomIndex];
  }

  // Funciones auxiliares para propiedades que no existen en el modelo
  getProductPrepTime(producto: Producto): number | null {
    // Simular tiempo de preparación basado en categoría
    const prepTimes: { [key: string]: number } = {
      Bebidas: 5,
      Postres: 15,
      'Platos Principales': 25,
      Entradas: 10,
      Sopas: 20,
      Ensaladas: 8,
    };
    return producto.categoria ? prepTimes[producto.categoria] || 15 : null;
  }

  getProductOriginalPrice(producto: Producto): number | null {
    // Simular precio original para productos con descuento
    const hasDiscount = Math.random() > 0.7; // 30% de productos con descuento
    return hasDiscount ? Math.round(producto.precio * 1.2) : null;
  }

  // ===== UTILIDADES =====
  trackByProductoId(index: number, item: Producto) {
    return item.productoId;
  }

  getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      Bebidas: 'fas fa-coffee',
      Postres: 'fas fa-ice-cream',
      'Platos Principales': 'fas fa-utensils',
      Entradas: 'fas fa-seedling',
      Sopas: 'fas fa-bowl-food',
      Ensaladas: 'fas fa-leaf',
      Carnes: 'fas fa-drumstick-bite',
      Pescados: 'fas fa-fish',
      Vegetariano: 'fas fa-carrot',
      Vegano: 'fas fa-seedling',
    };
    return iconMap[category] || 'fas fa-utensils';
  }

  getPaginationNumbers(): (number | string)[] {
    return this.getPaginationPages();
  }

  getPaginationPages(): (number | string)[] {
    const total = this.totalPaginas;
    const current = this.paginaActual;
    const pages: (number | string)[] = [];

    if (total <= 7) {
      // Mostrar todas las páginas si son 7 o menos
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Lógica mejorada para páginas con elipsis
      pages.push(1);

      if (current > 4) {
        pages.push('...');
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== total) {
          pages.push(i);
        }
      }

      if (current < total - 3) {
        pages.push('...');
      }

      if (total > 1) {
        pages.push(total);
      }
    }

    return pages;
  }

  // Propiedad Math para el template
  get Math() {
    return Math;
  }
}
