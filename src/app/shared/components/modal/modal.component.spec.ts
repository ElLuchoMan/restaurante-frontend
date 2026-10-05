import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';

import { ModalService } from '../../../core/services/modal.service';
import { UserService } from '../../../core/services/user.service';
import {
  createFnMock,
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
        provideHttpClient(withXhr()),
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

  it('should use the default image when modalData has no image', () => {
    modalDataSubject.next({ title: 'Sin imagen' });
    expect(component.currentImage).toBe('assets/img/logo2.webp');
  });

  it('should use the modalData image when provided', () => {
    modalDataSubject.next({ title: 'Con imagen', image: 'assets/img/x.webp' });
    expect(component.currentImage).toBe('assets/img/x.webp');
  });

  it('should fall back to default image only once on image error', () => {
    modalDataSubject.next({ title: 'Con imagen', image: 'assets/img/x.webp' });
    component.onImageError();
    expect(component.currentImage).toBe('assets/img/logo2.webp');

    // Segunda llamada no debe cambiar nada (evita loops)
    component.currentImage = 'otra.webp';
    component.onImageError();
    expect(component.currentImage).toBe('otra.webp');
  });

  it('should sync observaciones with the service', () => {
    modalServiceSpy.setObservaciones = createFnMock();
    component.observaciones = 'Sin cebolla';
    component.onObservacionesChange();
    expect(modalServiceSpy.setObservaciones).toHaveBeenCalledWith('Sin cebolla');
  });

  it('should clear observaciones and reset image error when modal closes', () => {
    modalDataSubject.next({ title: 'x', image: 'a.webp' });
    isOpenSubject.next(true);
    component.observaciones = 'algo';
    component.onImageError();
    isOpenSubject.next(false);
    expect(component.observaciones).toBe('');
    expect(component.isOpen).toBe(false);
    // imageErrorOccurred reseteado: un nuevo error vuelve a aplicar el default
    component.currentImage = 'b.webp';
    component.onImageError();
    expect(component.currentImage).toBe('assets/img/logo2.webp');
  });

  it('should return false for canAddObservations when there is no role', () => {
    component.userRole = null;
    expect(component.canAddObservations()).toBe(false);
  });

  it('should set userRole from the user service when logged in and clear it when logged out', () => {
    const auth$ = new BehaviorSubject<boolean>(true);
    userServiceSpy.getAuthState.mockReturnValue(auth$.asObservable());
    userServiceSpy.getUserRole.mockReturnValue('Mesero');

    const fixture2 = TestBed.createComponent(ModalComponent);
    fixture2.detectChanges();
    expect(fixture2.componentInstance.userRole).toBe('Mesero');
    expect(fixture2.componentInstance.canAddObservations()).toBe(true);

    auth$.next(false);
    expect(fixture2.componentInstance.userRole).toBeNull();
  });
});
