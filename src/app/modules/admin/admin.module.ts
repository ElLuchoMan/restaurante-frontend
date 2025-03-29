import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { adminRoutes } from './admin.routes';
import { CrearProductoComponent } from './crear-producto/crear-producto.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(adminRoutes),
    CrearProductoComponent
  ],
  exports: [RouterModule]
})
export class AdminModule { }
