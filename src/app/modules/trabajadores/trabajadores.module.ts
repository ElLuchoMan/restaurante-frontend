import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trabajadoresRoutes } from './trabajadores.routes';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(trabajadoresRoutes),
  ]
})
export class TrabajadoresModule { }
