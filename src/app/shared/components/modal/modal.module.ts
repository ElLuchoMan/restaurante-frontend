import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from './modal.component';

@NgModule({
    imports: [CommonModule, FormsModule, ModalComponent],
    exports: [ModalComponent],
})
export class ModalModule { }
