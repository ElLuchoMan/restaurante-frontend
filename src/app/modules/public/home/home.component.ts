import { AsyncPipe, CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  TransferState,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { UserService } from '../../../core/services/user.service';
import { RolTrabajador } from '../../../shared/constants';
import { ProductoVendido } from '../../../shared/models/telemetry.model';
import { clearBlobUrlCache, getSafeImageSrc } from '../../../shared/utils/image.utils';

// HOME_STATE ya no necesario - hero simplificado sin carrusel

@Component({
  selector: 'app-home',
  imports: [RouterModule, NgOptimizedImage, AsyncPipe, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements AfterViewInit, OnInit, OnDestroy {
  isLoggedOut$: Observable<boolean>;
  isWebView = false;
  isMobile = false;
  cartCount = 0;

  // Verificar si el usuario es cliente (no trabajador)
  get isClient(): boolean {
    const role = this.userService.getUserRole();
    return !role || !Object.values(RolTrabajador).includes(role as RolTrabajador);
  }

  // Calcular clases de columna dinámicamente según número de cards
  getColumnClass(totalCards: number): string {
    switch (totalCards) {
      case 1:
        return 'col-8 col-sm-6 col-md-4'; // Card sola centrada
      case 2:
        return 'col-6'; // 50% cada una (lado a lado)
      case 3:
        return 'col-4'; // 33.33% cada una (3 en línea)
      case 4:
        return 'col-6'; // 50% cada una (2x2 filas)
      case 5:
      case 6:
        return 'col-4'; // 33.33% cada una (máximo 3 por fila)
      default:
        return 'col-6 col-md-4'; // Fallback responsive
    }
  }

  // Verificar si el usuario está logueado
  get isLoggedIn(): boolean {
    return !!this.userService.getUserRole();
  }

  // Obtener todas las cards que deben mostrarse
  get webViewCards(): Array<{
    type: string;
    title: string;
    icon: string;
    color: string;
    route?: string;
    action?: string;
  }> {
    const cards = [
      {
        type: 'ubicacion',
        title: 'Ubicación',
        icon: 'fa-map-marker-alt',
        color: 'text-primary',
        route: '/ubicacion',
      },
      {
        type: 'llamar',
        title: 'Llamar',
        icon: 'fa-phone',
        color: 'text-success',
        action: 'tel:3042449339',
      },
    ];

    if (this.cartCount > 0) {
      cards.push({
        type: 'carrito',
        title: `Carrito (${this.cartCount})`,
        icon: 'fa-shopping-cart',
        color: 'text-success',
        route: '/client/carrito',
      });
    }

    if (this.isLoggedIn) {
      if (this.isClient) {
        cards.push({
          type: 'pedidos',
          title: 'Mis Pedidos',
          icon: 'fa-history',
          color: 'text-info',
          route: '/cliente/mis-pedidos',
        });
        cards.push({
          type: 'perfil-cliente',
          title: 'Mi Perfil',
          icon: 'fa-user',
          color: 'text-warning',
          route: '/cliente/perfil',
        });
      } else {
        cards.push({
          type: 'perfil-trabajador',
          title: 'Mi Perfil',
          icon: 'fa-user-tie',
          color: 'text-primary',
          route: '/trabajador/perfil',
        });
      }
    }

    return cards;
  }

  // Contar número total de cards
  get totalCardsCount(): number {
    return this.webViewCards.length;
  }

  // Productos populares dinámicos
  productosPopulares: ProductoVendido[] = [];
  loadingProductos = true;
  errorProductos = false;

  private footerObserver?: IntersectionObserver;
  private authSub?: Subscription;
  private footerObserverInitAttempts = 0;
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private ts: TransferState,
    private userService: UserService,
    private cartService: CartService,
    private telemetryService: TelemetryService,
    private cdr: ChangeDetectorRef,
  ) {
    this.isLoggedOut$ = this.userService.getAuthState().pipe(map((isAuth) => !isAuth));
  }

  ngOnInit(): void {
    // Detectar si estamos en navegador puro (no Capacitor)
    if (isPlatformBrowser(this.platformId)) {
      const cap: any = (window as any).Capacitor;
      // true cuando es entorno nativo (Capacitor), false en navegador web
      this.isWebView = !!(
        cap &&
        typeof cap.getPlatform === 'function' &&
        cap.getPlatform() !== 'web'
      );
      // Añadir clase a <body> solo en nativo (para estilos exclusivos)
      if (this.isWebView) {
        document.body.classList.add('is-native');
      }

      // Detectar dispositivos móviles en Web (no WebView)
      this.detectMobileDevice();
    }
    // Contador de carrito para topbar nativa
    this.cartService.count$?.subscribe?.((n) => (this.cartCount = n ?? 0));
    // Reconfigurar el observer cuando cambia el estado de sesión
    this.authSub = this.userService
      .getAuthState()
      .pipe(map((isAuth) => !isAuth))
      .subscribe((isLoggedOut) => {
        if (isLoggedOut) {
          // esperar a que Angular renderice la barra tras logout
          setTimeout(() => this.initFooterObserver(), 0);
        } else {
          this.footerObserver?.disconnect();
        }
      });

    // Cargar productos populares solo en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.loadProductosPopulares();
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Hero simplificado - ya no necesitamos lógica de carrusel Bootstrap
    this.initFooterObserver();
  }

  ngOnDestroy(): void {
    this.footerObserver?.disconnect();
    this.authSub?.unsubscribe();
    if (this.isWebView && isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('is-native');
    }
    // Limpiar cache de imágenes Blob para evitar memory leaks
    clearBlobUrlCache();
  }

  private initFooterObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const footerEl =
      (document.querySelector('app-footer .footer') as Element | null) ||
      document.querySelector('.footer');
    if (!footerEl) {
      if (this.footerObserverInitAttempts++ < 10) {
        setTimeout(() => this.initFooterObserver(), 300);
      }
      return;
    }
    this.footerObserver?.disconnect();
    this.footerObserver = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting === true;
        const qaBar = document.querySelector('.quick-actions-bar') as HTMLElement | null;
        if (!qaBar) return;
        if (isVisible) {
          qaBar.classList.add('qa-hidden');
        } else {
          qaBar.classList.remove('qa-hidden');
        }
      },
      {
        root: null,
        threshold: 0.01,
        rootMargin: '0px 0px 140px 0px',
      },
    );
    this.footerObserver.observe(footerEl);

    // Aplicar estado inicial si el footer ya es visible al crear la barra
    const qaBarNow = document.querySelector('.quick-actions-bar') as HTMLElement | null;
    if (qaBarNow) {
      const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
      const rect = footerEl.getBoundingClientRect();
      const footerVisible = rect.top < viewportH && rect.bottom > 0;
      if (footerVisible) qaBarNow.classList.add('qa-hidden');
      else qaBarNow.classList.remove('qa-hidden');
    }
  }

  /**
   * TrackBy function para la lista de productos populares
   */
  trackByProductoId(index: number, producto: ProductoVendido): number {
    return producto.productoId;
  }

  /**
   * Carga los productos populares desde el backend
   */
  loadProductosPopulares(): void {
    this.loadingProductos = true;
    this.errorProductos = false;

    this.telemetryService
      .getProductosPopulares({
        limit: 4,
        periodo: 'historico',
      })
      .subscribe({
        next: (response) => {
          if (response.code === 200 && response.data && response.data.productosPopulares) {
            this.productosPopulares = response.data.productosPopulares;
            this.errorProductos = false;
          } else {
            this.errorProductos = true;
            console.warn('No se pudieron cargar los productos populares:', response.message);
          }
          this.loadingProductos = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar productos populares:', error);
          this.errorProductos = true;
          this.loadingProductos = false;
          this.cdr.detectChanges();
        },
      });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Cambiar a logo como fallback
      img.src = 'assets/img/logo2.webp';
      img.alt = 'El fogón DE MARÍA - Logo';
      // Añadir clase para estilos específicos del fallback
      img.classList.add('fallback-logo');
    }
  }

  /**
   * Obtiene la fuente de imagen adecuada para un producto
   * Evita usar imágenes base64 grandes directamente como src para prevenir error 431
   */
  getProductImageSrc(producto: ProductoVendido): string {
    return getSafeImageSrc(producto.imagen, producto.productoId);
  }

  /**
   * Obtiene la fuente de imagen usando el índice del array para variar las imágenes fallback
   * Útil cuando los productos tienen el mismo ID pero necesitamos imágenes diferentes
   */
  getProductImageSrcByIndex(producto: ProductoVendido, index: number): string {
    return getSafeImageSrc(producto.imagen, index + 1); // +1 para que empiece desde 1, no 0
  }

  /**
   * Detecta si el dispositivo es móvil usando breakpoints y user agent
   */
  private detectMobileDevice(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Usar el breakpoint oficial de la app: < 992px (Bootstrap lg)
    const isMobileViewport = window.innerWidth < 992;

    // Detectar dispositivos móviles por user agent como fallback
    const mobileUserAgents = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobileUserAgent = mobileUserAgents.test(navigator.userAgent);

    // Es móvil si el viewport es pequeño O es un dispositivo móvil
    this.isMobile = isMobileViewport || isMobileUserAgent;

    // Listener para cambios de tamaño de ventana
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < 992 || isMobileUserAgent;

      // Solo detectar cambios si realmente cambió el estado móvil
      if (wasMobile !== this.isMobile) {
        this.cdr.detectChanges();
      }
    });
  }
}
