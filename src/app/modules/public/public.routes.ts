import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from '../auth/login/login.component';
import { RegisterComponent } from '../auth/register/register.component';
import { ConsultarReservaComponent } from './reservas/consultar-reserva/consultar-reserva.component';
import { CrearReservaComponent } from './reservas/crear-reserva/crear-reserva.component';
import { MenuReservasComponent } from './reservas/menu-reservas/menu-reservas.component';
import { ReservasDelDiaComponent } from './reservas/reservas-del-dia/reservas-del-dia.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { AuthGuard } from '../../core/guards/auth.guard';

const publicRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro-cliente', component: RegisterComponent },
  {
    path: 'reservas',
    component: MenuReservasComponent,
    children: [
      {
        path: 'consultar',
        component: ConsultarReservaComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Administrador'] }
      },
      {
        path: 'hoy',
        component: ReservasDelDiaComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Administrador'] }
      },
      { path: 'crear', component: CrearReservaComponent },
    ]
  }
];

export default publicRoutes;
