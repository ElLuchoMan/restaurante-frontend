import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import publicRoutes from './public.routes';



@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(publicRoutes)  ]
})
export class PublicModule { }
