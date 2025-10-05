import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { NativePushService } from './native-push.service';
import { PushService } from './push.service';
import { UserService } from './user.service';

// Mock de @capacitor/push-notifications
const mockPushNotifications = {
  requestPermissions: jest.fn(), // eslint-disable-line no-restricted-syntax
  register: jest.fn(), // eslint-disable-line no-restricted-syntax
  createChannel: jest.fn(), // eslint-disable-line no-restricted-syntax
  addListener: jest.fn(), // eslint-disable-line no-restricted-syntax
};

// Mock de @capacitor-firebase/messaging
const mockFirebaseMessaging = {
  requestPermissions: jest.fn(), // eslint-disable-line no-restricted-syntax
  getToken: jest.fn(), // eslint-disable-line no-restricted-syntax
  addListener: jest.fn(), // eslint-disable-line no-restricted-syntax
};

// Mock de @capacitor/local-notifications
const mockLocalNotifications = {
  requestPermissions: jest.fn(), // eslint-disable-line no-restricted-syntax
  schedule: jest.fn(), // eslint-disable-line no-restricted-syntax
};

// Mock de notification-center.store
const mockNotificationStore = {
  addNotification: jest.fn(), // eslint-disable-line no-restricted-syntax
};

// Mock imports dinámicos
jest.mock('@capacitor/push-notifications', () => ({
  PushNotifications: mockPushNotifications,
}));

jest.mock('@capacitor-firebase/messaging', () => ({
  FirebaseMessaging: mockFirebaseMessaging,
}));

jest.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: mockLocalNotifications,
}));

jest.mock('../../shared/utils/notification-center.store', () => mockNotificationStore);

