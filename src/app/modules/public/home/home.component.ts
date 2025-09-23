import { AsyncPipe, CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  makeStateKey,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  TransferState,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { map, Observable, Subscription } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { UserService } from '../../../core/services/user.service';

const HOME_STATE = makeStateKey<string>('home_bootstrap');

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
  cartCount = 0;
  private footerObserver?: IntersectionObserver;
  private authSub?: Subscription;
  private footerObserverInitAttempts = 0;
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private ts: TransferState,
    private userService: UserService,
    private cartService: CartService,
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
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Marcar que el carrusel ya fue inicializado en SSR y evitar doble trabajo en hidratación
    if (!this.ts.hasKey(HOME_STATE)) {
      this.ts.set(HOME_STATE, 'init');
    } else {
      return;
    }
    const el = document.getElementById('header-carousel');
    if (!el) return;
    const Bootstrap = (
      window as unknown as {
        bootstrap?: { Carousel?: new (...args: unknown[]) => { cycle: () => void } };
      }
    ).bootstrap;
    const Carousel = Bootstrap?.Carousel;
    if (Carousel) {
      const instance = new Carousel(el, {
        interval: 5000,
        ride: true,
        pause: false,
        wrap: true,
        touch: true,
      });
      setTimeout(() => instance.cycle(), 100);
    }

    this.initFooterObserver();
  }

  ngOnDestroy(): void {
    this.footerObserver?.disconnect();
    this.authSub?.unsubscribe();
    if (this.isWebView && isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('is-native');
    }
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

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Cambiar a logo como fallback
      img.src = 'assets/img/logo2.webp';
      img.alt = 'La cocina DE MARÍA - Logo';
      // Añadir clase para estilos específicos del fallback
      img.classList.add('fallback-logo');
    }
  }
}
