import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { DomicilioService } from '../../../../core/services/domicilio.service';
import { UserService } from '../../../../core/services/user.service';
import { estadoPago } from '../../../../shared/constants';
import {
  createDomicilioServiceMock,
  createUserServiceMock,
} from '../../../../shared/mocks/test-doubles';
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
            estadoPago: estadoPago.PAGADO,
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
            estadoPago: estadoPago.PAGADO,
            entregado: true,
            observaciones: '',
            createdBy: '',
          },
          {
            domicilioId: 3,
            fechaDomicilio: '2024-01-01',
            direccion: 'C',
            telefono: '3',
            estadoPago: estadoPago.PAGADO,
            entregado: false,
            observaciones: '',
            createdBy: '',
            trabajadorAsignado: 99,
          },
          {
            domicilioId: 4,
            fechaDomicilio: '2024-01-01',
            direccion: 'D',
            telefono: '4',
            estadoPago: estadoPago.PAGADO,
            entregado: false,
            observaciones: '',
            createdBy: '',
            trabajadorAsignado: 1,
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

  it('obtenerDomiciliosDisponibles should handle error response', () => {
    userService.getUserId.mockReturnValue(1);
    domicilioService.getDomicilios.mockReturnValue(of({ code: 400, message: 'error', data: [] }));

    createComponent();
    component.trabajadorId = 1;
    component.obtenerDomiciliosDisponibles();

    expect(component.mostrarMensaje).toBe(true);
    expect(component.mensaje).toBe('error');
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
      estadoPago: estadoPago.PAGADO,
      entregado: false,
      observaciones: '',
      createdBy: '',
    };

    domicilioService.asignarDomiciliario.mockReturnValue(
      of({ code: 200, message: 'ok', data: domicilio }),
    );

    createComponent();
    component.trabajadorId = 1;
    component.tomarDomicilio(domicilio);

    expect(domicilioService.asignarDomiciliario).toHaveBeenCalledWith(1, 1);
    expect(domicilio.trabajadorAsignado).toBe(1);
  });

  it('tomarDomicilio should return early when no trabajadorId', () => {
    const domicilio: Domicilio = {
      domicilioId: 1,
      fechaDomicilio: '2024-01-01',
      direccion: 'A',
      telefono: '1',
      estadoPago: estadoPago.PAGADO,
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
      estadoPago: estadoPago.PAGADO,
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
      estadoPago: estadoPago.PAGADO,
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
