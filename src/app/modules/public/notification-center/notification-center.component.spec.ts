import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import {
  mockNotificationCalificacion,
  mockNotificationDefault,
  mockNotificationPedido,
  mockNotificationPromocion,
  mockNotificationReserva,
  mockNotifications,
  mockNotificationWithoutUrl,
} from '../../../shared/mocks/notification.mock';
import { createRouterMock } from '../../../shared/mocks/test-doubles';
import * as NotificationStore from '../../../shared/utils/notification-center.store';
import { NotificationCenterComponent } from './notification-center.component';

describe('NotificationCenterComponent', () => {
  let component: NotificationCenterComponent;
  let fixture: ComponentFixture<NotificationCenterComponent>;
  let router: jest.Mocked<Router>;

  // Spies para las funciones del store
  let getNotificationsSpy: jest.SpyInstance;
  let markAllSeenSpy: jest.SpyInstance;
  let clearNotificationsSpy: jest.SpyInstance;

  beforeEach(async () => {
    const routerMock = createRouterMock();

    await TestBed.configureTestingModule({
      imports: [NotificationCenterComponent],
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationCenterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;

    // Mock de las funciones del store
    getNotificationsSpy = jest
      .spyOn(NotificationStore, 'getNotifications')
      .mockReturnValue(mockNotifications);
    markAllSeenSpy = jest.spyOn(NotificationStore, 'markAllSeen').mockImplementation();
    clearNotificationsSpy = jest
      .spyOn(NotificationStore, 'clearNotifications')
      .mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load notifications on init', () => {
      component.ngOnInit();

      expect(getNotificationsSpy).toHaveBeenCalled();
      expect(component.items).toEqual(mockNotifications);
    });

    it('should mark all notifications as seen', () => {
      component.ngOnInit();

      expect(markAllSeenSpy).toHaveBeenCalled();
    });

    it('should add event listener for notification updates', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

      component.ngOnInit();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'notification-center:update',
        component['updateListener'],
      );
    });

    it('should reload notifications when update event is triggered', () => {
      component.ngOnInit();

      const newMockNotifications = [mockNotificationReserva];
      getNotificationsSpy.mockReturnValue(newMockNotifications);

      // Disparar el evento
      window.dispatchEvent(new CustomEvent('notification-center:update'));

      expect(getNotificationsSpy).toHaveBeenCalled();
      expect(component.items).toEqual(newMockNotifications);
    });
  });

  describe('ngOnDestroy', () => {
    it('should remove event listener on destroy', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      component.ngOnInit(); // Necesario para que updateListener esté registrado
      component.ngOnDestroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'notification-center:update',
        component['updateListener'],
      );
    });
  });

  describe('loadNotifications', () => {
    it('should load notifications from store', () => {
      component.loadNotifications();

      expect(getNotificationsSpy).toHaveBeenCalled();
      expect(component.items).toEqual(mockNotifications);
    });

    it('should update items when store returns empty array', () => {
      getNotificationsSpy.mockReturnValue([]);

      component.loadNotifications();

      expect(component.items).toEqual([]);
    });
  });

  describe('open', () => {
    it('should navigate to notification URL when URL is present', () => {
      component.open(mockNotificationReserva);

      expect(router.navigateByUrl).toHaveBeenCalledWith('/cliente/reservas');
    });

    it('should navigate to pedido URL', () => {
      component.open(mockNotificationPedido);

      expect(router.navigateByUrl).toHaveBeenCalledWith('/cliente/mis-pedidos');
    });

    it('should not navigate when notification has no URL', () => {
      component.open(mockNotificationWithoutUrl);

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate when notification data is null', () => {
      const notificationWithoutData = { ...mockNotificationReserva, data: null };

      component.open(notificationWithoutData as any);

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate when URL is not a string', () => {
      const notificationWithInvalidUrl = {
        ...mockNotificationReserva,
        data: { url: 123 },
      };

      component.open(notificationWithInvalidUrl as any);

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should not navigate when URL is empty string', () => {
      const notificationWithEmptyUrl = {
        ...mockNotificationReserva,
        data: { url: '' },
      };

      component.open(notificationWithEmptyUrl as any);

      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear notifications from store', () => {
      component.clear();

      expect(clearNotificationsSpy).toHaveBeenCalled();
    });

    it('should reload notifications after clearing', () => {
      getNotificationsSpy.mockReturnValue([]);

      component.clear();

      expect(getNotificationsSpy).toHaveBeenCalled();
      expect(component.items).toEqual([]);
    });
  });

  describe('getNotificationIcon', () => {
    it('should return calendar icon for RESERVA type', () => {
      const icon = component.getNotificationIcon(mockNotificationReserva);

      expect(icon).toBe('fa-calendar-check');
    });

    it('should return shopping bag icon for PEDIDO type', () => {
      const icon = component.getNotificationIcon(mockNotificationPedido);

      expect(icon).toBe('fa-shopping-bag');
    });

    it('should return tag icon for PROMOCION type', () => {
      const icon = component.getNotificationIcon(mockNotificationPromocion);

      expect(icon).toBe('fa-tag');
    });

    it('should return star icon for CALIFICACION type', () => {
      const icon = component.getNotificationIcon(mockNotificationCalificacion);

      expect(icon).toBe('fa-star');
    });

    it('should return bell icon for unknown type', () => {
      const icon = component.getNotificationIcon(mockNotificationDefault);

      expect(icon).toBe('fa-bell');
    });

    it('should return bell icon when notification has no data', () => {
      const notificationWithoutData = { ...mockNotificationReserva, data: null };

      const icon = component.getNotificationIcon(notificationWithoutData as any);

      expect(icon).toBe('fa-bell');
    });

    it('should return bell icon when notification has no tipo', () => {
      const notificationWithoutTipo = {
        ...mockNotificationReserva,
        data: { otherField: 'value' },
      };

      const icon = component.getNotificationIcon(notificationWithoutTipo as any);

      expect(icon).toBe('fa-bell');
    });
  });

  describe('getNotificationColor', () => {
    it('should return reserva color for RESERVA type', () => {
      const color = component.getNotificationColor(mockNotificationReserva);

      expect(color).toBe('notification-reserva');
    });

    it('should return pedido color for PEDIDO type', () => {
      const color = component.getNotificationColor(mockNotificationPedido);

      expect(color).toBe('notification-pedido');
    });

    it('should return promo color for PROMOCION type', () => {
      const color = component.getNotificationColor(mockNotificationPromocion);

      expect(color).toBe('notification-promo');
    });

    it('should return calificacion color for CALIFICACION type', () => {
      const color = component.getNotificationColor(mockNotificationCalificacion);

      expect(color).toBe('notification-calificacion');
    });

    it('should return default color for unknown type', () => {
      const color = component.getNotificationColor(mockNotificationDefault);

      expect(color).toBe('notification-default');
    });

    it('should return default color when notification has no data', () => {
      const notificationWithoutData = { ...mockNotificationReserva, data: null };

      const color = component.getNotificationColor(notificationWithoutData as any);

      expect(color).toBe('notification-default');
    });

    it('should return default color when notification has no tipo', () => {
      const notificationWithoutTipo = {
        ...mockNotificationReserva,
        data: { otherField: 'value' },
      };

      const color = component.getNotificationColor(notificationWithoutTipo as any);

      expect(color).toBe('notification-default');
    });
  });

  describe('goBack', () => {
    it('should navigate to home', () => {
      component.goBack();

      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
  });
});
