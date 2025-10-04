import { Routes } from '@angular/router';

import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { RegisterComponent } from '../auth/register/register.component';
import { ConsultarReservaComponent } from '../public/reservas/consultar-reserva/consultar-reserva.component';
import { CrearReservaComponent } from '../public/reservas/crear-reserva/crear-reserva.component';
import { MenuReservasComponent } from '../public/reservas/menu-reservas/menu-reservas.component';
import { ReservasDelDiaComponent } from '../public/reservas/reservas-del-dia/reservas-del-dia.component';
import { AccionesComponent } from './acciones/acciones';
import { EnviarNotificacionComponent } from './enviar-notificacion/enviar-notificacion';
import { CrearProductoComponent } from './productos/crear-producto/crear-producto.component';
import { GestionarCategoriasComponent } from './productos/gestionar-categorias/gestionar-categorias.component';
import { ProductosComponent } from './productos/menu-productos/productos.component';
import { TelemetryDashboardComponent } from './telemetry/telemetry-dashboard.component';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'acciones',
    pathMatch: 'full',
  },
  {
    path: 'acciones',
    component: AccionesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] },
    title: 'Acciones Administrativas',
  },
  {
    path: 'dashboard',
    redirectTo: 'acciones',
    pathMatch: 'full',
  },
  {
    path: 'enviar-notificacion',
    component: EnviarNotificacionComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] },
    title: 'Enviar Notificación',
  },
  {
    path: 'registro-admin',
    component: RegisterComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] },
  },
  {
    path: 'productos',
    component: ProductosComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] },
  },
  {
    path: 'telemetria',
    component: TelemetryDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] },
    title: 'Telemetría',
  },
  // Gestión de reservas (solo Administrador)
  {
    path: 'reservas',
    component: MenuReservasComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] },
    title: 'Gestión Reservas',
    children: [
      {
        path: 'consultar',
        component: ConsultarReservaComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Administrador'] },
        title: 'Consultar Reservas',
      },
      {
        path: 'hoy',
        component: ReservasDelDiaComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Administrador'] },
        title: 'Reservas del Día',
      },
      {
        path: 'crear',
        component: CrearReservaComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Administrador'] },
        title: 'Crear Reserva',
      },
    ],
  },
  {
    path: 'productos/crear',
    component: CrearProductoComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] },
  },
  {
    path: 'productos/editar/:id',
    component: CrearProductoComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] },
  },
  {
    path: 'productos/categorias',
    component: GestionarCategoriasComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] },
    title: 'Gestión de Categorías',
  },
];
