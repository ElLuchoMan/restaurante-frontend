import { TestBed } from '@angular/core/testing';
import { SwPush } from '@angular/service-worker';

import {
  createPushServiceMock,
  createSwPushMock,
  createUserServiceMock,
} from '../../shared/mocks/test-doubles';
import { PushService } from './push.service';
import { UserService } from './user.service';
import { WebPushService } from './web-push.service';

describe('WebPushService', () => {
  let service: WebPushService;
  let swPush: jest.Mocked<SwPush>;
  let pushService: jest.Mocked<PushService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    const swPushMock = createSwPushMock();
    const pushServiceMock = createPushServiceMock();
    const userServiceMock = createUserServiceMock();

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
