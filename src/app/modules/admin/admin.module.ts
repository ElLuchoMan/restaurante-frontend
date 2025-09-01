import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { adminRoutes } from './admin.routes';

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(adminRoutes)],
  exports: [RouterModule],
})
export class AdminModule {}
