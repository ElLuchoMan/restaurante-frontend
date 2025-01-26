import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { adminRoutes } from './admin.routes';
import { RegisterComponent } from '../auth/register/register.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(adminRoutes),
    RegisterComponent,
  ]
})
export class AdminModule { }
