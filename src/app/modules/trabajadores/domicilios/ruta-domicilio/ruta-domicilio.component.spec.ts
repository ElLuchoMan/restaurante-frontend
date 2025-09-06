import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { DomicilioService } from '../../../../core/services/domicilio.service';
import { LoggingService } from '../../../../core/services/logging.service';
import { ModalService } from '../../../../core/services/modal.service';
import { estadoPago } from '../../../../shared/constants';
import { mockDomicilioRespone } from './../../../../shared/mocks/domicilio.mock';
import { RutaDomicilioComponent } from './ruta-domicilio.component';

describe('RutaDomicilioComponent', () => {
  let component: RutaDomicilioComponent;
  let fixture: ComponentFixture<RutaDomicilioComponent>;
  let activatedRoute: ActivatedRoute;
  let router: jest.Mocked<Router>;
  let domicilioService: jest.Mocked<DomicilioService>;
  let modalService: jest.Mocked<ModalService>;
  let toastrService: jest.Mocked<ToastrService>;
  let loggingService: jest.Mocked<LoggingService>;

  // Simulación de queryParams
  const queryParamsMock = {
    direccion: 'Test Address, Bogotá',
    telefono: '123456',
    observaciones: 'Test Observations',
    id: '1',
  };

  beforeEach(async () => {
    const activatedRouteMock = {
      queryParams: of(queryParamsMock),
    };

    const sanitizerMock = {
      bypassSecurityTrustResourceUrl: jest.fn((url: string) => {
        return {
          toString: () => url,
          changingThisBreaksApplicationSecurity: url,
        } as unknown as SafeResourceUrl;
      }),
      sanitize: jest.fn((context: any, value: SafeResourceUrl) => {
        return (value as any).toString();
      }),
    };

    const domicilioServiceMock = {
      updateDomicilio: jest.fn(),
      getDomicilioById: jest.fn().mockReturnValue(of({ data: { pedido: { productos: [], total: 0 }, cliente: { nombre: 'N', apellido: 'A' } } })),
    };

    const modalServiceMock = {
      openModal: jest.fn(),
      getModalData: jest.fn(),
      closeModal: jest.fn(),
    };

    const toastrServiceMock = {
      success: jest.fn(),
      error: jest.fn(),
    };

    const loggingServiceMock = {
      log: jest.fn(),
    } as unknown as jest.Mocked<LoggingService>;

    const routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      // IMPORTANTE: Importamos el componente standalone en "imports"
      imports: [HttpClientTestingModule, RutaDomicilioComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: DomSanitizer, useValue: sanitizerMock },
        { provide: DomicilioService, useValue: domicilioServiceMock },
        { provide: ModalService, useValue: modalServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: LoggingService, useValue: loggingServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RutaDomicilioComponent);
    component = fixture.componentInstance;
    activatedRoute = TestBed.inject(ActivatedRoute);
    domicilioService = TestBed.inject(DomicilioService) as jest.Mocked<DomicilioService>;
    modalService = TestBed.inject(ModalService) as jest.Mocked<ModalService>;
    toastrService = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
    loggingService = TestBed.inject(LoggingService) as jest.Mocked<LoggingService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;

    component.ngOnInit();
  });

  it('should generate map urls on init', () => {
    expect(component.ubicacionUrl).toBeDefined();
    expect(component.googleMapsUrl).toContain('https://www.google.com/maps/dir/');
  });

  it('should mark domicilio as finalizado when marcarFinalizado is called', () => {
    domicilioService.updateDomicilio.mockReturnValue(of(mockDomicilioRespone));
    component.marcarFinalizado();
    expect(domicilioService.updateDomicilio).toHaveBeenCalledWith(1, {});
    expect(toastrService.success).toHaveBeenCalledWith('Domicilio marcado como finalizado');
  });

  it('should log error when marking domicilio as finalizado fails', () => {
    const errorResponse = new Error('Error');
    domicilioService.updateDomicilio.mockReturnValue(throwError(() => errorResponse));
    console.error = jest.fn();
    component.marcarFinalizado();
    expect(console.error).toHaveBeenCalledWith('Error al marcar finalizado', errorResponse);
  });

  it('should log error when domicilioId is missing in marcarFinalizado', () => {
    component.domicilioId = 0;
    console.error = jest.fn();
    component.marcarFinalizado();
    expect(console.error).toHaveBeenCalledWith('No se encontró el ID del domicilio.');
  });

  describe('marcarPago', () => {
    it('should open modal and process payment when a method is selected', () => {
      modalService.getModalData.mockReturnValue({
        select: { selected: 'NEQUI' },
      });
      domicilioService.updateDomicilio.mockReturnValue(of(mockDomicilioRespone));

      component.marcarPago();
      expect(modalService.openModal).toHaveBeenCalled();

      // Se obtiene la configuración enviada al modal y se ejecuta la acción "Aceptar"
      const config = modalService.openModal.mock.calls[0][0];
      config.buttons[0].action();

      expect(domicilioService.updateDomicilio).toHaveBeenCalledWith(1, {
        estadoPago: estadoPago.PAGADO,
      });
      expect(toastrService.success).toHaveBeenCalledWith('Domicilio marcado como pagado');
      expect(modalService.closeModal).toHaveBeenCalled();
    });

    it('should log error when no payment method is selected', () => {
      modalService.getModalData.mockReturnValue({
        select: { selected: null },
      });
      console.error = jest.fn();
      component.marcarPago();
      const config = modalService.openModal.mock.calls[0][0];
      config.buttons[0].action();
      expect(console.error).toHaveBeenCalledWith('No se ha seleccionado un método de pago.');
    });

    it('should handle error when updating domicilio payment fails', () => {
      modalService.getModalData.mockReturnValue({
        select: { selected: 'DAVIPLATA' },
      });
      const errorResponse = new Error('Error');
      domicilioService.updateDomicilio.mockReturnValue(throwError(() => errorResponse));
      component.marcarPago();
      const config = modalService.openModal.mock.calls[0][0];
      config.buttons[0].action();
      expect(toastrService.error).toHaveBeenCalledWith('Error al marcar como pagado');
    });

    it('should close modal when cancel button is clicked', () => {
      modalService.getModalData.mockReturnValue({
        select: { selected: 'NEQUI' },
      });
      component.marcarPago();
      const config = modalService.openModal.mock.calls[0][0];
      config.buttons[1].action();
      expect(modalService.closeModal).toHaveBeenCalled();
    });
  });

  it('should log error when domicilioId is missing in marcarPago', () => {
    component.domicilioId = 0;
    console.error = jest.fn();
    component.marcarPago();
    expect(console.error).toHaveBeenCalledWith('No se encontró el ID del domicilio.');
  });

  it('should navigate to "/trabajador/domicilios/tomar" when volver is called', () => {
    component.volver();
    expect(router.navigate).toHaveBeenCalledWith(['/trabajador/domicilios/tomar']);
  });
});

