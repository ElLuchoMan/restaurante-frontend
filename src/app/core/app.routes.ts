import { Routes } from '@angular/router';

import { PageNotFoundComponent } from '../modules/public/page-not-found/page-not-found.component';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('../modules/public/public.routes').then((m) => m.publicRoutes),
  },
  {
    path: 'admin',
    loadChildren: () => import('../modules/admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: 'trabajador',
    loadChildren: () =>
      import('../modules/trabajadores/trabajadores.routes').then((m) => m.trabajadoresRoutes),
  },
  {
    path: 'cliente',
    loadChildren: () => import('../modules/client/client.routes').then((m) => m.clientRoutes),
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
