import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RegisterComponent } from '../auth/register/register.component';
import publicRoutes from './public.routes';
import { VerProductosComponent } from './ver-productos/ver-productos.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(publicRoutes),
    RegisterComponent,
    VerProductosComponent,
  ],
})
export class PublicModule {}
