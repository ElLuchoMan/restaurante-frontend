import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { CarritoComponent } from './carrito/carrito.component';
import { MisPedidosComponent } from './mis-pedidos/mis-pedidos.component';

export const clientRoutes: Routes = [
    {
        path: 'carrito-cliente',
        component: CarritoComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Cliente'] }
    },
    {
        path: 'mis-pedidos',
        component: MisPedidosComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Cliente'] }
    }
];

