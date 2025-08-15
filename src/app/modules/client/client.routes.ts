import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { CarritoComponent } from './carrito/carrito.component';
import { MisPedidosComponent } from './mis-pedidos/mis-pedidos.component';
import { PerfilComponent } from './perfil/perfil';

export const clientRoutes: Routes = [
    {
        path: 'carrito-cliente',
        component: CarritoComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Cliente'] },
        title: 'Carrito de compras',
    },
    {
        path: 'mis-pedidos',
        component: MisPedidosComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Cliente'] },
        title: 'Mis pedidos',
    },
    {
        path: 'perfil',
        component: PerfilComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Cliente'] },
        title: 'Mi perfil',
    },
];

