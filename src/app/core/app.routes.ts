import { Routes } from '@angular/router';
import { PageNotFoundComponent } from '../modules/public/page-not-found/page-not-found.component';

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
    path: 'cliente',
    loadChildren: () => import('../modules/client/client.module').then((m) => m.ClientModule),
  },
  {
    path: 'not-found',
    component: PageNotFoundComponent,
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
