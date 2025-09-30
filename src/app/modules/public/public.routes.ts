import { Routes } from '@angular/router';

import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { LoginComponent } from '../auth/login/login.component';
import { RegisterComponent } from '../auth/register/register.component';
import { ConsultarDomicilioComponent } from './domicilios/consultar-domicilios/consultar-domicilios.component';
import { HomeComponent } from './home/home.component';
import { OfflineComponent } from './offline/offline.component';
import { ConsultarReservaComponent } from './reservas/consultar-reserva/consultar-reserva.component';
import { CrearReservaComponent } from './reservas/crear-reserva/crear-reserva.component';
import { ReservasDelDiaComponent } from './reservas/reservas-del-dia/reservas-del-dia.component';

export const publicRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Inicio',
    data: { description: 'Innovación con sabor colombiano. Conoce nuestro menú y reservas.' },
  },
  {
    path: 'home',
    component: HomeComponent,
    title: 'Inicio',
    data: { description: 'Innovación con sabor colombiano. Conoce nuestro menú y reservas.' },
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login',
    data: { description: 'Accede para gestionar tus pedidos y reservas.' },
  },
  {
    path: 'registro-cliente',
    component: RegisterComponent,
    title: 'Registro',
    data: { description: 'Crea tu cuenta para disfrutar de promociones y llevar tu historial.' },
  },
  {
    path: 'menu',
    loadComponent: () =>
      import('./ver-productos/ver-productos.component').then((c) => c.VerProductosComponent),
    title: 'Ver Productos',
    data: { description: 'Explora nuestros platos: tradición colombiana y opciones reinventadas.' },
  },
  // Redirección: el antiguo menú de reservas ya no está aquí
  { path: 'reservas', redirectTo: 'reservas/crear', pathMatch: 'full' },
  { path: 'reservas/crear', component: CrearReservaComponent, title: 'Crear Reserva' },
  {
    path: 'reservas/consultar',
    component: ConsultarReservaComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador', 'Cliente'] },
    title: 'Consultar Reservas',
  },
  {
    path: 'reservas/hoy',
    component: ReservasDelDiaComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Administrador'] },
    title: 'Reservas del Día',
  },
  {
    path: 'domicilios',
    children: [
      {
        path: 'consultar',
        component: ConsultarDomicilioComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Administrador', 'Domiciliario'] },
        title: 'Consultar Domicilios',
      },
    ],
  },
  {
    path: 'ubicacion',
    loadComponent: () =>
      import('./ubicacion-restaurante/ubicacion-restaurante.component').then(
        (c) => c.UbicacionRestauranteComponent,
      ),
    title: 'Ubicación',
    data: { description: 'Encuéntranos y visítanos. Estamos listos para atenderte.' },
  },
  {
    path: 'notificaciones',
    loadComponent: () =>
      import('./notification-center/notification-center.component').then(
        (c) => c.NotificationCenterComponent,
      ),
    title: 'Notificaciones',
    data: { description: 'Centro de notificaciones recibidas.' },
  },
  {
    path: 'offline',
    component: OfflineComponent,
    title: 'Sin conexión',
    data: { robots: 'noindex, nofollow', description: 'Estás sin conexión. Intenta nuevamente.' },
  },
];

// Removed default export - using named export instead
