import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { CarritoComponent } from './carrito/carrito.component';

export const clientRoutes: Routes = [
    {
        path: 'carrito-cliente',
        component: CarritoComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Cliente'] }
    },
];
