import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

const publicRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
];

export default publicRoutes;
