import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoggingService, LogLevel } from './logging.service';

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
    this.logger.log(LogLevel.INFO, 'Entra');
    this.modalData.next(data);
    this.isOpen.next(true);
  }

  closeModal() {
    this.isOpen.next(false);
  }

  getModalData(): any {
    this.logger.log(LogLevel.INFO, 'getModalData');
    return this.modalData.value;
  }
}
