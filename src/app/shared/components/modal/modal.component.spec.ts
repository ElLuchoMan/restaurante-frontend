import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';

import { ModalService } from '../../../core/services/modal.service';
import { UserService } from '../../../core/services/user.service';
import {
  createModalServiceMock,
  createUserServiceMock,
  mockElementAnimate,
} from '../../mocks/test-doubles';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let modalServiceSpy: any;
  let userServiceSpy: any;
  let modalDataSubject: BehaviorSubject<any>;
  let isOpenSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    // Mock element.animate para JSDOM
    mockElementAnimate();

    modalDataSubject = new BehaviorSubject(null);
    isOpenSubject = new BehaviorSubject(false);
    modalServiceSpy = createModalServiceMock();
    userServiceSpy = createUserServiceMock();
    // Sobrescribir observables del mock con nuestros subjects de prueba
    modalServiceSpy.modalData$ = modalDataSubject.asObservable();
    modalServiceSpy.isOpen$ = isOpenSubject.asObservable();

    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [
        { provide: ModalService, useValue: modalServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
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

  it('should render input field when modalData has input', async () => {
    const inputData = { input: { label: 'Name', value: 'Initial' } };
    modalDataSubject.next(inputData);
    isOpenSubject.next(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const inputField: HTMLInputElement = fixture.nativeElement.querySelector('input[type="text"]');
    expect(inputField).toBeTruthy();
    expect(inputField.value).toBe('Initial');
  });

  it('should allow observations when user role is Cliente or Mesero', async () => {
    // El método canAddObservations debe retornar true para Cliente y Mesero
    component.userRole = 'Cliente';
    expect(component.canAddObservations()).toBe(true);

    component.userRole = 'Mesero';
    expect(component.canAddObservations()).toBe(true);

    // Y false para otros roles
    component.userRole = 'Administrador';
    expect(component.canAddObservations()).toBe(false);
  });
});
