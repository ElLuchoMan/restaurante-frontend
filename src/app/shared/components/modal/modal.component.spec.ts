import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { ModalService } from '../../../core/services/modal.service';
import { BehaviorSubject } from 'rxjs';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let modalServiceSpy: any;
  let modalDataSubject: BehaviorSubject<any>;
  let isOpenSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    modalDataSubject = new BehaviorSubject(null);
    isOpenSubject = new BehaviorSubject(false);
    modalServiceSpy = {
      modalData$: modalDataSubject.asObservable(),
      isOpen$: isOpenSubject.asObservable(),
      closeModal: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [
        { provide: ModalService, useValue: modalServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update modalData when modalService emits new data', () => {
    const testData = { title: 'Test Modal', content: 'Contenido de prueba' };
    modalDataSubject.next(testData);
    fixture.detectChanges();
    expect(component.modalData).toEqual(testData);
  });

  it('should update isOpen when modalService emits new state', () => {
    isOpenSubject.next(true);
    fixture.detectChanges();
    expect(component.isOpen).toBe(true);
  });

  it('should call modalService.closeModal when close() is called', () => {
    component.close();
    expect(modalServiceSpy.closeModal).toHaveBeenCalled();
  });
});
