import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { RegisterComponent } from '../auth/register/register.component';
import { RutaDomicilioComponent } from './ruta-domicilio/ruta-domicilio.component';

export const trabajadoresRoutes: Routes = [
  { path: 'ruta-domicilio', component: RutaDomicilioComponent },
];
