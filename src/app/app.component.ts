import { isPlatformBrowser, Location } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';

import { NetworkService } from './core/services/network.service';
import { SeoService } from './core/services/seo.service';
import { ModalComponent } from './shared/components/modal/modal.component';
import { UpdateBannerComponent } from './shared/components/update-banner/update-banner.component';
import { SharedModule } from './shared/shared.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SharedModule, ModalComponent, UpdateBannerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'restaurante-frontend';
  private destroy$ = new Subject<void>();
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
    private network: NetworkService,
    private route: ActivatedRoute,
    private seo: SeoService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
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
