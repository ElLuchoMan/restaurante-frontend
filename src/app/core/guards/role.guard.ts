import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router, private toastr: ToastrService) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRoles: string[] = route.data['roles'];
    const userRole = this.userService.getUserRole();

    if (!userRole || !expectedRoles.includes(userRole)) {
      this.toastr.error('No tienes permisos para acceder a esta página', 'Acceso denegado');
      this.router.navigate(['/reservas/crear']);
      return false;
    }

    return true;
  }

}
