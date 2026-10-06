import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { LoggingService, LogLevel } from '../../../../core/services/logging.service';
import { ReservaService } from '../../../../core/services/reserva.service';
import { estadoReserva } from '../../../../shared/constants';
import { mockReserva, mockReservasDelDiaResponse } from '../../../../shared/mocks/reserva.mocks';
import {
  createLoggingServiceMock,
  createReservaServiceMock,
  createToastrMock,
} from '../../../../shared/mocks/test-doubles';
import { ReservaBase } from '../../../../shared/models/reserva.model';
import { ReservasDelDiaComponent } from './reservas-del-dia.component';

describe('ReservasDelDiaComponent', () => {
  let component: ReservasDelDiaComponent;
  let fixture: ComponentFixture<ReservasDelDiaComponent>;
  let reservaService: jest.Mocked<ReservaService>;
  let toastr: jest.Mocked<ToastrService>;
  let logger: jest.Mocked<LoggingService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasDelDiaComponent, CommonModule, HttpClientTestingModule],
      providers: [
        { provide: ReservaService, useValue: createReservaServiceMock() },
        { provide: ToastrService, useValue: createToastrMock() },
        { provide: LoggingService, useValue: createLoggingServiceMock() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservasDelDiaComponent);
    component = fixture.componentInstance;
    reservaService = TestBed.inject(ReservaService) as jest.Mocked<ReservaService>;
    toastr = TestBed.inject(ToastrService) as jest.Mocked<ToastrService>;
    logger = TestBed.inject(LoggingService) as jest.Mocked<LoggingService>;
  });

  describe('consultarReservasDelDia', () => {
    it('consulta la fecha de hoy (YYYY-MM-DD), ordena por hora y fija fechaHoy en DD-MM-YYYY', () => {
      const desordenadas = [...mockReservasDelDiaResponse.data].reverse();
      reservaService.getReservaByParameter.mockReturnValue(
        of({ ...mockReservasDelDiaResponse, data: desordenadas }),
      );

      fixture.detectChanges(); // ngOnInit

      const [contacto, fecha] = reservaService.getReservaByParameter.mock.calls[0];
      expect(contacto).toBeUndefined();
      expect(fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(component.fechaHoy).toBe(fecha!.split('-').reverse().join('-'));
      // 19:41 antes que 21:18 (la entrada llega invertida: 9, 8)
      expect(component.reservas.map((r) => r.reservaId)).toEqual([9, 8]);
      // no muta el arreglo recibido
      expect(desordenadas.map((r) => r.reservaId)).toEqual([9, 8]);
    });

    it('sin reservas (data []) deja la lista vacía y muestra el aviso', () => {
      reservaService.getReservaByParameter.mockReturnValue(
        of({ code: 200, message: 'Sin reservas', data: [] }),
      );
      fixture.detectChanges();
      expect(component.reservas).toEqual([]);
      expect(fixture.nativeElement.textContent).toContain('No hay reservas');
    });

    it('renderiza nombre y teléfono desde el contacto embebido en cada reserva', () => {
      reservaService.getReservaByParameter.mockReturnValue(of(mockReservasDelDiaResponse));
      fixture.detectChanges();
      const texto: string = fixture.nativeElement.textContent;
      expect(texto).toContain('Carlos Perez');
      expect(texto).toContain('3216549870');
      expect(texto).toContain('Edwin Torres');
    });

    it('muestra un error si la consulta falla', () => {
      reservaService.getReservaByParameter.mockReturnValue(throwError(() => new Error('x')));
      fixture.detectChanges();
      expect(toastr.error).toHaveBeenCalledWith(
        'Ocurrió un error al consultar las reservas del día',
        'Error',
      );
    });
  });

  describe('cambios de estado', () => {
    const actualizada: ReservaBase = { ...mockReserva, estadoReserva: estadoReserva.CONFIRMADA };

    beforeEach(() => {
      reservaService.getReservaByParameter.mockReturnValue(of(mockReservasDelDiaResponse));
      fixture.detectChanges();
      reservaService.actualizarReserva.mockReturnValue(
        of({ code: 200, message: 'ok', data: actualizada }),
      );
    });

    it('confirmar envía solo el estado y reemplaza la reserva con la respuesta', async () => {
      const original = component.reservas.find((r) => r.reservaId === 8)!;
      component.reservas = [original, mockReserva];

      component.confirmarReserva(mockReserva);
      await fixture.whenStable();

      expect(reservaService.actualizarReserva).toHaveBeenCalledWith(1, {
        estadoReserva: estadoReserva.CONFIRMADA,
      });
      expect(toastr.success).toHaveBeenCalledWith(
        'Reserva marcada como CONFIRMADA',
        'Actualización Exitosa',
      );
      expect(component.reservas).toEqual([original, actualizada]);
    });

    it('cancelar y cumplir usan el estado correspondiente', async () => {
      component.cancelarReserva(mockReserva);
      component.cumplirReserva(mockReserva);
      await fixture.whenStable();
      expect(reservaService.actualizarReserva).toHaveBeenNthCalledWith(1, 1, {
        estadoReserva: estadoReserva.CANCELADA,
      });
      expect(reservaService.actualizarReserva).toHaveBeenNthCalledWith(2, 1, {
        estadoReserva: estadoReserva.CUMPLIDA,
      });
    });

    it('rechaza un id de reserva no válido', () => {
      component.confirmarReserva({ ...mockReserva, reservaId: NaN });
      component.confirmarReserva({ ...mockReserva, reservaId: 0 });
      expect(toastr.error).toHaveBeenCalledWith('Error: ID de reserva no válido', 'Error');
      expect(reservaService.actualizarReserva).not.toHaveBeenCalled();
    });

    it('registra el error y avisa si el backend rechaza el cambio', () => {
      const error = { code: 404, message: 'Reserva no encontrada' };
      reservaService.actualizarReserva.mockReturnValue(throwError(() => error));
      component.confirmarReserva(mockReserva);
      expect(logger.log).toHaveBeenCalledWith(LogLevel.ERROR, 'Error:', error);
      expect(toastr.error).toHaveBeenCalledWith(
        'Ocurrió un error al actualizar la reserva',
        'Error',
      );
    });
  });
});
