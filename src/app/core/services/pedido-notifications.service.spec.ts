import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { createPushServiceMock, createUserServiceMock } from '../../shared/mocks/test-doubles';
import { PedidoNotificationsService } from './pedido-notifications.service';
import { PushService } from './push.service';
import { UserService } from './user.service';

describe('PedidoNotificationsService', () => {
  let service: PedidoNotificationsService;
  let pushService: ReturnType<typeof createPushServiceMock>;
  let userService: ReturnType<typeof createUserServiceMock>;

  beforeEach(() => {
    pushService = createPushServiceMock();
    userService = createUserServiceMock();

    TestBed.configureTestingModule({
      providers: [
        PedidoNotificationsService,
        { provide: PushService, useValue: pushService },
        { provide: UserService, useValue: userService },
      ],
    });

    service = TestBed.inject(PedidoNotificationsService);

    // Mock console.log y console.error para evitar logs en tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('notifyCreacion', () => {
    const mockDocumentoCliente = 123456789;
    const mockPedidoId = 42;

    beforeEach(() => {
      pushService.enviarNotificacion.mockReturnValue(
        of({ code: 200, message: 'Notificación enviada', data: {} }),
      );
    });

    it('should send notification to client when pedido is created', async () => {
      const result = await service.notifyCreacion(mockDocumentoCliente, mockPedidoId);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          remitente: { tipo: 'SISTEMA' },
          destinatarios: { tipo: 'CLIENTE', documentoCliente: mockDocumentoCliente },
          notificacion: expect.objectContaining({
            titulo: 'Pedido recibido',
            mensaje: expect.stringContaining('Recibimos tu pedido'),
            datos: expect.objectContaining({
              tipo: 'PEDIDO',
              pedidoId: mockPedidoId,
              url: '/cliente/mis-pedidos',
            }),
          }),
        }),
      );
      expect(result).toEqual({ code: 200, message: 'Notificación enviada', data: {} });
    });

    it('should include pedidoId in notification data', async () => {
      await service.notifyCreacion(mockDocumentoCliente, mockPedidoId);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          notificacion: expect.objectContaining({
            datos: expect.objectContaining({
              pedidoId: mockPedidoId,
            }),
          }),
        }),
      );
    });

    it('should return null when documentoCliente is 0', async () => {
      const result = await service.notifyCreacion(0, mockPedidoId);

      expect(result).toBeNull();
      expect(pushService.enviarNotificacion).not.toHaveBeenCalled();
    });

    it('should return null when documentoCliente is NaN', async () => {
      const result = await service.notifyCreacion(NaN, mockPedidoId);

      expect(result).toBeNull();
      expect(pushService.enviarNotificacion).not.toHaveBeenCalled();
    });

    it('should return null when documentoCliente is null', async () => {
      const result = await service.notifyCreacion(null as any, mockPedidoId);

      expect(result).toBeNull();
      expect(pushService.enviarNotificacion).not.toHaveBeenCalled();
    });

    it('should return null when documentoCliente is undefined', async () => {
      const result = await service.notifyCreacion(undefined as any, mockPedidoId);

      expect(result).toBeNull();
      expect(pushService.enviarNotificacion).not.toHaveBeenCalled();
    });

    it('should return null when pushService fails', async () => {
      pushService.enviarNotificacion.mockReturnValue(
        throwError(() => new Error('Push service error')),
      );

      const result = await service.notifyCreacion(mockDocumentoCliente, mockPedidoId);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        '[Pedidos] Error al enviar notificación al cliente:',
        expect.any(Error),
      );
    });

    it('should log notification payload', async () => {
      await service.notifyCreacion(mockDocumentoCliente, mockPedidoId);

      expect(console.log).toHaveBeenCalledWith(
        '[Pedidos] Enviando notificación creación al cliente:',
        expect.objectContaining({
          remitente: { tipo: 'SISTEMA' },
          destinatarios: { tipo: 'CLIENTE', documentoCliente: mockDocumentoCliente },
        }),
      );
    });
  });

  describe('notifyAdminDomicilio', () => {
    const mockPedidoId = 42;
    const mockDomicilioId = 99;

    beforeEach(() => {
      pushService.enviarNotificacion.mockReturnValue(
        of({ code: 200, message: 'Notificación enviada', data: {} }),
      );
    });

    it('should send notification to trabajadores when pedido with domicilio is created', async () => {
      const result = await service.notifyAdminDomicilio(mockPedidoId, mockDomicilioId);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          remitente: { tipo: 'SISTEMA' },
          destinatarios: { tipo: 'TRABAJADORES' },
          notificacion: expect.objectContaining({
            titulo: 'Nuevo pedido con domicilio',
            mensaje: expect.stringContaining(`pedido (#${mockPedidoId})`),
            datos: expect.objectContaining({
              tipo: 'PEDIDO_DOMICILIO',
              pedidoId: mockPedidoId,
              domicilioId: mockDomicilioId,
              url: '/admin/domicilios/consultar',
            }),
          }),
        }),
      );
      expect(result).toEqual({ code: 200, message: 'Notificación enviada', data: {} });
    });

    it('should include both pedidoId and domicilioId in notification', async () => {
      await service.notifyAdminDomicilio(mockPedidoId, mockDomicilioId);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          notificacion: expect.objectContaining({
            mensaje: expect.stringContaining(`#${mockPedidoId}`),
            datos: expect.objectContaining({
              pedidoId: mockPedidoId,
              domicilioId: mockDomicilioId,
            }),
          }),
        }),
      );
    });

    it('should include domicilioId in message', async () => {
      await service.notifyAdminDomicilio(mockPedidoId, mockDomicilioId);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          notificacion: expect.objectContaining({
            mensaje: expect.stringContaining(`Domicilio #${mockDomicilioId}`),
          }),
        }),
      );
    });

    it('should target trabajadores', async () => {
      await service.notifyAdminDomicilio(mockPedidoId, mockDomicilioId);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          destinatarios: { tipo: 'TRABAJADORES' },
        }),
      );
    });

    it('should return null when pushService fails', async () => {
      pushService.enviarNotificacion.mockReturnValue(
        throwError(() => new Error('Push service error')),
      );

      const result = await service.notifyAdminDomicilio(mockPedidoId, mockDomicilioId);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        '[Pedidos] Error al enviar notificación al admin:',
        expect.any(Error),
      );
    });

    it('should log notification payload', async () => {
      await service.notifyAdminDomicilio(mockPedidoId, mockDomicilioId);

      expect(console.log).toHaveBeenCalledWith(
        '[Pedidos] Enviando notificación domicilio al admin:',
        expect.objectContaining({
          remitente: { tipo: 'SISTEMA' },
          destinatarios: { tipo: 'TRABAJADORES' },
        }),
      );
    });

    it('should handle zero pedidoId correctly', async () => {
      await service.notifyAdminDomicilio(0, mockDomicilioId);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          notificacion: expect.objectContaining({
            mensaje: expect.stringContaining('#0'),
            datos: expect.objectContaining({
              pedidoId: 0,
            }),
          }),
        }),
      );
    });

    it('should handle zero domicilioId correctly', async () => {
      await service.notifyAdminDomicilio(mockPedidoId, 0);

      expect(pushService.enviarNotificacion).toHaveBeenCalledWith(
        expect.objectContaining({
          notificacion: expect.objectContaining({
            mensaje: expect.stringContaining('Domicilio #0'),
            datos: expect.objectContaining({
              domicilioId: 0,
            }),
          }),
        }),
      );
    });
  });
});
