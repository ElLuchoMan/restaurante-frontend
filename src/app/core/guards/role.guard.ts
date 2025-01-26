import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router, private toastr: ToastrService) { }

  canActivate(route: any): boolean {
    const expectedRole = route.data['role'];
    const userRole = this.userService.getUserRole();

    if (userRole !== expectedRole) {
      console.log('No tienes permisos para acceder a esta página', 'Acceso denegado')
      this.toastr.error('No tienes permisos para acceder a esta página', 'Acceso denegado');
      this.router.navigate(['/not-found']);
      return false;
    }

    return true;
  }
}
