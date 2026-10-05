import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { DomicilioService } from '../../../../core/services/domicilio.service';
import { LoggingService } from '../../../../core/services/logging.service';
import { ModalService } from '../../../../core/services/modal.service';
import { PagoService } from '../../../../core/services/pago.service';
import { PedidoService } from '../../../../core/services/pedido.service';
import { metodoPago } from '../../../../shared/constants';
import {
  createDomicilioServiceMock,
  createDomSanitizerMock,
  createLoggingServiceMock,
  createModalServiceMock,
  createPagoServiceMock,
  createPedidoServiceMock,
  createRouterMock,
  createToastrMock,
} from '../../../../shared/mocks/test-doubles';
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

    const sanitizerMock = createDomSanitizerMock();
    const domicilioServiceMock = createDomicilioServiceMock();
    const pagoServiceMock = createPagoServiceMock({ data: { pagoId: 1 } });
    const pedidoServiceMock = createPedidoServiceMock();
    const modalServiceMock = createModalServiceMock();
    const toastrServiceMock = createToastrMock();
    const loggingServiceMock = createLoggingServiceMock() as unknown as jest.Mocked<LoggingService>;
    const routerMock = createRouterMock();

    await TestBed.configureTestingModule({
      // IMPORTANTE: Importamos el componente standalone en "imports"
      imports: [HttpClientTestingModule, RutaDomicilioComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: DomSanitizer, useValue: sanitizerMock },
        { provide: DomicilioService, useValue: domicilioServiceMock },
        { provide: PagoService, useValue: pagoServiceMock },
        { provide: PedidoService, useValue: pedidoServiceMock },
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
    jest.spyOn(console, 'error').mockImplementation();
    component.marcarFinalizado();
    expect(console.error).toHaveBeenCalledWith('Error al marcar finalizado', errorResponse);
  });

  it('should log error when domicilioId is missing in marcarFinalizado', () => {
    component.domicilioId = 0;
    jest.spyOn(console, 'error').mockImplementation();
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

      expect(domicilioService.updateDomicilio).toHaveBeenCalledWith(1, { updatedBy: 'Sistema' });
      expect(toastrService.success).toHaveBeenCalledWith('Domicilio marcado como pagado');
      expect(modalService.closeModal).toHaveBeenCalled();
    });

    it('should log error when no payment method is selected', () => {
      modalService.getModalData.mockReturnValue({
        select: { selected: null },
      });
      jest.spyOn(console, 'error').mockImplementation();
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

    it('should assign pago when createPago returns pagoId and show success', () => {
      // Prepara estado
      component.domicilioId = 1;
      (component as any).pedidoId = 55 as any;
      // Mock modal
      modalService.getModalData.mockReturnValue({ select: { selected: 'NEQUI' } });
      // Mock updateDomicilio para no fallar
      domicilioService.updateDomicilio.mockReturnValue(of({} as any));

      component.marcarPago();
      const config = modalService.openModal.mock.calls[0][0];
      config.buttons[0].action();

      expect(toastrService.success).toHaveBeenCalledWith('Domicilio marcado como pagado');
    });

    it('should not assignPago when createPago returns without pagoId', () => {
      // Fuerza createPago sin pagoId
      const pago = TestBed.inject(PagoService) as any;
      pago.createPago.mockReturnValueOnce(of({ data: {} }));

      component.domicilioId = 1;
      (component as any).pedidoId = 99 as any;
      modalService.getModalData.mockReturnValue({ select: { selected: 'EFECTIVO' } });
      domicilioService.updateDomicilio.mockReturnValue(of({} as any));

      const pedidoService = TestBed.inject(PedidoService) as any;
      component.marcarPago();
      const config = modalService.openModal.mock.calls[0][0];
      config.buttons[0].action();

      expect(pedidoService.assignPago).not.toHaveBeenCalled();
    });

    it('should log error when createPago observable errors', () => {
      const pago = TestBed.inject(PagoService) as any;
      pago.createPago.mockReturnValueOnce(throwError(() => new Error('create fail')));

      component.domicilioId = 1;
      modalService.getModalData.mockReturnValue({ select: { selected: 'DAVIPLATA' } });
      domicilioService.updateDomicilio.mockReturnValue(of({} as any));
      const logSpy = jest.spyOn(loggingService, 'log');

      component.marcarPago();
      const config = modalService.openModal.mock.calls[0][0];
      config.buttons[0].action();

      expect(logSpy).toHaveBeenCalled();
    });

    it('should catch sync error from createPago and log it', () => {
      const pago = TestBed.inject(PagoService) as any;
      pago.createPago.mockImplementationOnce(() => {
        throw new Error('sync');
      });

      component.domicilioId = 1;
      modalService.getModalData.mockReturnValue({ select: { selected: 'NEQUI' } });
      domicilioService.updateDomicilio.mockReturnValue(of({} as any));
      const logSpy = jest.spyOn(loggingService, 'log');

      component.marcarPago();
      const config = modalService.openModal.mock.calls[0][0];
      config.buttons[0].action();

      expect(logSpy).toHaveBeenCalled();
    });
  });

  it('should log error when domicilioId is missing in marcarPago', () => {
    component.domicilioId = 0;
    jest.spyOn(console, 'error').mockImplementation();
    component.marcarPago();
    expect(console.error).toHaveBeenCalledWith('No se encontró el ID del domicilio.');
  });

  it('should navigate to "/trabajador/domicilios/tomar" when volver is called', () => {
    component.volver();
    expect(router.navigate).toHaveBeenCalledWith(['/trabajador/domicilios/tomar']);
  });

  describe('parsers and mappings', () => {
    it('parseMetodoYObservaciones debe extraer metodo y observaciones (con acentos)', () => {
      const res = (component as any).parseMetodoYObservaciones(
        'Método pago: Daviplata - Observaciones: Test',
      );
      expect(res.metodo).toBe('Daviplata');
      expect(res.observaciones).toBe('Test');
    });

    it('parseMetodoYObservaciones acepta "Metodo" sin acento', () => {
      const res = (component as any).parseMetodoYObservaciones('Metodo pago: NEQUI');
      expect(res.metodo).toBe('NEQUI');
      expect(res.observaciones).toBe('');
    });

    it('parseMetodoYObservaciones solo observaciones', () => {
      const res = (component as any).parseMetodoYObservaciones(
        'Observaciones: Entregar en portería',
      );
      expect(res.metodo).toBe('');
      expect(res.observaciones).toContain('portería');
    });

    it('parseMetodoYObservaciones deja cadena cuando no encaja', () => {
      const s = 'Texto libre';
      const res = (component as any).parseMetodoYObservaciones(s);
      expect(res.metodo).toBe('');
      expect(res.observaciones).toBe(s);
    });

    it('obtenerMetodoPagoDefault normaliza variantes y mapea', () => {
      (component as any).metodoPagoTexto = 'Daví plata';
      expect((component as any).obtenerMetodoPagoDefault()).toBe('DAVIPLATA');
      (component as any).metodoPagoTexto = 'cash';
      expect((component as any).obtenerMetodoPagoDefault()).toBe('EFECTIVO');
      (component as any).metodoPagoTexto = 'desconocido';
      expect((component as any).obtenerMetodoPagoDefault()).toBeNull();
    });

    it('normaliza productos y total cuando vienen como string JSON/array mixto', () => {
      const mockResponse = {
        data: {
          pedido: {
            productos: '[{"NOMBRE":"A","CANTIDAD":"2","PRECIO_UNITARIO":"5","SUBTOTAL":"10"}]',
            total: undefined,
            pedidoId: 3,
          },
          cliente: { nombre: 'N', apellido: 'A' },
        },
      } as any;
      domicilioService.getDomicilioById.mockReturnValue(of(mockResponse));
      component.domicilioId = 123;
      component.ngOnInit();
      expect(component.productos.length).toBeGreaterThan(0);
      expect(component.totalPedido).toBeGreaterThanOrEqual(10);
    });

    it('usa totalRaw cuando viene informado en la respuesta del pedido', () => {
      const mockResponse = {
        data: {
          pedido: {
            productos: '[]',
            total: 777,
            pedidoId: 4,
          },
          cliente: { nombre: 'N', apellido: 'A' },
        },
      } as any;
      domicilioService.getDomicilioById.mockReturnValue(of(mockResponse));
      component.domicilioId = 999;
      component.ngOnInit();
      expect(component.totalPedido).toBe(777);
    });

    it('devolverMetodoPago retorna ids correctos', () => {
      expect(component.devolverMetodoPago('NEQUI')).toBe(metodoPago.Nequi.metodoPagoId);
      expect(component.devolverMetodoPago('DAVIPLATA')).toBe(metodoPago.Daviplata.metodoPagoId);
      expect(component.devolverMetodoPago('EFECTIVO')).toBe(metodoPago.Efectivo.metodoPagoId);
      expect(component.devolverMetodoPago('X')).toBe(0);
    });

    it('retorna temprano si response.data es null en getDomicilioById', () => {
      domicilioService.getDomicilioById.mockReturnValue(of({ data: null } as any));
      const logSpy = jest.spyOn(loggingService, 'log');
      jest.clearAllMocks();
      component.ngOnInit();
      expect(component.productos).toEqual([]);
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('normaliza claves alternativas como PRECIO y cliente indefinido', () => {
      const mockResponse = {
        data: {
          pedido: {
            productos: '[{"nombre":"X","cantidad":"1","PRECIO":"15"}]',
            total: undefined,
            pedidoId: 7,
          },
          cliente: undefined,
        },
      } as any;
      domicilioService.getDomicilioById.mockReturnValue(of(mockResponse));
      component.domicilioId = 321;
      component.ngOnInit();
      expect(component.nombreCliente).toBe('');
      expect(component.productos[0].precioUnitario).toBe(15);
    });

    it('construye nombreCliente sin nulos cuando faltan nombre/apellido', () => {
      const mockResponse = {
        data: {
          pedido: { productos: '[]', total: 0, pedidoId: 1 },
          cliente: { nombre: undefined, apellido: undefined },
        },
      } as any;
      domicilioService.getDomicilioById.mockReturnValue(of(mockResponse));
      component.domicilioId = 1;
      component.ngOnInit();
      expect(component.nombreCliente).toBe('');
    });

    it('mapea productoId alternativo y precioUnitario alternativo', () => {
      const mockResponse = {
        data: {
          pedido: {
            productos: JSON.stringify([
              { nombre: 'A', cantidad: '1', precioUnitario: '7', productoId: 123 },
            ]),
            total: undefined,
            pedidoId: 2,
          },
          cliente: { nombre: 'N', apellido: 'A' },
        },
      } as any;
      domicilioService.getDomicilioById.mockReturnValue(of(mockResponse));
      component.domicilioId = 2;
      component.ngOnInit();
      expect(component.productos[0].precioUnitario).toBe(7);
      expect(component.productos[0].productoId).toBe(123);
    });

    it('mapea PK_ID_PRODUCTO y PRECIO_UNITARIO correctamente', () => {
      const mockResponse = {
        data: {
          pedido: {
            productos: JSON.stringify([
              { NOMBRE: 'B', CANTIDAD: '2', PRECIO_UNITARIO: '12', PK_ID_PRODUCTO: 456 },
            ]),
            total: undefined,
            pedidoId: 3,
          },
          cliente: { nombre: 'N', apellido: 'A' },
        },
      } as any;
      domicilioService.getDomicilioById.mockReturnValue(of(mockResponse));
      component.domicilioId = 3;
      component.ngOnInit();
      expect(component.productos[0].precioUnitario).toBe(12);
      expect(component.productos[0].productoId).toBe(456);
    });

    it('usa arreglo vacío si productos es undefined', () => {
      const mockResponse = {
        data: {
          pedido: { productos: undefined, total: undefined, pedidoId: 10 },
          cliente: { nombre: 'N', apellido: 'A' },
        },
      } as any;
      domicilioService.getDomicilioById.mockReturnValue(of(mockResponse));
      component.domicilioId = 10;
      component.ngOnInit();
      expect(component.productos).toEqual([]);
    });
  });

  it('debe loguear error si assignPago falla tras crear pago', () => {
    // Arrange
    component.domicilioId = 1;
    (component as any).pedidoId = 77 as any;
    modalService.getModalData.mockReturnValue({ select: { selected: 'NEQUI' } });
    const pago = TestBed.inject(PagoService) as any;
    pago.createPago.mockReturnValueOnce(of({ data: { pagoId: 999 } }));
    const pedido = TestBed.inject(PedidoService) as any;
    pedido.assignPago.mockReturnValueOnce(throwError(() => new Error('assign fail')));
    domicilioService.updateDomicilio.mockReturnValue(of({} as any));

    const logSpy = jest.spyOn(loggingService, 'log');

    // Act
    component.marcarPago();
    const config = modalService.openModal.mock.calls[0][0];
    config.buttons[0].action();

    // Assert
    expect(logSpy).toHaveBeenCalled();
  });
});

