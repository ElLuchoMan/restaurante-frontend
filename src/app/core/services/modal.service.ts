import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ModalData } from '../../shared/models/modal.model';
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

  getModalData(): ModalData {
    this.logger.log(LogLevel.INFO, 'getModalData');
    return this.modalData.value as ModalData;
  }
}
