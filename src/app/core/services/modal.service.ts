import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ModalData } from '../../shared/models/modal-data.model';
import { LoggingService, LogLevel } from './logging.service';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalData = new BehaviorSubject<ModalData | null>(null);
  modalData$ = this.modalData.asObservable();
  private isOpen = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpen.asObservable();

  constructor(private logger: LoggingService) {}

  openModal(data: ModalData) {
    this.logger.log(LogLevel.INFO, 'Entra');
    this.modalData.next(data);
    this.isOpen.next(true);
  }

  closeModal() {
    this.isOpen.next(false);
  }

  getModalData(): ModalData | null {
    this.logger.log(LogLevel.INFO, 'getModalData');
    return this.modalData.value;
  }
}