describe('NativePushService', () => {
  let service: NativePushService;
  let pushService: jest.Mocked<PushService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    const pushServiceMock = {
      registrarDispositivo: jest.fn().mockReturnValue(of({})), // eslint-disable-line no-restricted-syntax
    } as any;

    const userServiceMock = {
      getUserRole: jest.fn(), // eslint-disable-line no-restricted-syntax
      getUserId: jest.fn(), // eslint-disable-line no-restricted-syntax
    } as any;

    TestBed.configureTestingModule({
      providers: [
        NativePushService,
        { provide: PushService, useValue: pushServiceMock },
        { provide: UserService, useValue: userServiceMock },
      ],
    });

    service = TestBed.inject(NativePushService);
    pushService = TestBed.inject(PushService) as jest.Mocked<PushService>;
    userService = TestBed.inject(UserService) as jest.Mocked<UserService>;

    // Reset window.Capacitor
    delete (window as any).Capacitor;

    // Mock console methods to avoid noise
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isNativeWebView', () => {
    it('should return false if Capacitor is not defined', async () => {
      delete (window as any).Capacitor;
      await service.init();
      // Si no es nativo, init debería retornar inmediatamente sin hacer nada
      expect(pushService.registrarDispositivo).not.toHaveBeenCalled();
    });

    it('should return true if Capacitor is defined and platform is not web', async () => {
      (window as any).Capacitor = {
        getPlatform: jest.fn().mockReturnValue('android'), // eslint-disable-line no-restricted-syntax
      };

      mockPushNotifications.requestPermissions.mockResolvedValue({ receive: 'granted' });
      mockPushNotifications.register.mockResolvedValue(undefined);
      mockPushNotifications.createChannel.mockResolvedValue(undefined);
      mockFirebaseMessaging.requestPermissions.mockResolvedValue(undefined);
      mockFirebaseMessaging.getToken.mockResolvedValue({ token: 'mock-fcm-token' });

      userService.getUserRole.mockReturnValue('Cliente');
      userService.getUserId.mockReturnValue(12345);

      await service.init();

      expect(pushService.registrarDispositivo).toHaveBeenCalled();
    });

    it('should return false if Capacitor platform is web', async () => {
      (window as any).Capacitor = {
        getPlatform: jest.fn().mockReturnValue('web'), // eslint-disable-line no-restricted-syntax
      };

      await service.init();

      expect(pushService.registrarDispositivo).not.toHaveBeenCalled();
    });
  });

  describe('init - permissions', () => {
    beforeEach(() => {
      (window as any).Capacitor = {
        getPlatform: jest.fn().mockReturnValue('android'), // eslint-disable-line no-restricted-syntax
      };
    });

    it('should return early if permissions are not granted', async () => {
      mockPushNotifications.requestPermissions.mockResolvedValue({ receive: 'denied' });

      await service.init();

      expect(mockPushNotifications.register).not.toHaveBeenCalled();
      expect(pushService.registrarDispositivo).not.toHaveBeenCalled();
    });

    it('should continue if permissions are granted', async () => {
      mockPushNotifications.requestPermissions.mockResolvedValue({ receive: 'granted' });
      mockPushNotifications.register.mockResolvedValue(undefined);
      mockPushNotifications.createChannel.mockResolvedValue(undefined);
      mockFirebaseMessaging.requestPermissions.mockResolvedValue(undefined);
      mockFirebaseMessaging.getToken.mockResolvedValue({ token: 'mock-token' });

      userService.getUserRole.mockReturnValue(null);
      userService.getUserId.mockReturnValue(null);

      await service.init();

      expect(mockPushNotifications.register).toHaveBeenCalled();
      expect(pushService.registrarDispositivo).toHaveBeenCalled();
    });
  });

  describe('init - channel creation', () => {
    beforeEach(() => {
      (window as any).Capacitor = {
        getPlatform: jest.fn().mockReturnValue('android'), // eslint-disable-line no-restricted-syntax
      };
      mockPushNotifications.requestPermissions.mockResolvedValue({ receive: 'granted' });
      mockPushNotifications.register.mockResolvedValue(undefined);
    });

    it('should create notification channel', async () => {
      mockPushNotifications.createChannel.mockResolvedValue(undefined);
      mockFirebaseMessaging.getToken.mockResolvedValue({ token: 'token' });

      await service.init();

      expect(mockPushNotifications.createChannel).toHaveBeenCalledWith({
        id: 'default',
        name: 'General',
        description: 'Notificaciones generales',
        importance: 5,
        visibility: 1,
        sound: 'default',
        lights: true,
        vibration: true,
      });
    });

    it('should handle channel creation errors gracefully', async () => {
      mockPushNotifications.createChannel.mockRejectedValue(new Error('Channel error'));
      mockFirebaseMessaging.getToken.mockResolvedValue({ token: 'token' });

      await service.init();

      // Debería continuar a pesar del error
      expect(pushService.registrarDispositivo).toHaveBeenCalled();
    });
  });

  describe('init - action listener', () => {
    beforeEach(() => {
      (window as any).Capacitor = {
        getPlatform: jest.fn().mockReturnValue('android'), // eslint-disable-line no-restricted-syntax
      };
      mockPushNotifications.requestPermissions.mockResolvedValue({ receive: 'granted' });
      mockPushNotifications.register.mockResolvedValue(undefined);
      mockFirebaseMessaging.getToken.mockResolvedValue({ token: 'token' });
    });

    it('should add pushNotificationActionPerformed listener', async () => {
      await service.init();

      expect(mockPushNotifications.addListener).toHaveBeenCalledWith(
        'pushNotificationActionPerformed',
        expect.any(Function),
      );
    });

    it('should dispatch custom event when notification is tapped with URL', async () => {
      let actionListener: any;
      mockPushNotifications.addListener.mockImplementation((event, callback) => {
        if (event === 'pushNotificationActionPerformed') {
          actionListener = callback;
        }
      });

      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      await service.init();

      // Simular tap en notificación
      const mockEvent = {
        notification: {
          data: { url: '/test-url' },
        },
      };

      actionListener(mockEvent);

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'push-notification-action',
          detail: { url: '/test-url' },
        }),
      );
    });

    it('should not dispatch event if URL is missing', async () => {
      let actionListener: any;
      mockPushNotifications.addListener.mockImplementation((event, callback) => {
        if (event === 'pushNotificationActionPerformed') {
          actionListener = callback;
        }
      });

      const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');

      await service.init();

      const mockEvent = {
        notification: {
          data: {},
        },
      };

      actionListener(mockEvent);

      expect(dispatchEventSpy).not.toHaveBeenCalled();
    });

    it('should handle errors when dispatching event', async () => {
      let actionListener: any;
      mockPushNotifications.addListener.mockImplementation((event, callback) => {
        if (event === 'pushNotificationActionPerformed') {
          actionListener = callback;
        }
      });

      jest.spyOn(window, 'dispatchEvent').mockImplementation(() => {
        throw new Error('Dispatch error');
      });

      await service.init();

      const mockEvent = {
        notification: {
          data: { url: '/test' },
        },
      };

      expect(() => actionListener(mockEvent)).not.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        '[Push] Error dispatching navigation event:',
        expect.any(Error),
      );
    });
  });

  describe('init - FCM token via FirebaseMessaging', () => {
    beforeEach(() => {
      (window as any).Capacitor = {
        getPlatform: jest.fn().mockReturnValue('android'), // eslint-disable-line no-restricted-syntax
      };
      mockPushNotifications.requestPermissions.mockResolvedValue({ receive: 'granted' });
      mockPushNotifications.register.mockResolvedValue(undefined);
    });

    it('should get FCM token from FirebaseMessaging', async () => {
      mockFirebaseMessaging.getToken.mockResolvedValue({ token: 'fcm-token-123' });
      userService.getUserRole.mockReturnValue('Cliente');
      userService.getUserId.mockReturnValue(999);

      await service.init();

      expect(mockFirebaseMessaging.getToken).toHaveBeenCalled();
      expect(pushService.registrarDispositivo).toHaveBeenCalledWith(
        expect.objectContaining({
          fcmToken: 'fcm-token-123',
          documentoCliente: 999,
        }),
      );
    });

    it('should return early if no FCM token is obtained', async () => {
      mockFirebaseMessaging.getToken.mockResolvedValue({});

      await service.init();

      expect(pushService.registrarDispositivo).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('[Push] No FCM token');
    });

    it('should handle FirebaseMessaging permission errors gracefully', async () => {
      mockFirebaseMessaging.requestPermissions.mockRejectedValue(new Error('Permission error'));
      mockFirebaseMessaging.getToken.mockResolvedValue({ token: 'token' });

      await service.init();

      // Debería continuar y obtener el token
      expect(mockFirebaseMessaging.getToken).toHaveBeenCalled();
    });
  });

  describe('init - notificationReceived listener', () => {
    beforeEach(() => {
      (window as any).Capacitor = {
        getPlatform: jest.fn().mockReturnValue('android'), // eslint-disable-line no-restricted-syntax
      };
      mockPushNotifications.requestPermissions.mockResolvedValue({ receive: 'granted' });
      mockPushNotifications.register.mockResolvedValue(undefined);
      mockFirebaseMessaging.getToken.mockResolvedValue({ token: 'token' });

      // Reset listenersBound entre tests
      (service as any).listenersBound = false;
    });

    it('should add notificationReceived listener only once', async () => {
      await service.init();
      await service.init();

      // Solo debería agregarse una vez
      const notificationReceivedCalls = mockFirebaseMessaging.addListener.mock.calls.filter(
        (call) => call[0] === 'notificationReceived',
      );
      expect(notificationReceivedCalls.length).toBe(1);
    });

    it('should handle notification received in foreground', async () => {
      let notificationListener: any;
      mockFirebaseMessaging.addListener.mockImplementation((event, callback) => {
        if (event === 'notificationReceived') {
          notificationListener = callback;
        }
      });

      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'visible',
      });

      mockLocalNotifications.requestPermissions.mockResolvedValue(undefined);
      mockLocalNotifications.schedule.mockResolvedValue(undefined);

      await service.init();

      const mockNotification = {
        notification: {
          title: 'Test Title',
          body: 'Test Body',
        },
        data: { key: 'value' },
      };

      await notificationListener(mockNotification);

      expect(mockNotificationStore.addNotification).toHaveBeenCalledWith({
        title: 'Test Title',
        body: 'Test Body',
        data: { key: 'value' },
      });

      expect(mockLocalNotifications.schedule).toHaveBeenCalledWith({
        notifications: [
          expect.objectContaining({
            title: 'Test Title',
            body: 'Test Body',
            extra: { key: 'value' },
          }),
        ],
      });
    });

    it('should use fallback values for notification fields', async () => {
      let notificationListener: any;
      mockFirebaseMessaging.addListener.mockImplementation((event, callback) => {
        if (event === 'notificationReceived') {
          notificationListener = callback;
        }
      });

      await service.init();

      const mockNotification = {
        title: 'Direct Title',
        body: 'Direct Body',
      };

      await notificationListener(mockNotification);

      expect(mockNotificationStore.addNotification).toHaveBeenCalledWith({
        title: 'Direct Title',
        body: 'Direct Body',
        data: {},
      });
    });

    it('should use default title if none provided', async () => {
      let notificationListener: any;
      mockFirebaseMessaging.addListener.mockImplementation((event, callback) => {
        if (event === 'notificationReceived') {
          notificationListener = callback;
        }
      });

      await service.init();

      const mockNotification = {};

      await notificationListener(mockNotification);

      expect(mockNotificationStore.addNotification).toHaveBeenCalledWith({
        title: 'Notificación',
        body: '',
        data: {},
      });
    });

    it('should not schedule local notification if app is in background', async () => {
      let notificationListener: any;
      mockFirebaseMessaging.addListener.mockImplementation((event, callback) => {
        if (event === 'notificationReceived') {
          notificationListener = callback;
        }
      });

      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'hidden',
      });

      await service.init();

      const mockNotification = {
        notification: {
          title: 'Test',
          body: 'Test',
        },
      };

      await notificationListener(mockNotification);

      expect(mockLocalNotifications.schedule).not.toHaveBeenCalled();
    });

    it('should handle errors in addNotification gracefully', async () => {
      let notificationListener: any;
      mockFirebaseMessaging.addListener.mockImplementation((event, callback) => {
        if (event === 'notificationReceived') {
          notificationListener = callback;
        }
      });

      // eslint-disable-next-line no-restricted-syntax
      mockNotificationStore.addNotification = jest.fn(() => {
        throw new Error('Store error');
      });

      await service.init();

      const mockNotification = {
        notification: { title: 'Test', body: 'Test' },
      };

      // No debería lanzar error
      await expect(notificationListener(mockNotification)).resolves.not.toThrow();
    });

    it('should handle errors in LocalNotifications gracefully', async () => {
      let notificationListener: any;
      mockFirebaseMessaging.addListener.mockImplementation((event, callback) => {
        if (event === 'notificationReceived') {
          notificationListener = callback;
        }
      });

      Object.defineProperty(document, 'visibilityState', {
        writable: true,
        configurable: true,
        value: 'visible',
      });

      mockLocalNotifications.schedule.mockRejectedValue(new Error('Local notification error'));

      await service.init();

      const mockNotification = {
        notification: { title: 'Test', body: 'Test' },
      };

      // No debería lanzar error
      await expect(notificationListener(mockNotification)).resolves.not.toThrow();
    });
  });

  describe('init - fallback token registration', () => {
    beforeEach(() => {
      (window as any).Capacitor = {
        getPlatform: jest.fn().mockReturnValue('android'), // eslint-disable-line no-restricted-syntax
      };
      mockPushNotifications.requestPermissions.mockResolvedValue({ receive: 'granted' });
      mockPushNotifications.register.mockResolvedValue(undefined);
    });

    it('should use fallback registration listener if FirebaseMessaging fails', async () => {
      // Simular error en FirebaseMessaging
      mockFirebaseMessaging.getToken.mockRejectedValue(new Error('Firebase error'));

      let registrationListener: any;
      mockPushNotifications.addListener.mockImplementation((event, callback) => {
        if (event === 'registration') {
          registrationListener = callback;
          // Simular token inmediatamente
          setTimeout(() => callback({ value: 'fallback-token' }), 0);
        }
      });

      await service.init();

      expect(pushService.registrarDispositivo).toHaveBeenCalledWith(
        expect.objectContaining({
          fcmToken: 'fallback-token',
        }),
      );
    });

    it('should resolve on registrationError', async () => {
      mockFirebaseMessaging.getToken.mockRejectedValue(new Error('Firebase error'));

      let errorListener: any;
      mockPushNotifications.addListener.mockImplementation((event, callback) => {
        if (event === 'registrationError') {
          errorListener = callback;
          setTimeout(() => callback(), 0);
        }
      });

      await service.init();

      // Debería completarse sin token
      expect(pushService.registrarDispositivo).not.toHaveBeenCalled();
    });
  });

  describe('init - device registration', () => {
    beforeEach(() => {
      (window as any).Capacitor = {
        getPlatform: jest.fn().mockReturnValue('android'), // eslint-disable-line no-restricted-syntax
      };
      mockPushNotifications.requestPermissions.mockResolvedValue({ receive: 'granted' });
      mockPushNotifications.register.mockResolvedValue(undefined);
      mockFirebaseMessaging.getToken.mockResolvedValue({ token: 'test-token' });
    });

    it('should register device with Cliente document', async () => {
      userService.getUserRole.mockReturnValue('Cliente');
      userService.getUserId.mockReturnValue(12345);

      await service.init();

      expect(pushService.registrarDispositivo).toHaveBeenCalledWith({
        plataforma: 'ANDROID',
        fcmToken: 'test-token',
        locale: expect.any(String),
        timeZone: expect.any(String),
        appVersion: '1.0.0',
        subscribedTopics: ['promos', 'novedades'],
        documentoCliente: 12345,
        documentoTrabajador: undefined,
      });
    });

    it('should register device with Trabajador document', async () => {
      userService.getUserRole.mockReturnValue('Mesero');
      userService.getUserId.mockReturnValue(67890);

      await service.init();

      expect(pushService.registrarDispositivo).toHaveBeenCalledWith({
        plataforma: 'ANDROID',
        fcmToken: 'test-token',
        locale: expect.any(String),
        timeZone: expect.any(String),
        appVersion: '1.0.0',
        subscribedTopics: ['promos', 'novedades'],
        documentoCliente: undefined,
        documentoTrabajador: 67890,
      });
    });

    it('should register device without documents if user not logged in', async () => {
      userService.getUserRole.mockReturnValue(null);
      userService.getUserId.mockReturnValue(null);

      await service.init();

      expect(pushService.registrarDispositivo).toHaveBeenCalledWith({
        plataforma: 'ANDROID',
        fcmToken: 'test-token',
        locale: expect.any(String),
        timeZone: expect.any(String),
        appVersion: '1.0.0',
        subscribedTopics: ['promos', 'novedades'],
        documentoCliente: undefined,
        documentoTrabajador: undefined,
      });
    });

    it('should include navigator.language in payload', async () => {
      Object.defineProperty(navigator, 'language', {
        writable: true,
        configurable: true,
        value: 'en-US',
      });

      await service.init();

      expect(pushService.registrarDispositivo).toHaveBeenCalledWith(
        expect.objectContaining({
          locale: 'en-US',
        }),
      );
    });
  });

  describe('init - error handling', () => {
    it('should handle errors gracefully in top-level try-catch', async () => {
      (window as any).Capacitor = {
        getPlatform: jest.fn().mockReturnValue('android'), // eslint-disable-line no-restricted-syntax
      };

      mockPushNotifications.requestPermissions.mockRejectedValue(new Error('Fatal error'));

      // Debería completarse sin lanzar error
      await expect(service.init()).resolves.not.toThrow();
    });

    it('should handle errors in PushNotifications.register', async () => {
      (window as any).Capacitor = {
        getPlatform: jest.fn().mockReturnValue('android'), // eslint-disable-line no-restricted-syntax
      };

      mockPushNotifications.requestPermissions.mockResolvedValue({ receive: 'granted' });
      mockPushNotifications.register.mockRejectedValue(new Error('Register error'));

      // Debería completarse sin lanzar error (manejo silencioso)
      await expect(service.init()).resolves.not.toThrow();
    });
  });
});
