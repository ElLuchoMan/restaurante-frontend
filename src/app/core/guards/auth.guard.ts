import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  canActivate(): boolean {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (this.userService.isTokenExpired()) {
      this.toastr.clear();
      this.toastr.error(
        'La sesión ha expirado, por favor inicia sesión nuevamente',
        'Sesión expirada',
      );
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
