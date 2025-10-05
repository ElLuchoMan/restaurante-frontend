import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { LoggingService, LogLevel } from '../../../../core/services/logging.service';
import { ReservaContactoService } from '../../../../core/services/reserva-contacto.service';
import { ReservaNotificationsService } from '../../../../core/services/reserva-notifications.service';
import { ReservaService } from '../../../../core/services/reserva.service';
import { estadoReserva } from '../../../../shared/constants';
import {
  mockReserva,
  mockReservaResponse,
  mockReservasDelDiaResponse,
} from '../../../../shared/mocks/reserva.mocks';
import {
  createLoggingServiceMock,
  createReservaContactoServiceMock,
  createReservaNotificationsServiceMock,
  createReservaServiceMock,
  createToastrMock,
} from '../../../../shared/mocks/test-doubles';
import { Reserva } from '../../../../shared/models/reserva.model';
import { ReservasDelDiaComponent } from './reservas-del-dia.component';

describe('ReservasDelDiaComponent', () => {
  let component: ReservasDelDiaComponent;
  let fixture: ComponentFixture<ReservasDelDiaComponent>;
  let reservaService: jest.Mocked<ReservaService>;
  let reservaContactoService: jest.Mocked<ReservaContactoService>;
  let reservaNotificationsService: jest.Mocked<ReservaNotificationsService>;
  let toastr: jest.Mocked<ToastrService>;
  let loggingService: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    const reservaServiceMock = createReservaServiceMock() as jest.Mocked<ReservaService>;
    const reservaContactoServiceMock =
      createReservaContactoServiceMock() as jest.Mocked<ReservaContactoService>;
    const reservaNotificationsServiceMock =
      createReservaNotificationsServiceMock() as jest.Mocked<ReservaNotificationsService>;
    const toastrMock = createToastrMock() as jest.Mocked<ToastrService>;
    const loggingServiceMock = createLoggingServiceMock() as jest.Mocked<LoggingService>;

    await TestBed.configureTestingModule({
      imports: [ReservasDelDiaComponent, CommonModule, HttpClientTestingModule],
      providers: [
        { provide: ReservaService, useValue: reservaServiceMock },
        { provide: ReservaContactoService, useValue: reservaContactoServiceMock },
        { provide: ReservaNotificationsService, useValue: reservaNotificationsServiceMock },
        { provide: ToastrService, useValue: toastrMock },
        { provide: LoggingService, useValue: loggingServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservasDelDiaComponent);
    component = fixture.componentInstance;
    reservaService = TestBed.inject(ReservaService) as jest.Mocked<ReservaService>;
    reservaContactoService = TestBed.inject(
      ReservaContactoService,
    ) as jest.Mocked<ReservaContactoService>;
    reservaNotificationsService = TestBed.inject(
      ReservaNotificationsService,
    ) as jest.Mocked<ReservaNotificationsService>;
    toastr = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
    loggingService = TestBed.inject(LoggingService) as jest.Mocked<LoggingService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('consultarReservasDelDia', () => {
    it('should call consultarReservasDelDia in ngOnInit', () => {
      const spy = jest.spyOn(component, 'consultarReservasDelDia');
      reservaService.getReservaByParameter.mockReturnValue(of(mockReservasDelDiaResponse));
      component.ngOnInit();
      expect(spy).toHaveBeenCalled();
    });

    it('should fetch reservas, sort them by horaReserva, and set fechaHoy in DD-MM-YYYY format', () => {
      reservaService.getReservaByParameter.mockReturnValue(of(mockReservasDelDiaResponse));
      component.consultarReservasDelDia();

      expect(component.reservas.length).toBe(mockReservasDelDiaResponse.data.length);
      expect(component.fechaHoy).toMatch(/^\d{2}-\d{2}-\d{4}$/);
      if (component.reservas.length > 1) {
        const primeraHora = new Date(`1970-01-01T${component.reservas[0].horaReserva}`);
        const segundaHora = new Date(`1970-01-01T${component.reservas[1].horaReserva}`);
        expect(primeraHora.getTime()).toBeLessThanOrEqual(segundaHora.getTime());
      }
    });

    it('should call toastr.error if getReservaByParameter fails', () => {
      reservaService.getReservaByParameter.mockReturnValue(
        throwError(() => new Error('Error fetching reservas')),
      );
      component.consultarReservasDelDia();
      expect(toastr.error).toHaveBeenCalledWith(
        'Ocurrió un error al consultar las reservas del día',
        'Error',
      );
    });
  });

  describe('actualizarReserva and state update methods', () => {
    let reserva: Reserva;
    beforeEach(() => {
      reserva = { ...mockReservaResponse.data, reservaId: 1 };
      reserva.fechaReserva = '06-02-2025';
    });

    it('should update reservation and show success for confirmarReserva', () => {
      reservaService.actualizarReserva.mockReturnValue(
        of({ code: 200, message: 'Actualización exitosa', data: reserva }),
      );

      component.confirmarReserva(reserva);

      expect(reservaService.actualizarReserva).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ estadoReserva: 'CONFIRMADA', fechaReserva: '2025-02-06' }),
      );
      expect(toastr.success).toHaveBeenCalledWith(
        'Reserva marcada como CONFIRMADA',
        'Actualización Exitosa',
      );
    });

    it('should update reservation and show success for cancelarReserva', () => {
      reservaService.actualizarReserva.mockReturnValue(
        of({ code: 200, message: 'Actualización exitosa', data: reserva }),
      );

      component.cancelarReserva(reserva);

      expect(reservaService.actualizarReserva).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ estadoReserva: 'CANCELADA', fechaReserva: '2025-02-06' }),
      );
      expect(toastr.success).toHaveBeenCalledWith(
        'Reserva marcada como CANCELADA',
        'Actualización Exitosa',
      );
    });

    it('should update reservation and show success for cumplirReserva', () => {
      reservaService.actualizarReserva.mockReturnValue(
        of({ code: 200, message: 'Actualización exitosa', data: reserva }),
      );

      component.cumplirReserva(reserva);

      expect(reservaService.actualizarReserva).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ estadoReserva: 'CUMPLIDA', fechaReserva: '2025-02-06' }),
      );
      expect(toastr.success).toHaveBeenCalledWith(
        'Reserva marcada como CUMPLIDA',
        'Actualización Exitosa',
      );
    });

    it('should show error if reservaId is invalid in actualizarReserva', () => {
      const invalidReserva = { ...reserva, reservaId: NaN };

      component['actualizarReserva'](invalidReserva);

      expect(toastr.error).toHaveBeenCalledWith('Error: ID de reserva no válido', 'Error');
      expect(reservaService.actualizarReserva).not.toHaveBeenCalled();
    });

    it('should show error when actualizarReserva fails', () => {
      const errorResponse = new Error('Update failed');
      reservaService.actualizarReserva.mockReturnValue(throwError(() => errorResponse));
      component['actualizarReserva'](reserva);

      expect(loggingService.log).toHaveBeenCalledWith(LogLevel.ERROR, 'Error:', errorResponse);
      expect(toastr.error).toHaveBeenCalledWith(
        'Ocurrió un error al actualizar la reserva',
        'Error',
      );
    });

    it('should update reserva in local list after successful update', async () => {
      const reservaInicial = { ...mockReserva, estadoReserva: estadoReserva.PENDIENTE };
      component.reservas = [reservaInicial];

      reservaService.actualizarReserva.mockReturnValue(
        of({ code: 200, message: 'Actualización exitosa', data: reserva }),
      );

      component.confirmarReserva(reservaInicial);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(component.reservas[0].estadoReserva).toBe(estadoReserva.CONFIRMADA);
    });

    it('should handle null documentoCliente when notifying estado cambio', async () => {
      const reservaSinDoc = { ...reserva, documentoCliente: null };
      reservaService.actualizarReserva.mockReturnValue(
        of({ code: 200, message: 'Actualización exitosa', data: reservaSinDoc }),
      );

      component.confirmarReserva(reservaSinDoc);

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(reservaNotificationsService.notifyEstadoCambio).toHaveBeenCalled();
    });
  });

  describe('Data normalization and enrichment', () => {
    it('should normalize data from contactoId object', () => {
      const mockWithContactoObject = {
        code: 200,
        message: 'OK',
        data: [
          {
            ...mockReserva,
            nombreCompleto: '',
            telefono: '',
            documentoCliente: null,
            contactoId: {
              contactoId: 1,
              nombreCompleto: 'Nombre Desde Contacto',
              telefono: '3001234567',
              documentoCliente: 987654321,
            },
          },
        ],
      };

      reservaService.getReservaByParameter.mockReturnValue(of(mockWithContactoObject));
      component.consultarReservasDelDia();

      expect(component.reservas[0].nombreCompleto).toBe('Nombre Desde Contacto');
      expect(component.reservas[0].telefono).toBe('3001234567');
      expect(component.reservas[0].documentoCliente).toBe(987654321);
    });

    it('should prefer top-level data over contactoId object data', () => {
      const mockWithBothData = {
        code: 200,
        message: 'OK',
        data: [
          {
            ...mockReserva,
            nombreCompleto: 'Nombre Top Level',
            telefono: '3119876543',
            documentoCliente: 123456789,
            contactoId: {
              contactoId: 1,
              nombreCompleto: 'Nombre Desde Contacto',
              telefono: '3001234567',
              documentoCliente: 987654321,
            },
          },
        ],
      };

      reservaService.getReservaByParameter.mockReturnValue(of(mockWithBothData));
      component.consultarReservasDelDia();

      expect(component.reservas[0].nombreCompleto).toBe('Nombre Top Level');
      expect(component.reservas[0].telefono).toBe('3119876543');
      expect(component.reservas[0].documentoCliente).toBe(123456789);
    });

    it('should handle empty strings in top-level data and use contactoId data', () => {
      const mockWithEmptyStrings = {
        code: 200,
        message: 'OK',
        data: [
          {
            ...mockReserva,
            nombreCompleto: '   ',
            telefono: '   ',
            contactoId: {
              contactoId: 1,
              nombreCompleto: 'Nombre Contacto',
              telefono: '3001234567',
            },
          },
        ],
      };

      reservaService.getReservaByParameter.mockReturnValue(of(mockWithEmptyStrings));
      component.consultarReservasDelDia();

      expect(component.reservas[0].nombreCompleto).toBe('Nombre Contacto');
      expect(component.reservas[0].telefono).toBe('3001234567');
    });

    it('should handle null response data gracefully', () => {
      reservaService.getReservaByParameter.mockReturnValue(
        of({ code: 200, message: 'OK', data: null } as any),
      );

      component.consultarReservasDelDia();

      expect(component.reservas).toEqual([]);
    });

    it('should enrich reservas with missing contact info from API', async () => {
      const mockReservaIncompleta = {
        ...mockReserva,
        nombreCompleto: '',
        telefono: '',
        contactoId: 1,
      };

      const mockContactoInfo = {
        code: 200,
        message: 'Contacto obtenido',
        data: {
          contactoId: 1,
          nombreCompleto: 'Juan Pérez Enriquecido',
          telefono: '3009876543',
          documentoCliente: 1122334455,
        },
      };

      reservaService.getReservaByParameter.mockReturnValue(
        of({ code: 200, message: 'OK', data: [mockReservaIncompleta] }),
      );
      reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

      component.consultarReservasDelDia();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(reservaContactoService.getById).toHaveBeenCalledWith(1);
      expect(component.reservas[0].nombreCompleto).toBe('Juan Pérez Enriquecido');
      expect(component.reservas[0].telefono).toBe('3009876543');
    });

    it('should handle error when enriching contact info', async () => {
      const mockReservaIncompleta = {
        ...mockReserva,
        nombreCompleto: '',
        telefono: '',
        contactoId: 1,
      };

      reservaService.getReservaByParameter.mockReturnValue(
        of({ code: 200, message: 'OK', data: [mockReservaIncompleta] }),
      );
      reservaContactoService.getById.mockReturnValue(throwError(() => new Error('API Error')));

      component.consultarReservasDelDia();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(component.reservas).toHaveLength(1);
    });

    it('should handle contactoId as object when enriching', async () => {
      const mockReservaConObjetoContacto = {
        ...mockReserva,
        nombreCompleto: '',
        telefono: '',
        contactoId: { contactoId: 2 },
      };

      const mockContactoInfo = {
        code: 200,
        message: 'Contacto obtenido',
        data: {
          contactoId: 2,
          nombreCompleto: 'Pedro López',
          telefono: '3112223333',
          documentoCliente: 9988776655,
        },
      };

      reservaService.getReservaByParameter.mockReturnValue(
        of({ code: 200, message: 'OK', data: [mockReservaConObjetoContacto] }),
      );
      reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

      component.consultarReservasDelDia();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(reservaContactoService.getById).toHaveBeenCalledWith(2);
      expect(component.reservas[0].nombreCompleto).toBe('Pedro López');
    });

    it('should not enrich when contactoId is null', async () => {
      const mockReservaSinContacto = {
        ...mockReserva,
        nombreCompleto: '',
        telefono: '',
        contactoId: null,
      };

      reservaService.getReservaByParameter.mockReturnValue(
        of({ code: 200, message: 'OK', data: [mockReservaSinContacto] }),
      );

      component.consultarReservasDelDia();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(reservaContactoService.getById).not.toHaveBeenCalled();
      expect(component.reservas).toHaveLength(1);
    });

    it('should preserve existing nombreCompleto when enriching', async () => {
      const mockReservaConNombre = {
        ...mockReserva,
        nombreCompleto: 'Nombre Existente',
        telefono: '',
        contactoId: 1,
      };

      const mockContactoInfo = {
        code: 200,
        message: 'Contacto obtenido',
        data: {
          contactoId: 1,
          nombreCompleto: 'Nombre API',
          telefono: '3001234567',
          documentoCliente: 1234567890,
        },
      };

      reservaService.getReservaByParameter.mockReturnValue(
        of({ code: 200, message: 'OK', data: [mockReservaConNombre] }),
      );
      reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

      component.consultarReservasDelDia();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(component.reservas[0].nombreCompleto).toBe('Nombre Existente');
    });

    it('should preserve existing telefono when enriching', async () => {
      const mockReservaConTelefono = {
        ...mockReserva,
        nombreCompleto: '',
        telefono: '3119998877',
        contactoId: 1,
      };

      const mockContactoInfo = {
        code: 200,
        message: 'Contacto obtenido',
        data: {
          contactoId: 1,
          nombreCompleto: 'Nombre API',
          telefono: '3001234567',
          documentoCliente: 1234567890,
        },
      };

      reservaService.getReservaByParameter.mockReturnValue(
        of({ code: 200, message: 'OK', data: [mockReservaConTelefono] }),
      );
      reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

      component.consultarReservasDelDia();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(component.reservas[0].telefono).toBe('3119998877');
    });

    it('should use documentoCliente from API when reserva value is null', async () => {
      const mockReservaIncompleta = {
        ...mockReserva,
        nombreCompleto: '',
        telefono: '',
        contactoId: 1,
        documentoCliente: null,
      };

      const mockContactoInfo = {
        code: 200,
        message: 'Contacto obtenido',
        data: {
          contactoId: 1,
          nombreCompleto: 'Nombre',
          telefono: '3001234567',
          documentoCliente: 555666777,
        },
      };

      reservaService.getReservaByParameter.mockReturnValue(
        of({ code: 200, message: 'OK', data: [mockReservaIncompleta] }),
      );
      reservaContactoService.getById.mockReturnValue(of(mockContactoInfo));

      component.consultarReservasDelDia();

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(component.reservas[0].documentoCliente).toBe(555666777);
    });

    it('should handle undefined documentoCliente from contactoId', () => {
      const mockWithUndefinedDoc = {
        code: 200,
        message: 'OK',
        data: [
          {
            ...mockReserva,
            documentoCliente: undefined,
            contactoId: {
              contactoId: 1,
              nombreCompleto: 'Nombre',
              telefono: '3001234567',
              documentoCliente: undefined,
            },
          },
        ],
      };

      reservaService.getReservaByParameter.mockReturnValue(of(mockWithUndefinedDoc));
      component.consultarReservasDelDia();

      expect(component.reservas[0].documentoCliente).toBeNull();
    });
  });
});
