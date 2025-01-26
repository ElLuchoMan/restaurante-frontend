import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { RegisterComponent } from '../auth/register/register.component';

export const adminRoutes: Routes = [
  //   {
  //     path: '',
  //     component: AdminDashboardComponent,
  //     canActivate: [AuthGuard, RoleGuard],
  //     data: { roles: ['Administrador'] },
  //   },
  {
    path: 'registro-trabajador',
    component: RegisterComponent,
    canActivate: [RoleGuard],
    data: { role: 'Administrador' },
  },
];
