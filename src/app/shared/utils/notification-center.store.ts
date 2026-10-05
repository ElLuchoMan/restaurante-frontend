export interface NotificationItem {
  id: number;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

const KEY = 'notification_center_items';
const KEY_LAST_SEEN = 'notification_center_last_seen';

// Helper para verificar si estamos en el navegador
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function getNotifications(): NotificationItem[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as NotificationItem[]) : [];
  } catch {
    return [];
  }
}

export function addNotification(
  n: Omit<NotificationItem, 'id' | 'createdAt'> & Partial<NotificationItem>,
): void {
  if (!isBrowser()) return;

  const items = getNotifications();
  const id = Date.now() % 100000000;
  const createdAt = new Date().toISOString();
  items.unshift({ id, createdAt, title: n.title, body: n.body, data: n.data });
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, 50)));
  try {
    window.dispatchEvent(new CustomEvent('notification-center:update'));
  } catch {}
}

export function clearNotifications(): void {
  if (!isBrowser()) return;

  localStorage.removeItem(KEY);
  try {
    window.dispatchEvent(new CustomEvent('notification-center:update'));
  } catch {}
}

export function markAllSeen(): void {
  if (!isBrowser()) return;

  const now = new Date().toISOString();
  localStorage.setItem(KEY_LAST_SEEN, now);
  try {
    window.dispatchEvent(new CustomEvent('notification-center:update'));
  } catch {}
}

export function getUnseenCount(): number {
  if (!isBrowser()) return 0;

  const lastSeen = localStorage.getItem(KEY_LAST_SEEN);
  const items = getNotifications();
  if (!lastSeen) return items.length;
  const last = Date.parse(lastSeen);
  if (!isFinite(last)) return items.length;
  return items.filter((n) => Date.parse(n.createdAt) > last).length;
}
