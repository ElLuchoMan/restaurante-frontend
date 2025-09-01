import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CarritoComponent } from './carrito/carrito.component';
import { clientRoutes } from './client.routes';

@NgModule({
  declarations: [],
  imports: [CommonModule, FormsModule, RouterModule.forChild(clientRoutes), CarritoComponent],
  exports: [RouterModule],
})
export class ClientModule {}
