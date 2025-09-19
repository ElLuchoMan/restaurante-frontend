import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-native-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './native-topbar.component.html',
  styleUrls: ['./native-topbar.component.scss'],
})
export class NativeTopbarComponent implements OnInit, OnDestroy {
  isLoggedOut$: Observable<boolean>;
  cartCount = 0;
  logoLink = '/home';
  private mainEl?: HTMLElement | null;
  constructor(
    cart: CartService,
    user: UserService,
    private router: Router,
  ) {
    this.isLoggedOut$ = user.getAuthState().pipe(map((isAuth) => !isAuth));
    cart.count$?.subscribe?.((n) => (this.cartCount = n ?? 0));
    // Siempre dirigir el logo al Home
    this.logoLink = '/home';
  }

  ngOnInit(): void {
    this.mainEl = document.getElementById('main') as HTMLElement | null;
    this.applyTopPadding();
    // Recalcular al cambiar de ruta (Home sin padding; resto con padding)
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) this.applyTopPadding();
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.applyTopPadding();
  }

  private applyTopPadding(): void {
    const bar = document.querySelector('.home-topbar') as HTMLElement | null;
    if (!this.mainEl || !bar) return;
    const url = this.router.url || '';
    const atHome = url === '/' || url.startsWith('/home');
    if (atHome) {
      // En Home: sin padding para que el carrusel quede pegado a la topbar
      this.mainEl.style.paddingTop = '0px';
      return;
    }
    // Usar altura fija de 60px para consistencia
    this.mainEl.style.paddingTop = `calc(60px + max(env(safe-area-inset-top), 0px))`;
  }

  ngOnDestroy(): void {
    if (this.mainEl) this.mainEl.style.paddingTop = '';
  }
}