describe('RutaDomicilioComponent with default params', () => {
  let component: RutaDomicilioComponent;
  let fixture: ComponentFixture<RutaDomicilioComponent>;

  beforeEach(async () => {
    const activatedRouteMock = {
      queryParams: of({}),
    };

    const sanitizerMock = {
      bypassSecurityTrustResourceUrl: jest.fn((url: string) => {
        return {
          toString: () => url,
          changingThisBreaksApplicationSecurity: url,
        } as unknown as SafeResourceUrl;
      }),
      sanitize: jest.fn((context: any, value: SafeResourceUrl) => {
        return (value as any).toString();
      }),
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RutaDomicilioComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: DomSanitizer, useValue: sanitizerMock },
        { provide: DomicilioService, useValue: { updateDomicilio: jest.fn(), getDomicilioById: jest.fn().mockReturnValue(of({ data: { pedido: { productos: [], total: 0 }, cliente: { nombre: 'N', apellido: 'A' } } })) } },
        {
          provide: ModalService,
          useValue: { openModal: jest.fn(), getModalData: jest.fn(), closeModal: jest.fn() },
        },
        { provide: ToastrService, useValue: { success: jest.fn(), error: jest.fn() } },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RutaDomicilioComponent);
    component = fixture.componentInstance;
    const spyRuta = jest.spyOn(component, 'generarRuta');
    const spyUrl = jest.spyOn(component, 'generarUrlGoogleMaps');
    component.ngOnInit();
    expect(spyRuta).toHaveBeenCalled();
    expect(spyUrl).toHaveBeenCalled();
  });

  it('should use default values when query params are missing', () => {
    expect(component.direccionCliente).toBe('Calle 100 # 13 - 55, Bogotá, Colombia');
    expect(component.telefonoCliente).toBe('No disponible');
    expect(component.observaciones).toBe('Sin observaciones');
    expect(component.domicilioId).toBe(0);
  });
});
