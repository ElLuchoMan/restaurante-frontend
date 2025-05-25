import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { RegisterComponent } from '../auth/register/register.component';
import { CrearProductoComponent } from './productos/crear-producto/crear-producto.component';
import { ProductosComponent } from './productos/menu-productos/productos.component';

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
    path: 'productos',
    component: ProductosComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'productos/crear',
    component: CrearProductoComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
  {
    path: 'productos/editar/:id',
    component: CrearProductoComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] }
  },
];
