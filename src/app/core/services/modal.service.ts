import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalData = new BehaviorSubject<any>(null);
  modalData$ = this.modalData.asObservable();
  private isOpen = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpen.asObservable();

  openModal(data: any) {
    this.modalData.next(data);
    this.isOpen.next(true);
  }

  closeModal() {
    this.isOpen.next(false);
  }
}
