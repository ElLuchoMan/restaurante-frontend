import { Routes } from '@angular/router';

import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { LoginComponent } from '../auth/login/login.component';
import { RegisterComponent } from '../auth/register/register.component';
import { ConsultarDomicilioComponent } from './domicilios/consultar-domicilios/consultar-domicilios.component';
import { HomeComponent } from './home/home.component';
import { ConsultarReservaComponent } from './reservas/consultar-reserva/consultar-reserva.component';
import { CrearReservaComponent } from './reservas/crear-reserva/crear-reserva.component';
import { MenuReservasComponent } from './reservas/menu-reservas/menu-reservas.component';
import { ReservasDelDiaComponent } from './reservas/reservas-del-dia/reservas-del-dia.component';
import { UbicacionRestauranteComponent } from './ubicacion-restaurante/ubicacion-restaurante.component';
import { VerProductosComponent } from './ver-productos/ver-productos.component';

const publicRoutes: Routes = [
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
    component: VerProductosComponent,
    title: 'Ver Productos',
    data: { description: 'Explora nuestros platos: tradición colombiana y opciones reinventadas.' },
  },
  {
    path: 'reservas',
    component: MenuReservasComponent,
    children: [
      {
        path: 'consultar',
        component: ConsultarReservaComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Administrador', 'Cliente'] },
        title: 'Consultar Reservas',
      },
      {
        path: 'hoy',
        component: ReservasDelDiaComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Administrador'] },
        title: 'Reservas del Día',
      },
      { path: 'crear', component: CrearReservaComponent },
    ],
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
    component: UbicacionRestauranteComponent,
    title: 'Ubicación',
    data: { description: 'Encuéntranos y visítanos. Estamos listos para atenderte.' },
  },
];

export default publicRoutes;
