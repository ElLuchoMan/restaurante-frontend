import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { RegisterComponent } from '../auth/register/register.component';
import { CrearProductoComponent } from './crear-producto/crear-producto.component';

export const adminRoutes: Routes = [
  //   {
  //     path: '',
  //     component: AdminDashboardComponent,
  //     canActivate: [AuthGuard, RoleGuard],
  //     data: { roles: ['Administrador'] },
  //   },
  {
    path: 'registro-admin',
    component: RegisterComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'productos/crear',
    component: CrearProductoComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
];
