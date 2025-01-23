import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router, private toastr: ToastrService) {}

  canActivate(): boolean {
    if (this.userService.isTokenExpired()) {
      this.router.navigate(['/login']);
      this.toastr.error('La sesión ha expirado, por favor inicia sesión nuevamente', 'Sesión expirada');
      return false;
    }

    return true;
  }
}
