import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { UserService } from './core/services/user.service';

import { NetworkService } from './core/services/network.service';
import { SeoService } from './core/services/seo.service';
import { ModalComponent } from './shared/components/modal/modal.component';
import { NativeTopbarComponent } from './shared/components/native-topbar/native-topbar.component';
import { QuickActionsComponent } from './shared/components/quick-actions/quick-actions.component';
import { UpdateBannerComponent } from './shared/components/update-banner/update-banner.component';
import { SharedModule } from './shared/shared.module';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    SharedModule,
    ModalComponent,
    UpdateBannerComponent,
    QuickActionsComponent,
    NativeTopbarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'restaurante-frontend';
  private destroy$ = new Subject<void>();
  isHome$!: Observable<boolean>;
  isLoggedOut$!: Observable<boolean>;
  isWebView = false;
  // Eliminado isLoggedOut$ (reversión)
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
    private network: NetworkService,
    private route: ActivatedRoute,
    private seo: SeoService,
    private location: Location,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Estado de sesión para condicionar barra inferior en webview
    this.isLoggedOut$ = this.userService.getAuthState().pipe(map((isAuth) => !isAuth));
    // Detectar entorno nativo (Capacitor) para mostrar barra transversal solo en webview
    const cap: any = (window as any).Capacitor;
    this.isWebView = !!(
      cap &&
      typeof cap.getPlatform === 'function' &&
      cap.getPlatform() !== 'web'
    );
    // stream para saber si estamos en Home (para mostrar/ocultar footer en mobile)
    this.isHome$ = this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith({ url: this.router.url } as NavigationEnd),
      map(() => this.router.url === '/' || this.router.url.startsWith('/home')),
      takeUntil(this.destroy$),
    );
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        const main = document.getElementById('main');
        main?.focus();
        this.seo.applyForRoute(this.route.snapshot, this.router.url);
        this.seo.updateCanonical(this.router.url);
        // Forzar scroll al top después de cada navegación (incluye "atrás")
        try {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        } catch {
          window.scrollTo(0, 0);
        }
        // Recordar última ruta válida cuando estamos online
        if (this.network.current) {
          this.network.setLastOnlinePath(this.router.url);
        }
      });

    let wasOffline = false;
    this.network.isOnline$.pipe(takeUntil(this.destroy$)).subscribe((online) => {
      if (!online) {
        wasOffline = true;
        this.router.navigate(['/offline']);
      } else if (wasOffline) {
        // Solo redirigir cuando se recupera de estar offline
        wasOffline = false;
        const prev = this.network.consumeLastOnlinePath();
        if (prev && prev !== '/offline') {
          this.router.navigateByUrl(prev);
        } else {
          this.router.navigate(['/home']);
        }
      }
    });

    // Manejo del botón atrás (Android): navegar al historial en vez de cerrar
    window.addEventListener('popstate', () => {
      if (history.length <= 1) this.router.navigate(['/home']);
    });

    // Capturar botón físico atrás con @capacitor/app (más fiable)
    (async () => {
      try {
        const cap: any = (window as any).Capacitor;
        if (!cap || (cap.getPlatform && cap.getPlatform() === 'web')) return;
        const { App } = await import('@capacitor/app');
        App.addListener('backButton', (_ev: any) => {
          const url = this.router.url || '';
          console.log(
            '[BackButton] event received. currentUrl=',
            url,
            'history.length=',
            history.length,
          );
          const atRoot = url === '/' || url.startsWith('/home');
          if (atRoot) {
            // No cerrar la app en raíz
            this.router.navigate(['/home']);
            return;
          }
          console.log('[BackButton] navigating back via Location.back()');
          this.location.back();
        });
      } catch {
        // fallback silencioso
      }
    })();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
