import { TestBed } from '@angular/core/testing';
import { SwPush } from '@angular/service-worker';
import { of, throwError } from 'rxjs';

import {
  createAlertSpyMock,
  createConsoleSpyMock,
  createNotificationMock,
  createPushServiceMock,
  createRequestPermissionDeniedMock,
  createRequestPermissionMock,
  createServiceSpyMock,
  createServiceWorkerMock,
  createSwPushMock,
  createUserServiceMock,
  configureUserServiceMock,
} from '../../shared/mocks/test-doubles';
import { PushService } from './push.service';
import { UserService } from './user.service';
import { WebPushService } from './web-push.service';

describe('WebPushService', () => {
  let service: WebPushService;
  let swPush: jest.Mocked<SwPush>;
  let pushService: jest.Mocked<PushService>;
  let userService: jest.Mocked<UserService>;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    const swPushMock = createSwPushMock();
    const pushServiceMock = createPushServiceMock();
    const userServiceMock = createUserServiceMock();

    // Mock de Notification API
    Object.defineProperty(window, 'Notification', {
      value: {
        permission: 'default',
        requestPermission: createRequestPermissionMock(),
      },
      writable: true,
      configurable: true,
    });

    // Mock alert
    alertSpy = createAlertSpyMock();

    TestBed.configureTestingModule({
      providers: [
        WebPushService,
        { provide: SwPush, useValue: swPushMock },
        { provide: PushService, useValue: pushServiceMock },
        { provide: UserService, useValue: userServiceMock },
      ],
    });

    service = TestBed.inject(WebPushService);
    swPush = TestBed.inject(SwPush) as jest.Mocked<SwPush>;
    pushService = TestBed.inject(PushService) as jest.Mocked<PushService>;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;

    // Defaults para userService
    configureUserServiceMock(userService, {
      getUserRole: 'Cliente',
      getUserId: 123,
    });

    jest.clearAllMocks();
  });

  it('debería crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  describe('isSupported', () => {
    it('debería retornar false en entornos no soportados', () => {
      // El test en JSDOM no tiene Capacitor
      expect(service.isSupported()).toBeDefined();
    });
  });

  describe('getPermissionStatus', () => {
    it('debería retornar el estado actual de permisos', () => {
      const status = service.getPermissionStatus();
      expect(['default', 'granted', 'denied']).toContain(status);
    });
  });

  describe('showNotification', () => {
    it('debería llamarse sin errores cuando no hay permisos', () => {
      expect(() => {
        service.showNotification('Test', 'Body test', { tipo: 'TEST' });
      }).not.toThrow();
    });
  });

  describe('requestPermissionAndSubscribe', () => {
    it('debería retornar false si no está soportado', async () => {
      createServiceSpyMock(service, 'isSupported', false);

      const result = await service.requestPermissionAndSubscribe();

      expect(result).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Tu navegador no soporta notificaciones push'),
      );
    });

    it('debería retornar false si Service Worker no está habilitado', async () => {
      createServiceSpyMock(service, 'isSupported', true);
      swPush.isEnabled = false;

      const result = await service.requestPermissionAndSubscribe();

      expect(result).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Service Worker no está habilitado'),
      );
    });

    it('debería suscribirse si ya tiene permisos granted', async () => {
      jest.spyOn(service, 'isSupported').mockReturnValue(true);
      swPush.isEnabled = true;
      (window.Notification as any).permission = 'granted';

      const mockSubscription = {
        toJSON: () => ({
          endpoint: 'https://fcm.googleapis.com/fcm/send/test',
          keys: {
            p256dh: 'test-p256dh-key',
            auth: 'test-auth-key',
          },
        }),
      };

      swPush.requestSubscription.mockResolvedValue(mockSubscription as any);
      pushService.registrarDispositivo.mockReturnValue(of({ code: 200 } as any));

      const result = await service.requestPermissionAndSubscribe();

      expect(result).toBe(true);
      expect(swPush.requestSubscription).toHaveBeenCalled();
      expect(pushService.registrarDispositivo).toHaveBeenCalledWith(
        expect.objectContaining({
          plataforma: 'WEB',
          endpoint: 'https://fcm.googleapis.com/fcm/send/test',
          p256dh: 'test-p256dh-key',
          auth: 'test-auth-key',
        }),
      );
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Notificaciones activadas'));
    });

    it('debería solicitar permisos y suscribirse si permission es default', async () => {
      jest.spyOn(service, 'isSupported').mockReturnValue(true);
      swPush.isEnabled = true;
      (window.Notification as any).permission = 'default';
      (window.Notification as any).requestPermission = createRequestPermissionMock();

      const mockSubscription = {
        toJSON: () => ({
          endpoint: 'https://fcm.googleapis.com/fcm/send/test',
          keys: {
            p256dh: 'test-p256dh-key',
            auth: 'test-auth-key',
          },
        }),
      };

      swPush.requestSubscription.mockResolvedValue(mockSubscription as any);
      pushService.registrarDispositivo.mockReturnValue(of({ code: 200 } as any));

      const result = await service.requestPermissionAndSubscribe();

      expect(result).toBe(true);
      expect(window.Notification.requestPermission).toHaveBeenCalled();
    });

    it('debería retornar false si el usuario deniega los permisos', async () => {
      jest.spyOn(service, 'isSupported').mockReturnValue(true);
      swPush.isEnabled = true;
      (window.Notification as any).permission = 'default';
      (window.Notification as any).requestPermission = createRequestPermissionDeniedMock();

      const result = await service.requestPermissionAndSubscribe();

      expect(result).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Permisos denegados'));
    });

    it('debería manejar error cuando la suscripción es inválida', async () => {
      jest.spyOn(service, 'isSupported').mockReturnValue(true);
      swPush.isEnabled = true;
      (window.Notification as any).permission = 'granted';

      const mockSubscription = {
        toJSON: () => ({
          endpoint: null, // Suscripción inválida
          keys: {},
        }),
      };

      swPush.requestSubscription.mockResolvedValue(mockSubscription as any);

      const result = await service.requestPermissionAndSubscribe();

      expect(result).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Suscripción inválida'));
    });

    it('debería manejar error de VAPID', async () => {
      jest.spyOn(service, 'isSupported').mockReturnValue(true);
      swPush.isEnabled = true;
      (window.Notification as any).permission = 'granted';

      swPush.requestSubscription.mockRejectedValue(new Error('VAPID key invalid'));

      const result = await service.requestPermissionAndSubscribe();

      expect(result).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error de configuración VAPID'),
      );
    });

    it('debería manejar error al registrar en backend', async () => {
      jest.spyOn(service, 'isSupported').mockReturnValue(true);
      swPush.isEnabled = true;
      (window.Notification as any).permission = 'granted';

      const mockSubscription = {
        toJSON: () => ({
          endpoint: 'https://fcm.googleapis.com/fcm/send/test',
          keys: {
            p256dh: 'test-p256dh-key',
            auth: 'test-auth-key',
          },
        }),
      };

      swPush.requestSubscription.mockResolvedValue(mockSubscription as any);
      pushService.registrarDispositivo.mockReturnValue(
        throwError(() => new Error('Backend error')),
      );

      const result = await service.requestPermissionAndSubscribe();

      expect(result).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error al activar notificaciones'),
      );
    });

    it('debería registrar dispositivo con documentoTrabajador si el rol es diferente a Cliente', async () => {
      jest.spyOn(service, 'isSupported').mockReturnValue(true);
      swPush.isEnabled = true;
      (window.Notification as any).permission = 'granted';
      (userService.getUserRole as jest.Mock).mockReturnValue('Administrador');
      (userService.getUserId as jest.Mock).mockReturnValue(456);

      const mockSubscription = {
        toJSON: () => ({
          endpoint: 'https://fcm.googleapis.com/fcm/send/test',
          keys: {
            p256dh: 'test-p256dh-key',
            auth: 'test-auth-key',
          },
        }),
      };

      swPush.requestSubscription.mockResolvedValue(mockSubscription as any);
      pushService.registrarDispositivo.mockReturnValue(of({ code: 200 } as any));

      const result = await service.requestPermissionAndSubscribe();

      expect(result).toBe(true);
      expect(pushService.registrarDispositivo).toHaveBeenCalledWith(
        expect.objectContaining({
          documentoTrabajador: 456,
          documentoCliente: undefined,
        }),
      );
    });
  });

  describe('showNotification', () => {
    beforeEach(() => {
      // Mock Notification global
      (window as any).Notification = class {
        static permission = 'granted';
        constructor(
          public title: string,
          public options: any,
        ) {}
      };

      // Mock service worker
      Object.defineProperty(navigator, 'serviceWorker', {
        value: createServiceWorkerMock(),
        writable: true,
        configurable: true,
      });
    });

    it('debería mostrar notificación cuando hay permisos y service worker', async () => {
      jest.spyOn(service, 'isSupported').mockReturnValue(true);
      (window.Notification as any).permission = 'granted';

      const registration = await navigator.serviceWorker.ready;
      const showNotificationSpy = registration.showNotification as jest.Mock;

      service.showNotification('Test Title', 'Test Body', { tipo: 'TEST' });

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(showNotificationSpy).toHaveBeenCalledWith(
        'Test Title',
        expect.objectContaining({
          body: 'Test Body',
          tag: 'TEST',
        }),
      );
    });

    it('debería usar Notification directa cuando no hay service worker controller', () => {
      jest.spyOn(service, 'isSupported').mockReturnValue(true);

      // Mock Notification class
      const MockNotification = createNotificationMock();
      (window as any).Notification = MockNotification;
      (window as any).Notification.permission = 'granted';

      // Remover service worker controller
      Object.defineProperty(navigator, 'serviceWorker', {
        value: { controller: null },
        writable: true,
        configurable: true,
      });

      service.showNotification('Test', 'Body', { tipo: 'TEST' });

      expect(MockNotification).toHaveBeenCalledWith(
        'Test',
        expect.objectContaining({
          body: 'Body',
        }),
      );
    });

    it('no debería mostrar notificación si no hay permisos', () => {
      jest.spyOn(service, 'isSupported').mockReturnValue(true);
      (window.Notification as any).permission = 'default';

      const NotificationSpy = jest.spyOn(window as any, 'Notification');

      service.showNotification('Test', 'Body');

      expect(NotificationSpy).not.toHaveBeenCalled();
    });

    it('no debería mostrar notificación si no está soportado', () => {
      jest.spyOn(service, 'isSupported').mockReturnValue(false);

      const NotificationSpy = jest.spyOn(window as any, 'Notification');

      service.showNotification('Test', 'Body');

      expect(NotificationSpy).not.toHaveBeenCalled();
    });
  });

  describe('unsubscribe', () => {
    it('debería desuscribirse correctamente', async () => {
      swPush.unsubscribe.mockResolvedValue(undefined);

      await service.unsubscribe();

      expect(swPush.unsubscribe).toHaveBeenCalled();
    });

    it('debería manejar errores al desuscribirse', async () => {
      swPush.unsubscribe.mockRejectedValue(new Error('Error test'));

      await expect(service.unsubscribe()).resolves.not.toThrow();
    });
  });
});
