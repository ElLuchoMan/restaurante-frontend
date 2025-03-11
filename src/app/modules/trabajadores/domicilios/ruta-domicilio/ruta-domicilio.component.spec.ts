import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RutaDomicilioComponent } from './ruta-domicilio.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { DomicilioService } from '../../../../core/services/domicilio.service';
import { ModalService } from '../../../../core/services/modal.service';
import { ToastrService } from 'ngx-toastr';
import { estadoPago } from '../../../../shared/constants';
import { mockDomicilioRespone } from './../../../../shared/mocks/domicilio.mock';
import { FakeDomSanitizer } from '../../../../shared/mocks/fakeDomSanitizer';

describe('RutaDomicilioComponent', () => {
  let component: RutaDomicilioComponent;
  let fixture: ComponentFixture<RutaDomicilioComponent>;
  let activatedRoute: ActivatedRoute;
  let router: jest.Mocked<Router>;
  let sanitizer: DomSanitizer;
  let domicilioService: jest.Mocked<DomicilioService>;
  let modalService: jest.Mocked<ModalService>;
  let toastrService: jest.Mocked<ToastrService>;

  // Simulación de queryParams
  const queryParamsMock = {
    direccion: 'Test Address, Bogotá',
    telefono: '123456',
    observaciones: 'Test Observations',
    id: '1'
  };

  beforeEach(async () => {
    const activatedRouteMock = {
      queryParams: of(queryParamsMock)
    };

    const sanitizerMock = {
      bypassSecurityTrustResourceUrl: jest.fn((url: string) => {
        return {
          toString: () => url,
          changingThisBreaksApplicationSecurity: url
        } as unknown as SafeResourceUrl;
      }),
      sanitize: jest.fn((context: any, value: SafeResourceUrl) => {
        return (value as any).toString();
      })
    };

    const domicilioServiceMock = {
      updateDomicilio: jest.fn()
    };

    const modalServiceMock = {
      openModal: jest.fn(),
      getModalData: jest.fn(),
      closeModal: jest.fn()
    };

    const toastrServiceMock = {
      success: jest.fn(),
      error: jest.fn()
    };

    const routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      // IMPORTANTE: Importamos el componente standalone en "imports"
      imports: [RutaDomicilioComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: DomSanitizer, useValue: FakeDomSanitizer },
        { provide: DomicilioService, useValue: domicilioServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RutaDomicilioComponent);
    component = fixture.componentInstance;
    activatedRoute = TestBed.inject(ActivatedRoute);
    sanitizer = TestBed.inject(DomSanitizer);
    domicilioService = TestBed.inject(DomicilioService) as jest.Mocked<DomicilioService>;
    modalService = TestBed.inject(ModalService) as jest.Mocked<ModalService>;
    toastrService = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;

    fixture.detectChanges();
  });

  it('should mark domicilio as finalizado when marcarFinalizado is called', () => {
    domicilioService.updateDomicilio.mockReturnValue(of(mockDomicilioRespone));
    component.marcarFinalizado();
    expect(domicilioService.updateDomicilio).toHaveBeenCalledWith(1, { entregado: true });
    expect(toastrService.success).toHaveBeenCalledWith('Domicilio marcado como finalizado');
  });

  it('should log error when marking domicilio as finalizado fails', () => {
    const errorResponse = new Error('Error');
    domicilioService.updateDomicilio.mockReturnValue(throwError(() => errorResponse));
    console.error = jest.fn();
    component.marcarFinalizado();
    expect(console.error).toHaveBeenCalledWith('Error al marcar finalizado', errorResponse);
  });

  describe('marcarPago', () => {
    it('should open modal and process payment when a method is selected', () => {
      modalService.getModalData.mockReturnValue({
        select: { selected: 'NEQUI' }
      });
      domicilioService.updateDomicilio.mockReturnValue(of(mockDomicilioRespone));

      component.marcarPago();
      expect(modalService.openModal).toHaveBeenCalled();

      // Se obtiene la configuración enviada al modal y se ejecuta la acción "Aceptar"
      const config = modalService.openModal.mock.calls[0][0];
      config.buttons[0].action();

      expect(domicilioService.updateDomicilio).toHaveBeenCalledWith(1, { estadoPago: estadoPago.PAGADO });
      expect(toastrService.success).toHaveBeenCalledWith('Domicilio marcado como pagado');
      expect(modalService.closeModal).toHaveBeenCalled();
    });

    it('should log error when no payment method is selected', () => {
      modalService.getModalData.mockReturnValue({
        select: { selected: null }
      });
      console.error = jest.fn();
      component.marcarPago();
      const config = modalService.openModal.mock.calls[0][0];
      config.buttons[0].action();
      expect(console.error).toHaveBeenCalledWith("No se ha seleccionado un método de pago.");
    });

    it('should handle error when updating domicilio payment fails', () => {
      modalService.getModalData.mockReturnValue({
        select: { selected: 'DAVIPLATA' }
      });
      const errorResponse = new Error('Error');
      domicilioService.updateDomicilio.mockReturnValue(throwError(() => errorResponse));
      component.marcarPago();
      const config = modalService.openModal.mock.calls[0][0];
      config.buttons[0].action();
      expect(toastrService.error).toHaveBeenCalledWith('Error al marcar como pagado');
    });
  });

  it('should navigate to "/trabajador/domicilios/tomar" when volver is called', () => {
    component.volver();
    expect(router.navigate).toHaveBeenCalledWith(['/trabajador/domicilios/tomar']);
  });
});
