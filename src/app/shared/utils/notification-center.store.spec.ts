import {
  addNotification,
  clearNotifications,
  getNotifications,
  getUnseenCount,
  markAllSeen,
  type NotificationItem,
} from './notification-center.store';

describe('notification-center.store', () => {
  const ITEMS_KEY = 'notification_center_items';
  const LAST_SEEN_KEY = 'notification_center_last_seen';

  const runWithoutBrowser = (fn: () => void) => {
    const originalWindow = (globalThis as any).window;
    const originalLocalStorage = (globalThis as any).localStorage;
    Reflect.deleteProperty(globalThis, 'window');
    Reflect.deleteProperty(globalThis, 'localStorage');
    try {
      fn();
    } finally {
      if (originalWindow !== undefined) {
        (globalThis as any).window = originalWindow;
      }
      if (originalLocalStorage !== undefined) {
        (globalThis as any).localStorage = originalLocalStorage;
      }
    }
  };

  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('returns empty notifications when not running in a browser', () => {
    runWithoutBrowser(() => {
      expect(getNotifications()).toEqual([]);
      expect(() => addNotification({ title: 'Hello' })).not.toThrow();
      expect(() => clearNotifications()).not.toThrow();
      expect(() => markAllSeen()).not.toThrow();
      expect(getUnseenCount()).toBe(0);
    });
  });

  it('returns empty array when storage is empty', () => {
    expect(getNotifications()).toEqual([]);
  });

  it('returns empty array when stored value is invalid JSON or not an array', () => {
    window.localStorage.setItem(ITEMS_KEY, 'not-json');
    expect(getNotifications()).toEqual([]);

    window.localStorage.setItem(ITEMS_KEY, JSON.stringify({ foo: 'bar' }));
    expect(getNotifications()).toEqual([]);
  });

  it('returns stored notifications when valid', () => {
    const notifications: NotificationItem[] = [
      {
        id: 1,
        title: 'First',
        createdAt: new Date('2023-01-01T00:00:00.000Z').toISOString(),
        body: 'Hello',
      },
    ];
    window.localStorage.setItem(ITEMS_KEY, JSON.stringify(notifications));

    expect(getNotifications()).toEqual(notifications);
  });

  it('adds a notification, trims to 50 items and dispatches the update event', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
    const existing: NotificationItem[] = Array.from({ length: 55 }, (_, index) => ({
      id: index + 1,
      title: `Notification ${index + 1}`,
      createdAt: new Date('2023-01-01T00:00:00.000Z').toISOString(),
    }));
    window.localStorage.setItem(ITEMS_KEY, JSON.stringify(existing));

    addNotification({ title: 'New item', body: 'Body', data: { foo: 'bar' } });

    const stored = JSON.parse(window.localStorage.getItem(ITEMS_KEY) ?? '[]');
    expect(stored).toHaveLength(50);
    expect(stored[0]).toMatchObject({
      id: Date.now() % 100000000,
      title: 'New item',
      body: 'Body',
      data: { foo: 'bar' },
      createdAt: new Date().toISOString(),
    });
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  it('swallows dispatch errors when adding notifications', () => {
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => {
      throw new Error('fail');
    });

    expect(() => addNotification({ title: 'Broken' })).not.toThrow();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('clears notifications and notifies listeners', () => {
    window.localStorage.setItem(
      ITEMS_KEY,
      JSON.stringify([{ id: 1, title: 'To clear', createdAt: new Date().toISOString() }]),
    );
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

    clearNotifications();

    expect(window.localStorage.getItem(ITEMS_KEY)).toBeNull();
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  it('swallows dispatch errors when clearing notifications', () => {
    window.localStorage.setItem(
      ITEMS_KEY,
      JSON.stringify([{ id: 1, title: 'To clear', createdAt: new Date().toISOString() }]),
    );
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => {
      throw new Error('fail');
    });

    expect(() => clearNotifications()).not.toThrow();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('marks all as seen and notifies listeners', () => {
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

    markAllSeen();

    expect(window.localStorage.getItem(LAST_SEEN_KEY)).toBe(new Date().toISOString());
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(CustomEvent));
  });

  it('swallows dispatch errors when marking all as seen', () => {
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent').mockImplementation(() => {
      throw new Error('fail');
    });

    expect(() => markAllSeen()).not.toThrow();
    expect(dispatchSpy).toHaveBeenCalled();
  });

  it('computes unseen count when not seen timestamp is missing or invalid', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z').toISOString();
    window.localStorage.setItem(
      ITEMS_KEY,
      JSON.stringify([
        { id: 1, title: 'First', createdAt },
        { id: 2, title: 'Second', createdAt },
      ]),
    );

    expect(getUnseenCount()).toBe(2);

    window.localStorage.setItem(LAST_SEEN_KEY, 'not-a-date');
    expect(getUnseenCount()).toBe(2);
  });

  it('computes unseen count when items are newer than the last seen timestamp', () => {
    const older = new Date('2024-01-01T00:00:00.000Z').toISOString();
    const newer = new Date('2024-01-02T00:00:00.000Z').toISOString();
    window.localStorage.setItem(
      ITEMS_KEY,
      JSON.stringify([
        { id: 1, title: 'Old', createdAt: older },
        { id: 2, title: 'New', createdAt: newer },
      ]),
    );
    window.localStorage.setItem(LAST_SEEN_KEY, older);

    expect(getUnseenCount()).toBe(1);
  });
});
