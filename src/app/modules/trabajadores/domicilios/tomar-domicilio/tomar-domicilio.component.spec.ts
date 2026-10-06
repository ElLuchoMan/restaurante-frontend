import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';

import { DomicilioService } from '../../../../core/services/domicilio.service';
import { UserService } from '../../../../core/services/user.service';
import { estadoDomicilio } from '../../../../shared/constants';
import {
  createDomicilioServiceMock,
  createUserServiceMock,
} from '../../../../shared/mocks/test-doubles';
import { ApiResponse } from '../../../../shared/models/api-response.model';
import { Domicilio } from '../../../../shared/models/domicilio.model';
import { TomarDomicilioComponent } from './tomar-domicilio.component';

describe('TomarDomicilioComponent', () => {
  let component: TomarDomicilioComponent;
  let fixture: ComponentFixture<TomarDomicilioComponent>;
  let domicilioService: jest.Mocked<DomicilioService>;
  let userService: jest.Mocked<UserService>;
  let router: Router;

  beforeEach(async () => {
    domicilioService = createDomicilioServiceMock() as unknown as jest.Mocked<DomicilioService>;
    userService = createUserServiceMock() as unknown as jest.Mocked<UserService>;

    await TestBed.configureTestingModule({
      imports: [TomarDomicilioComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: DomicilioService, useValue: domicilioService },
        { provide: UserService, useValue: userService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  function createComponent() {
    fixture = TestBed.createComponent(TomarDomicilioComponent);
    component = fixture.componentInstance;
  }

  it('should create and load available domicilios on init', () => {
    userService.getUserId.mockReturnValue(1);
    domicilioService.getDomicilios.mockReturnValue(
      of({
        code: 200,
        message: 'ok',
        data: [
          {
            domicilioId: 1,
            fechaDomicilio: '2024-01-01',
            direccion: 'A',
            telefono: '1',
            estadoDomicilio: estadoDomicilio.PENDIENTE,
            entregado: false,
            observaciones: '',
            createdBy: '',
            trabajadorAsignado: undefined,
          },
          {
            domicilioId: 2,
            fechaDomicilio: '2024-01-01',
            direccion: 'B',
            telefono: '2',
            estadoDomicilio: estadoDomicilio.PENDIENTE,
            entregado: true,
            observaciones: '',
            createdBy: '',
          },
          {
            domicilioId: 3,
            fechaDomicilio: '2024-01-01',
            direccion: 'C',
            telefono: '3',
            estadoDomicilio: estadoDomicilio.PENDIENTE,
            entregado: false,
            observaciones: '',
            createdBy: '',
            trabajadorAsignado: { documentoTrabajador: 99 },
          },
          {
            domicilioId: 4,
            fechaDomicilio: '2024-01-01',
            direccion: 'D',
            telefono: '4',
            estadoDomicilio: estadoDomicilio.PENDIENTE,
            entregado: false,
            observaciones: '',
            createdBy: '',
            trabajadorAsignado: { documentoTrabajador: 1 },
          },
        ] as Domicilio[],
      }),
    );

    createComponent();
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.trabajadorId).toBe(1);
    expect(domicilioService.getDomicilios).toHaveBeenCalled();
    expect(component.domicilios.map((d) => d.domicilioId)).toEqual([1, 4]);
    expect(component.mostrarMensaje).toBe(false);
  });

  it('obtenerDomiciliosDisponibles should show the error message on HTTP error', () => {
    userService.getUserId.mockReturnValue(1);
    domicilioService.getDomicilios.mockReturnValue(
      throwError(() => ({ code: 400, message: 'error' })),
    );

    createComponent();
    component.trabajadorId = 1;
    component.obtenerDomiciliosDisponibles();

    expect(component.mostrarMensaje).toBe(true);
    expect(component.mensaje).toBe('error');
  });

  it('obtenerDomiciliosDisponibles should use a default message when the error has none', () => {
    domicilioService.getDomicilios.mockReturnValue(throwError(() => undefined));

    createComponent();
    component.trabajadorId = 1;
    component.obtenerDomiciliosDisponibles();

    expect(component.mensaje).toBe('No se pudieron cargar los domicilios');
  });

  it('obtenerDomiciliosDisponibles should leave the list empty when data is []', () => {
    domicilioService.getDomicilios.mockReturnValue(of({ code: 200, message: 'ok', data: [] }));

    createComponent();
    component.trabajadorId = 1;
    component.obtenerDomiciliosDisponibles();
    fixture.detectChanges();

    expect(component.domicilios).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('No se encontraron domicilios disponibles');
  });

  it('obtenerDomiciliosDisponibles should filter by today in Bogota time (YYYY-MM-DD)', () => {
    domicilioService.getDomicilios.mockReturnValue(of({ code: 200, message: 'ok', data: [] }));

    createComponent();
    component.trabajadorId = 1;
    component.obtenerDomiciliosDisponibles();

    expect(domicilioService.getDomicilios).toHaveBeenCalledWith({
      trabajador: 1,
      fecha: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
  });

  it('obtenerDomiciliosDisponibles should return early when no trabajadorId', () => {
    createComponent();
    component.trabajadorId = null;
    component.obtenerDomiciliosDisponibles();

    expect(domicilioService.getDomicilios).not.toHaveBeenCalled();
  });

  it('tomarDomicilio should assign trabajador', () => {
    const domicilio: Domicilio = {
      domicilioId: 1,
      fechaDomicilio: '2024-01-01',
      direccion: 'A',
      telefono: '1',
      estadoDomicilio: estadoDomicilio.PENDIENTE,
      entregado: false,
      observaciones: '',
      createdBy: '',
    };

    domicilioService.asignarDomiciliario.mockReturnValue(
      of({
        code: 200,
        message: 'ok',
        data: {
          ...domicilio,
          estadoDomicilio: estadoDomicilio.EN_CAMINO,
          trabajadorAsignado: { documentoTrabajador: 1 },
        },
      }),
    );

    createComponent();
    component.trabajadorId = 1;
    component.tomarDomicilio(domicilio);

    expect(domicilioService.asignarDomiciliario).toHaveBeenCalledWith(1, 1);
    expect(domicilio.trabajadorAsignado).toEqual({ documentoTrabajador: 1 });
    expect(domicilio.estadoDomicilio).toBe(estadoDomicilio.EN_CAMINO);
  });

  it('tomarDomicilio should show the message and reload the list when it fails (409)', () => {
    const domicilio = { domicilioId: 1 } as Domicilio;
    domicilioService.asignarDomiciliario.mockReturnValue(
      throwError(() => ({ code: 409, message: 'Ya asignado' })),
    );
    domicilioService.getDomicilios.mockReturnValue(of({ code: 200, message: 'ok', data: [] }));

    createComponent();
    component.trabajadorId = 1;
    component.tomarDomicilio(domicilio);

    expect(component.mostrarMensaje).toBe(true);
    expect(component.mensaje).toBe('Ya asignado');
    expect(domicilioService.getDomicilios).toHaveBeenCalled();
    expect(domicilio.trabajadorAsignado).toBeUndefined();
  });

  it('tomarDomicilio should use a default message when the failure has none', () => {
    domicilioService.asignarDomiciliario.mockReturnValue(throwError(() => undefined));
    domicilioService.getDomicilios.mockReturnValue(of({ code: 200, message: 'ok', data: [] }));

    createComponent();
    component.trabajadorId = 1;
    component.tomarDomicilio({ domicilioId: 1 } as Domicilio);

    expect(component.mensaje).toBe('No se pudo tomar el domicilio');
  });

  it('tomarDomicilio should keep the domicilio untouched when the response has no changes', () => {
    const domicilio: Domicilio = {
      domicilioId: 1,
      fechaDomicilio: '2024-01-01',
      direccion: 'A',
      telefono: '1',
      estadoDomicilio: estadoDomicilio.PENDIENTE,
      entregado: false,
      observaciones: '',
      createdBy: '',
    };
    const response$ = new Subject<ApiResponse<Domicilio>>();
    domicilioService.asignarDomiciliario.mockReturnValue(response$);

    createComponent();
    component.trabajadorId = 1;
    component.tomarDomicilio(domicilio);
    component.trabajadorId = null;
    response$.next({ code: 200, message: 'ok', data: domicilio });

    expect(domicilio.trabajadorAsignado).toBeUndefined();
  });

  it('tomarDomicilio should return early when no trabajadorId', () => {
    const domicilio: Domicilio = {
      domicilioId: 1,
      fechaDomicilio: '2024-01-01',
      direccion: 'A',
      telefono: '1',
      estadoDomicilio: estadoDomicilio.PENDIENTE,
      entregado: false,
      observaciones: '',
      createdBy: '',
    };

    createComponent();
    component.trabajadorId = null;
    component.tomarDomicilio(domicilio);

    expect(domicilioService.asignarDomiciliario).not.toHaveBeenCalled();
  });

  it('irARuta should navigate with query params', () => {
    const domicilio: Domicilio = {
      domicilioId: 5,
      fechaDomicilio: '2024-01-01',
      direccion: 'Street',
      telefono: '123',
      estadoDomicilio: estadoDomicilio.PENDIENTE,
      entregado: false,
      observaciones: 'note',
      createdBy: '',
    };

    createComponent();
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.irARuta(domicilio);
    expect(navigateSpy).toHaveBeenCalledWith(['/trabajador', 'domicilios', 'ruta-domicilio'], {
      queryParams: {
        direccion: 'Street',
        telefono: '123',
        observaciones: 'note',
        id: 5,
      },
    });

    navigateSpy.mockClear();

    const sinObs: Domicilio = {
      domicilioId: 6,
      fechaDomicilio: '2024-01-01',
      direccion: 'A',
      telefono: '000',
      estadoDomicilio: estadoDomicilio.PENDIENTE,
      entregado: false,
      observaciones: '',
      createdBy: '',
    };

    component.irARuta(sinObs);
    expect(navigateSpy).toHaveBeenCalledWith(['/trabajador', 'domicilios', 'ruta-domicilio'], {
      queryParams: {
        direccion: 'A',
        telefono: '000',
        observaciones: null,
        id: 6,
      },
    });
  });
});
