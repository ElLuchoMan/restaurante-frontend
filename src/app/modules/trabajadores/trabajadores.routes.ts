import { Routes } from '@angular/router';

import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { RutaDomicilioComponent } from './domicilios/ruta-domicilio/ruta-domicilio.component';
import { TomarDomicilioComponent } from './domicilios/tomar-domicilio/tomar-domicilio.component';

export const trabajadoresRoutes: Routes = [
  {
    path: 'domicilios',
    children: [
      {
        path: 'tomar',
        component: TomarDomicilioComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Domiciliario'] },
      },
      { path: 'ruta-domicilio', component: RutaDomicilioComponent },
    ],
  },
];
