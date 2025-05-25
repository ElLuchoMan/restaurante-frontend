import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { clientRoutes } from './client.routes';
import { CarritoComponent } from './carrito/carrito.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(clientRoutes),
    CarritoComponent
  ],
  exports: [RouterModule]
})
export class ClientModule { }
