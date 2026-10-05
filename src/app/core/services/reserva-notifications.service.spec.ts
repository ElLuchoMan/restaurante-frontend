import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { estadoReserva } from '../../shared/constants';
import { createPushServiceMock, createUserServiceMock } from '../../shared/mocks/test-doubles';
import { PushService } from './push.service';
import { ReservaNotificationsService } from './reserva-notifications.service';
import { UserService } from './user.service';

describe('ReservaNotificationsService', () => {
  let service: ReservaNotificationsService;
  let pushService: ReturnType<typeof createPushServiceMock>;
  let userService: ReturnType<typeof createUserServiceMock>;

  beforeEach(() => {
    pushService = createPushServiceMock();
    userService = createUserServiceMock();

    TestBed.configureTestingModule({
      providers: [
        ReservaNotificationsService,
        { provide: PushService, useValue: pushService },
        { provide: UserService, useValue: userService },
      ],
    });

    service = TestBed.inject(ReservaNotificationsService);

    // Mock console.log para evitar logs en tests
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('formatDateTime', () => {
    it('should format valid date and time', () => {
      const result = service['formatDateTime']('2024-03-15', '18:30:00');

      // Formato es-CO puede ser "15/3" o "15/03" dependiendo del navegador
      expect(result.fecha).toMatch(/\d{1,2}\/\d{1,2}/);
      expect(result.hora).toMatch(/\d{2}:\d{2}/);
    });

    it('interpreta fechas DD-MM-YYYY del backend igual que YYYY-MM-DD', () => {
      const delBackend = service['formatDateTime']('15-03-2024', '18:30:00');
      const iso = service['formatDateTime']('2024-03-15', '18:30:00');

      expect(delBackend).toEqual(iso);
      expect(delBackend.fecha).toMatch(/15\/0?3/);
    });

    it('should handle missing hora parameter', () => {
      const result = service['formatDateTime']('2024-03-15', undefined);

      // Formato es-CO puede ser "15/3" o "15/03" dependiendo del navegador
      expect(result.fecha).toMatch(/\d{1,2}\/\d{1,2}/);
      expect(result.hora).toMatch(/\d{2}:\d{2}/);
    });

    it('should handle missing fechaISO parameter', () => {
      const result = service['formatDateTime'](undefined, '18:30:00');

      // Formato es-CO puede variar dependiendo del navegador
      expect(result.fecha).toMatch(/\d{1,2}\/\d{1,2}/);
      expect(result.hora).toMatch(/\d{2}:\d{2}/);
    });

    it('should handle invalid date gracefully', () => {
      const result = service['formatDateTime']('invalid-date', 'invalid-time');

      expect(result.fecha).toBe('invalid-date');
      expect(result.hora).toBe('invalid-time');
    });

    it('should return empty strings when catch block is triggered with no parameters', () => {
      const result = service['formatDateTime'](undefined, undefined);

      // Cuando ambos son undefined, debe retornar fecha/hora actuales o strings vacíos
      expect(typeof result.fecha).toBe('string');
      expect(typeof result.hora).toBe('string');
    });
  });

  describe('buildEstadoMessage', () => {
    it('should build message for CONFIRMADA status', () => {
      const result = service['buildEstadoMessage'](
        estadoReserva.CONFIRMADA,
        '2024-03-15',
        '18:30:00',
      );

      expect(result.titulo).toBe('Reserva confirmada');
      expect(result.mensaje).toContain('confirmada');
      expect(result.mensaje).toContain('Te esperamos');
    });

    it('should build message for CANCELADA status', () => {
      const result = service['buildEstadoMessage'](
        estadoReserva.CANCELADA,
        '2024-03-15',
        '18:30:00',
      );

      expect(result.titulo).toBe('Reserva cancelada');
      expect(result.mensaje).toContain('fue cancelada');
      expect(result.mensaje).toContain('contáctanos');
    });

    it('should build message for CUMPLIDA status', () => {
      const result = service['buildEstadoMessage'](
        estadoReserva.CUMPLIDA,
        '2024-03-15',
        '18:30:00',
      );

      expect(result.titulo).toBe('¡Gracias por visitarnos!');
      expect(result.mensaje).toContain('opinión');
      expect(result.mensaje).toContain('30 segundos');
    });

    it('should build message for PENDIENTE status', () => {
      const result = service['buildEstadoMessage'](
        estadoReserva.PENDIENTE,
        '2024-03-15',
        '18:30:00',
      );

      expect(result.titulo).toBe('Recibimos tu solicitud');
      expect(result.mensaje).toContain('validando');
      expect(result.mensaje).toContain('contactaremos');
    });

    it('should build default message for unknown status', () => {
      const result = service['buildEstadoMessage'](
        'UNKNOWN_STATUS' as any,
        '2024-03-15',
        '18:30:00',
      );

      expect(result.titulo).toBe('Recibimos tu solicitud');
      expect(result.mensaje).toContain('validando');
    });

    it('should handle missing fecha and hora', () => {
      const result = service['buildEstadoMessage'](estadoReserva.CONFIRMADA);

      expect(result.titulo).toBe('Reserva confirmada');
      expect(result.mensaje).toBeTruthy();
    });
  });

  describe('notifyEstadoCambio', () => {
    const mockReserva = {
      fechaReserva: '2024-03-15',
      horaReserva: '18:30:00',
      documentoCliente: 123456789,
      reservaId: 1,
    };

    beforeEach(() => {
      pushService.enviarNotificacion.mockReturnValue(
        of({ success: true, message: 'Notificación enviada' }),
      );
    });

    it('should send notification with numeric documentoCliente', async () => {
      const result = await service.notifyEstadoCambio(mockReserva, estadoReserva.CONFIRMADA);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          remitente: { tipo: 'SISTEMA' },
          destinatarios: { tipo: 'CLIENTE', documentoCliente: 123456789 },
          notificacion: expect.objectContaining({
            titulo: 'Reserva confirmada',
            datos: expect.objectContaining({
              tipo: 'RESERVA',
              reservaId: 1,
              estado: estadoReserva.CONFIRMADA,
            }),
          }),
        }),
      );
      expect(result).toEqual({ success: true, message: 'Notificación enviada' });
    });

    it('should send notification for CANCELADA status', async () => {
      await service.notifyEstadoCambio(mockReserva, estadoReserva.CANCELADA);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          notificacion: expect.objectContaining({
            titulo: 'Reserva cancelada',
            datos: expect.objectContaining({
              estado: estadoReserva.CANCELADA,
            }),
          }),
        }),
      );
    });

    it('should send notification for CUMPLIDA status', async () => {
      await service.notifyEstadoCambio(mockReserva, estadoReserva.CUMPLIDA);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          notificacion: expect.objectContaining({
            titulo: '¡Gracias por visitarnos!',
            datos: expect.objectContaining({
              estado: estadoReserva.CUMPLIDA,
            }),
          }),
        }),
      );
    });

    it('should send notification for PENDIENTE status', async () => {
      await service.notifyEstadoCambio(mockReserva, estadoReserva.PENDIENTE);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          notificacion: expect.objectContaining({
            titulo: 'Recibimos tu solicitud',
            datos: expect.objectContaining({
              estado: estadoReserva.PENDIENTE,
            }),
          }),
        }),
      );
    });

    it('should use getUserId when documentoCliente is null', async () => {
      userService.getUserId.mockReturnValue(111111111);
      const reservaWithoutDoc = {
        ...mockReserva,
        documentoCliente: null,
      };

      await service.notifyEstadoCambio(reservaWithoutDoc, estadoReserva.CONFIRMADA);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          destinatarios: { tipo: 'CLIENTE', documentoCliente: 111111111 },
        }),
      );
    });

    it('should use getUserId when documentoCliente is undefined', async () => {
      userService.getUserId.mockReturnValue(222222222);
      const reservaWithoutDoc = {
        fechaReserva: '2024-03-15',
        horaReserva: '18:30:00',
        reservaId: 1,
      } as any;

      await service.notifyEstadoCambio(reservaWithoutDoc, estadoReserva.CONFIRMADA);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          destinatarios: { tipo: 'CLIENTE', documentoCliente: 222222222 },
        }),
      );
    });

    it('should return null when documento is NaN', async () => {
      const reservaWithNaN = {
        ...mockReserva,
        documentoCliente: NaN,
      };

      const result = await service.notifyEstadoCambio(reservaWithNaN, estadoReserva.CONFIRMADA);

      expect(result).toBeNull();
      expect(pushService.enviarNotificacion).not.toHaveBeenCalled();
    });

    it('should return null when documento is 0', async () => {
      const reservaWithZero = {
        ...mockReserva,
        documentoCliente: 0,
      };

      const result = await service.notifyEstadoCambio(reservaWithZero, estadoReserva.CONFIRMADA);

      expect(result).toBeNull();
      expect(pushService.enviarNotificacion).not.toHaveBeenCalled();
    });
  });

  describe('notifyCreacion', () => {
    const mockReserva = {
      fechaReserva: '2024-03-15',
      horaReserva: '18:30:00',
      documentoCliente: 123456789,
      reservaId: 1,
    };

    beforeEach(() => {
      pushService.enviarNotificacion.mockReturnValue(
        of({ success: true, message: 'Notificación enviada' }),
      );
    });

    it('should send creation notification with numeric documentoCliente', async () => {
      const result = await service.notifyCreacion(mockReserva);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          remitente: { tipo: 'SISTEMA' },
          destinatarios: { tipo: 'CLIENTE', documentoCliente: 123456789 },
          notificacion: expect.objectContaining({
            titulo: 'Reserva creada',
            mensaje: expect.stringContaining('Recibimos tu solicitud'),
            datos: expect.objectContaining({
              tipo: 'RESERVA',
              reservaId: 1,
              estado: 'PENDIENTE',
            }),
          }),
        }),
      );
      expect(result).toEqual({ success: true, message: 'Notificación enviada' });
    });

    it('should use getUserId when documentoCliente is null', async () => {
      userService.getUserId.mockReturnValue(111111111);
      const reservaWithoutDoc = {
        ...mockReserva,
        documentoCliente: null,
      };

      await service.notifyCreacion(reservaWithoutDoc);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          destinatarios: { tipo: 'CLIENTE', documentoCliente: 111111111 },
        }),
      );
    });

    it('should use getUserId when documentoCliente is undefined', async () => {
      userService.getUserId.mockReturnValue(222222222);
      const reservaWithoutDoc = {
        fechaReserva: '2024-03-15',
        horaReserva: '18:30:00',
        reservaId: 1,
      } as any;

      await service.notifyCreacion(reservaWithoutDoc);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          destinatarios: { tipo: 'CLIENTE', documentoCliente: 222222222 },
        }),
      );
    });

    it('should return null when documento is NaN', async () => {
      const reservaWithNaN = {
        ...mockReserva,
        documentoCliente: NaN,
      };

      const result = await service.notifyCreacion(reservaWithNaN);

      expect(result).toBeNull();
      expect(pushService.enviarNotificacion).not.toHaveBeenCalled();
    });

    it('should return null when documento is 0', async () => {
      const reservaWithZero = {
        ...mockReserva,
        documentoCliente: 0,
      };

      const result = await service.notifyCreacion(reservaWithZero);

      expect(result).toBeNull();
      expect(pushService.enviarNotificacion).not.toHaveBeenCalled();
    });
  });

  describe('ramas adicionales', () => {
    it('formatDateTime devuelve strings vacíos si Intl falla y no hay parámetros', () => {
      const spy = jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => {
        throw new Error('boom');
      });
      const result = service['formatDateTime'](undefined, undefined);
      spy.mockRestore();
      expect(result).toEqual({ fecha: '', hora: '' });
    });

    it('formatDateTime devuelve fecha original y hora vacía si falla y falta hora', () => {
      const result = service['formatDateTime']('invalid-date', undefined);
      expect(result).toEqual({ fecha: 'invalid-date', hora: '' });
    });

    it('la url de la notificación incluye el reservaId y el documento cae al del usuario', async () => {
      pushService.enviarNotificacion.mockReturnValue(of({ success: true }));
      userService.getUserId.mockReturnValue(42);
      const reserva = { reservaId: 7, fechaReserva: '15-03-2024', horaReserva: '18:30:00' };
      await service.notifyEstadoCambio(reserva, estadoReserva.PENDIENTE);
      await service.notifyCreacion(reserva);
      expect(pushService.enviarNotificacion).toHaveBeenCalledTimes(2);
      for (const call of pushService.enviarNotificacion.mock.calls) {
        expect(call[0].destinatarios.documentoCliente).toBe(42);
        expect(call[0].notificacion.datos.url).toBe('/reservas/consultar?reservaId=7');
      }
    });

    it('sin getUserId en UserService y sin documentoCliente retorna null', async () => {
      (userService as any).getUserId = undefined;
      const reservaSinDoc = { reservaId: 1, fechaReserva: '15-03-2024', horaReserva: '18:30:00' };
      const r1 = await service.notifyEstadoCambio(reservaSinDoc, estadoReserva.PENDIENTE);
      const r2 = await service.notifyCreacion(reservaSinDoc);
      expect(r1).toBeNull();
      expect(r2).toBeNull();
      expect(pushService.enviarNotificacion).not.toHaveBeenCalled();
    });
  });
});
