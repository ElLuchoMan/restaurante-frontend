import { TestBed } from '@angular/core/testing';

import { LoggingService } from './logging.service';
import { ModalService } from './modal.service';

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggingService],
    });
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial modalData as null and isOpen as false', () => {
    expect(service.getModalData()).toBeNull();

    let isOpenValue: boolean | undefined;
    service.isOpen$.subscribe((value) => {
      isOpenValue = value;
    });
    expect(isOpenValue).toBe(false);
  });

  it('should update modalData and set isOpen to true when openModal is called', () => {
    const data = { title: 'Test Modal', message: 'Contenido de prueba' };
    service.openModal(data);

    expect(service.getModalData()).toEqual(data);

    let isOpenValue: boolean | undefined;
    service.isOpen$.subscribe((value) => {
      isOpenValue = value;
    });
    expect(isOpenValue).toBe(true);
  });

  it('should set isOpen to false when closeModal is called', () => {
    service.openModal({ title: 'Test Modal' });
    service.closeModal();

    let isOpenValue: boolean | undefined;
    service.isOpen$.subscribe((value) => {
      isOpenValue = value;
    });
    expect(isOpenValue).toBe(false);
  });
});
