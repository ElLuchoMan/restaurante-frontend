import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  HostListener,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class QuickActionsComponent implements AfterViewInit, OnDestroy {
  private footerObserver?: IntersectionObserver;
  private barEl?: HTMLElement | null;
  private mainEl?: HTMLElement | null;
  private teardownFns: Array<() => void> = [];
  private keyboardOpen = false;
  private footerVisible = false;
  isLoggedOut$!: Observable<boolean>;

  constructor(
    private userService: UserService,
    private router: Router,
  ) {
    this.isLoggedOut$ = this.userService.getAuthState().pipe(map((isAuth) => !isAuth));
  }

  onLogout(): void {
    this.userService.logout();
    this.router.navigate(['/home']);
  }

  ngAfterViewInit(): void {
    this.barEl = document.querySelector('.quick-actions-bar') as HTMLElement | null;
    this.mainEl = document.getElementById('main') as HTMLElement | null;
    if (!this.barEl || !this.mainEl) return;

    // Ajustar padding inferior del main mientras la barra esté visible
    const applyPadding = (visible: boolean) => {
      if (!this.mainEl || !this.barEl) return;
      const atHome = (this.router.url || '').startsWith('/home') || this.router.url === '/';
      if (!visible) {
        // En Home, deja un respiro mínimo cuando el footer hace ocultar la barra
        this.mainEl.style.paddingBottom = atHome
          ? 'calc(16px + max(env(safe-area-inset-bottom), 0px))'
          : '';
        return;
      }
      const h = this.barEl.getBoundingClientRect().height;
      this.mainEl.style.paddingBottom = `calc(${Math.ceil(h)}px + max(env(safe-area-inset-bottom), 0px))`;
    };

    const updateVisibility = () => {
      const shouldShow = !this.keyboardOpen && !this.footerVisible;
      if (!this.barEl) return;
      if (shouldShow) {
        this.barEl.classList.remove('qa-hidden');
      } else {
        this.barEl.classList.add('qa-hidden');
      }
      applyPadding(shouldShow);
    };

    // Inicial visible
    updateVisibility();

    const setupFooterObserver = () => {
      // Limpiar anterior
      if (this.footerObserver) {
        try {
          this.footerObserver.disconnect();
        } catch {}
        this.footerObserver = undefined;
      }
      const footerEl = document.querySelector('app-footer .footer') as Element | null;
      if (!footerEl) {
        this.footerVisible = false;
        updateVisibility();
        return;
      }
      this.footerObserver = new IntersectionObserver(
        (entries) => {
          this.footerVisible = entries[0]?.isIntersecting === true;
          updateVisibility();
        },
        { root: null, threshold: 0.01, rootMargin: '0px 0px 120px 0px' },
      );
      this.footerObserver.observe(footerEl);
    };

    // Inicial tras render
    setTimeout(setupFooterObserver, 0);

    // Re-vincular al cambiar de ruta (Home agrega/quita footer)
    const sub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        setTimeout(setupFooterObserver, 0);
      }
    });
    this.teardownFns.push(() => sub.unsubscribe());

    // Detectar apertura de teclado por focus de inputs
    const onFocusIn = (ev: Event) => {
      const t = ev.target as HTMLElement | null;
      if (!t) return;
      const tag = (t.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable) {
        this.keyboardOpen = true;
        updateVisibility();
      }
    };
    const onFocusOut = () => {
      this.keyboardOpen = false;
      updateVisibility();
    };
    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('focusout', onFocusOut, true);
    this.teardownFns.push(() => document.removeEventListener('focusin', onFocusIn, true));
    this.teardownFns.push(() => document.removeEventListener('focusout', onFocusOut, true));

    // Detectar teclado por cambio fuerte de viewport (visualViewport)
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    const base = window.innerHeight;
    const onVVResize = () => {
      const h = vv?.height ?? window.innerHeight;
      const delta = base - h;
      // Umbral ~120px para considerar teclado abierto
      const likelyKeyboard = delta > 120;
      if (this.keyboardOpen !== likelyKeyboard) {
        this.keyboardOpen = likelyKeyboard;
        updateVisibility();
      }
    };
    if (vv && typeof vv.addEventListener === 'function') {
      vv.addEventListener('resize', onVVResize);
      this.teardownFns.push(() => vv.removeEventListener('resize', onVVResize));
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    // Recalcular padding si cambia el alto de la barra
    if (!this.mainEl || !this.barEl) return;
    if (this.barEl.classList.contains('qa-hidden')) {
      this.mainEl.style.paddingBottom = '';
    } else {
      const h = this.barEl.getBoundingClientRect().height;
      this.mainEl.style.paddingBottom = `calc(${Math.ceil(h)}px + max(env(safe-area-inset-bottom), 0px))`;
    }
  }

  ngOnDestroy(): void {
    if (this.footerObserver) this.footerObserver.disconnect();
    if (this.mainEl) this.mainEl.style.paddingBottom = '';
    for (const off of this.teardownFns) {
      try {
        off();
      } catch {}
    }
  }
}
