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
    path: 'trabajador',
    loadChildren: () =>
      import('../modules/trabajadores/trabajadores.module').then((m) => m.TrabajadoresModule),
  },
  {
    path: 'cliente',
    loadChildren: () => import('../modules/client/client.module').then((m) => m.ClientModule),
  },
  {
    path: 'not-found',
    component: PageNotFoundComponent,
    title: 'Página no encontrada',
    data: { description: 'La página que buscas no existe.', robots: 'noindex, nofollow' },
  },
  {
    path: '**',
    component: PageNotFoundComponent,
    title: 'Página no encontrada',
    data: { description: 'La página que buscas no existe.', robots: 'noindex, nofollow' },
  },
];