describe('RutaDomicilioComponent with default params', () => {
  let component: RutaDomicilioComponent;
  let fixture: ComponentFixture<RutaDomicilioComponent>;

  beforeEach(async () => {
    const activatedRouteMock = {
      queryParams: of({ direccion: '' }),
    };

    const sanitizerMock = createDomSanitizerMock();

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RutaDomicilioComponent],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: DomSanitizer, useValue: sanitizerMock },
        { provide: DomicilioService, useValue: createDomicilioServiceMock() },
        { provide: ModalService, useValue: createModalServiceMock() },
        { provide: ToastrService, useValue: createToastrMock() },
        { provide: Router, useValue: createRouterMock() },
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

  it('shouldGenerateMaps returns true when direccion param is undefined (defaults applied)', () => {
    expect((component as any).shouldGenerateMaps(undefined, component.direccionCliente)).toBe(true);
  });

  it('shouldGenerateMaps returns false only if direccionFinal is empty string with param present', () => {
    expect((component as any).shouldGenerateMaps('', '')).toBe(false);
    expect((component as any).shouldGenerateMaps('', 'x')).toBe(true);
  });

  it('should still generate route when direccionCliente param is empty (uses default)', () => {
    component.direccionCliente = '' as any;
    const spyRuta = jest.spyOn(component, 'generarRuta');
    const spyUrl = jest.spyOn(component, 'generarUrlGoogleMaps');
    component.ngOnInit();
    expect(spyRuta).toHaveBeenCalled();
    expect(spyUrl).toHaveBeenCalled();
  });

  it('should not generate maps when shouldGenerateMaps returns false (branch else)', () => {
    const spyRuta = jest.spyOn(component, 'generarRuta');
    const spyUrl = jest.spyOn(component, 'generarUrlGoogleMaps');
    // Fuerza la rama else sin cambiar la lógica interna
    const spyShould = jest
      .spyOn<any, any>(component as any, 'shouldGenerateMaps')
      .mockReturnValue(false);
    // Limpiar contadores por la llamada previa en el beforeEach
    spyRuta.mockClear();
    spyUrl.mockClear();
    component.ngOnInit();
    expect(spyShould).toHaveBeenCalled();
    expect(spyRuta).not.toHaveBeenCalled();
    expect(spyUrl).not.toHaveBeenCalled();
    spyShould.mockRestore();
  });
});
