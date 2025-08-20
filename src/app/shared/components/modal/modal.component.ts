import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalData } from '../../../shared/models/modal.model';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class ModalComponent implements OnInit {
  isOpen = false;
  modalData: ModalData = {} as ModalData;

  constructor(public modalService: ModalService) { }

  ngOnInit() {
    this.modalService.modalData$.subscribe((data) => {
      if (data) {
        this.modalData = data;
      }
    });

    this.modalService.isOpen$.subscribe((state) => {
      this.isOpen = state;
    });
  }

  close() {
    this.modalService.closeModal();
  }
  
}
