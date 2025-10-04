import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { ModalService } from '../../../core/services/modal.service';
import { createModalServiceMock } from '../../mocks/test-doubles';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let modalServiceSpy: any;
  let modalDataSubject: BehaviorSubject<any>;
  let isOpenSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    modalDataSubject = new BehaviorSubject(null);
    isOpenSubject = new BehaviorSubject(false);
    modalServiceSpy = createModalServiceMock();
    // Sobrescribir observables del mock con nuestros subjects de prueba
    modalServiceSpy.modalData$ = modalDataSubject.asObservable();
    modalServiceSpy.isOpen$ = isOpenSubject.asObservable();

    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [
        { provide: ModalService, useValue: modalServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update modalData when modalService emits new data', () => {
    const testData = { title: 'Test Modal', message: 'Contenido de prueba' };
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

  it('should render and bind input field when modalData has input', async () => {
    const inputData = { input: { label: 'Reason', value: 'Initial' } };
    modalDataSubject.next(inputData);
    isOpenSubject.next(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea).toBeTruthy();
    expect(textarea.value).toBe('Initial');

    textarea.value = 'Updated';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.modalData.input?.value).toBe('Updated');
  });
});
