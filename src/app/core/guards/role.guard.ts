import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles: string[] = route.data['roles'];
    const userRole = this.userService.getUserRole();

    if (!userRole || !expectedRoles.includes(userRole)) {
      this.toastr.error('No tienes permisos para acceder a esta página', 'Acceso denegado');
      const fallbackRoute = route.data['fallbackRoute'] || '/login';
      this.router.navigate([fallbackRoute]);
      return false;
    }

    return true;
  }
}
