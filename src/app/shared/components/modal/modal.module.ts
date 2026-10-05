import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ModalComponent } from './modal.component';

@NgModule({
  imports: [CommonModule, FormsModule, ModalComponent],
  exports: [ModalComponent],
})
export class ModalModule {}
