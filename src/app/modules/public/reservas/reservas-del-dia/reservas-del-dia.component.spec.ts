import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { LoggingService, LogLevel } from '../../../../core/services/logging.service';
import { ReservaService } from '../../../../core/services/reserva.service';
import {
  mockReservaResponse,
  mockReservasDelDiaResponse,
} from '../../../../shared/mocks/reserva.mocks';
import { Reserva } from '../../../../shared/models/reserva.model';
import { ReservasDelDiaComponent } from './reservas-del-dia.component';

describe('ReservasDelDiaComponent', () => {
  let component: ReservasDelDiaComponent;
  let fixture: ComponentFixture<ReservasDelDiaComponent>;
  let reservaService: jest.Mocked<ReservaService>;
  let toastr: jest.Mocked<ToastrService>;
  let loggingService: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    const reservaServiceMock = {
      getReservaByParameter: jest.fn(),
      actualizarReserva: jest.fn(),
    } as unknown as jest.Mocked<ReservaService>;

    const toastrMock = {
      success: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<ToastrService>;

    const loggingServiceMock = {
      log: jest.fn(),
    } as unknown as jest.Mocked<LoggingService>;

    await TestBed.configureTestingModule({
      imports: [ReservasDelDiaComponent, CommonModule],
      providers: [
        { provide: ReservaService, useValue: reservaServiceMock },
        { provide: ToastrService, useValue: toastrMock },
        { provide: LoggingService, useValue: loggingServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservasDelDiaComponent);
    component = fixture.componentInstance;
    reservaService = TestBed.inject(ReservaService) as jest.Mocked<ReservaService>;
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

      const expectedReserva = {
        ...reserva,
        estadoReserva: 'CONFIRMADA',
        fechaReserva: '2025-02-06',
      };
      expect(reservaService.actualizarReserva).toHaveBeenCalledWith(1, expectedReserva);
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

      const expectedReserva = {
        ...reserva,
        estadoReserva: 'CANCELADA',
        fechaReserva: '2025-02-06',
      };
      expect(reservaService.actualizarReserva).toHaveBeenCalledWith(1, expectedReserva);
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

      const expectedReserva = { ...reserva, estadoReserva: 'CUMPLIDA', fechaReserva: '2025-02-06' };
      expect(reservaService.actualizarReserva).toHaveBeenCalledWith(1, expectedReserva);
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
  });
});
