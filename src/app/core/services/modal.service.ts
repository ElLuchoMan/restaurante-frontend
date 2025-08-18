import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalData = new BehaviorSubject<any>(null);
  modalData$ = this.modalData.asObservable();
  private isOpen = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpen.asObservable();

  constructor(private logger: LoggingService) {}

  openModal(data: any) {
    this.logger.log('Entra');
    this.modalData.next(data);
    this.isOpen.next(true);
  }

  closeModal() {
    this.isOpen.next(false);
  }

  getModalData(): any {
    this.logger.log('getModalData');
    return this.modalData.value;
  }
}
