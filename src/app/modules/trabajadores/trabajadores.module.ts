import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { trabajadoresRoutes } from './trabajadores.routes';

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(trabajadoresRoutes)],
})
export class TrabajadoresModule {}
