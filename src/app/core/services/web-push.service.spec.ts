import { TestBed } from '@angular/core/testing';
import { SwPush } from '@angular/service-worker';
import { Subject, of, throwError } from 'rxjs';

import {
  createAlertSpyMock,
  createConsoleSpyMock,
  createCapacitorMock,
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

  describe('isWebBrowser', () => {
    it('debería retornar false cuando window o navigator no existen', () => {
      const originalWindow = (global as any).window;
      const originalNavigator = (global as any).navigator;

      (global as any).window = undefined;
      (global as any).navigator = undefined;

      expect((service as any).isWebBrowser()).toBe(false);

      (global as any).window = originalWindow;
      (global as any).navigator = originalNavigator;
    });

    it('debería retornar false cuando se ejecuta dentro de Capacitor', () => {
      (window as any).Capacitor = createCapacitorMock();

      expect((service as any).isWebBrowser()).toBe(false);

      delete (window as any).Capacitor;
    });

    it('debería retornar true cuando es un navegador web estándar', () => {
      expect((service as any).isWebBrowser()).toBe(true);
    });
  });

  describe('isSupported', () => {
    it('debería retornar false en entornos no soportados', () => {
      createServiceSpyMock(service, 'isWebBrowser', false);

      expect(service.isSupported()).toBe(false);
    });

    it('debería retornar true cuando todas las APIs están disponibles', () => {
      jest.spyOn(service as any, 'isWebBrowser').mockReturnValue(true);
      (window as any).PushManager = {};
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {},
        configurable: true,
      });

      const result = service.isSupported();

      expect(result).toBe(true);

      delete (window as any).PushManager;
    });
  });

  describe('getPermissionStatus', () => {
    it('debería retornar el estado actual de permisos', () => {
      const status = service.getPermissionStatus();
      expect(['default', 'granted', 'denied']).toContain(status);
    });

    it('debería retornar denied cuando no está soportado', () => {
      createServiceSpyMock(service, 'isSupported', false);

      expect(service.getPermissionStatus()).toBe('denied');
    });

    it('debería retornar el estado real cuando está soportado', () => {
      jest.spyOn(service, 'isSupported').mockReturnValue(true);
      (window.Notification as any).permission = 'granted';

      expect(service.getPermissionStatus()).toBe('granted');
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

    it('debería manejar errores inesperados al suscribirse', async () => {
      jest.spyOn(service, 'isSupported').mockReturnValue(true);
      swPush.isEnabled = true;
      (window.Notification as any).permission = 'granted';
      jest.spyOn(service as any, 'subscribe').mockRejectedValue(new Error('random failure'));

      const consoleSpy = createConsoleSpyMock('error');

      const result = await service.requestPermissionAndSubscribe();

      expect(result).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Error al activar notificaciones'));

      consoleSpy.mockRestore();
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

  describe('subscribe', () => {
    it('debería retornar false si el service worker no está habilitado', async () => {
      swPush.isEnabled = false;

      const result = await (service as any).subscribe();

      expect(result).toBe(false);
    });

    it('debería manejar errores del backend con mensaje específico', async () => {
      swPush.isEnabled = true;
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
        throwError(() => new Error('backend failure detected')),
      );

      const consoleSpy = createConsoleSpyMock('error');

      const result = await (service as any).subscribe();

      expect(result).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error al registrar en el servidor'),
      );

      consoleSpy.mockRestore();
    });

    it('debería manejar errores genéricos al solicitar la suscripción', async () => {
      swPush.isEnabled = true;
      swPush.requestSubscription.mockRejectedValue(new Error('error genérico'));

      const consoleSpy = createConsoleSpyMock('error');

      const result = await (service as any).subscribe();

      expect(result).toBe(false);
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error al activar notificaciones'),
      );

      consoleSpy.mockRestore();
    });
  });

  describe('listenToPushMessages', () => {
    it('debería mostrar notificaciones y navegar cuando se hace clic', () => {
      const messages$ = new Subject<any>();
      const clicks$ = new Subject<any>();

      (swPush as any).messages = messages$;
      (swPush as any).notificationClicks = clicks$;

      const showNotificationSpy = jest
        .spyOn(service, 'showNotification')
        .mockImplementation(() => {});
      const hrefSpy = jest.spyOn(window.location, 'href', 'set');

      (service as any).listenToPushMessages();

      messages$.next({
        notification: { title: 'Hola', body: 'Mensaje' },
        data: { tipo: 'promo' },
      });

      expect(showNotificationSpy).toHaveBeenCalledWith('Hola', 'Mensaje', { tipo: 'promo' });

      clicks$.next({ action: 'open', notification: { data: { url: 'https://ejemplo.com' } } });

      expect(hrefSpy).toHaveBeenCalledWith('https://ejemplo.com');

      hrefSpy.mockRestore();
    });
  });

  describe('getVAPIDPublicKey', () => {
    it('debería retornar la clave pública configurada', () => {
      expect((service as any).getVAPIDPublicKey()).toBeDefined();
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
