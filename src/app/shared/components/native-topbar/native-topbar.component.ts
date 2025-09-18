import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
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
export class NativeTopbarComponent {
  isLoggedOut$: Observable<boolean>;
  cartCount = 0;
  logoLink = '/home';
  constructor(cart: CartService, user: UserService) {
    this.isLoggedOut$ = user.getAuthState().pipe(map((isAuth) => !isAuth));
    cart.count$?.subscribe?.((n) => (this.cartCount = n ?? 0));
    // Siempre dirigir el logo al Home
    this.logoLink = '/home';
  }
}
