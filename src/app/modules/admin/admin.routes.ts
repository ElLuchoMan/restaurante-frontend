import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const adminRoutes: Routes = [
//   {
//     path: '',
//     component: AdminDashboardComponent,
//     canActivate: [AuthGuard, RoleGuard],
//     data: { roles: ['Administrador'] },
//   },
];
