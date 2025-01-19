import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('../modules/public/public.module').then((m) => m.PublicModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('../modules/admin/admin.module').then((m) => m.AdminModule),
  },
  {
    path: 'client',
    loadChildren: () => import('../modules/client/client.module').then((m) => m.ClientModule),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
