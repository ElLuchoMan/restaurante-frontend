import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import publicRoutes from './public.routes';
import { RegisterComponent } from '../auth/register/register.component';



@NgModule({
  declarations: [],
  imports: [CommonModule,
    RouterModule.forChild(publicRoutes),
    RegisterComponent,
  ],
})
export class PublicModule { }
