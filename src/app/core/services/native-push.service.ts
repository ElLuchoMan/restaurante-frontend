import { Injectable } from '@angular/core';

import { PushService } from './push.service';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class NativePushService {
  constructor(
    private pushService: PushService,
    private userService: UserService,
  ) {}

  private listenersBound = false;

  private isNativeWebView(): boolean {
    const cap: any = (window as any).Capacitor;
    return !!(cap && typeof cap.getPlatform === 'function' && cap.getPlatform() !== 'web');
  }

  async init(): Promise<void> {
    if (!this.isNativeWebView()) return;

    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      try {
        // Pedir permisos y registrar canal nativo
        const perm = await PushNotifications.requestPermissions();
        if (perm.receive !== 'granted') return;
        await PushNotifications.register();

        // Android 8+: asegurar canal para notificaciones visibles
        try {
          await PushNotifications.createChannel({
            id: 'default',
            name: 'General',
            description: 'Notificaciones generales',
            importance: 5, // IMPORTANCE_HIGH
            visibility: 1, // VISIBILITY_PUBLIC
            sound: 'default',
            lights: true,
            vibration: true,
          } as any);
        } catch {}

        // Listener foreground via PushNotifications removido para evitar duplicados con FirebaseMessaging

        // Listener: acción sobre la notificación (tap)
        try {
          PushNotifications.addListener('pushNotificationActionPerformed', async (ev) => {
            const url = (ev?.notification?.data as any)?.url;
            console.log(
              '[Push] Notification tapped. URL:',
              url,
              'Full data:',
              ev?.notification?.data,
            );
            if (typeof url === 'string' && url) {
              // Emitir evento para que AppComponent lo maneje
              try {
                window.dispatchEvent(
                  new CustomEvent('push-notification-action', { detail: { url } }),
                );
              } catch (e) {
                console.error('[Push] Error dispatching navigation event:', e);
              }
            }
          });
        } catch (e) {
          console.error('[Push] Error setting up action listener:', e);
        }
      } catch {}

      // Intentar obtener token vía Capacitor Firebase Messaging (FCM)
      let fcmToken: string | undefined;
      try {
        const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');

        try {
          await FirebaseMessaging.requestPermissions();
        } catch {}

        const tokenRes: { token?: string } = (await FirebaseMessaging.getToken()) as any;
        fcmToken = tokenRes?.token || undefined;

        // Listener nativo de FirebaseMessaging en foreground (único)
        if (!this.listenersBound) {
          this.listenersBound = true;
          try {
            FirebaseMessaging.addListener('notificationReceived', async (notification: any) => {
              const title =
                notification?.notification?.title || notification?.title || 'Notificación';
              const body = notification?.notification?.body || notification?.body || '';
              const data = notification?.data || {};
              // Guardar en el centro local si es posible
              try {
                const { addNotification } = await import(
                  '../../shared/utils/notification-center.store'
                );
                addNotification({ title, body, data });
              } catch {}
              // Solo notificación local si app visible (evitar duplicado con notificación del sistema en background)
              try {
                if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                  const { LocalNotifications } = await import('@capacitor/local-notifications');
                  try {
                    await LocalNotifications.requestPermissions();
                  } catch {}
                  await LocalNotifications.schedule({
                    notifications: [
                      {
                        id: Date.now() % 100000,
                        title,
                        body,
                        extra: data,
                        channelId: 'default',
                        // Android: forzar small icon personalizado (PNG en drawable-*dpi)
                        smallIcon: 'ic_stat_notification',
                      },
                    ],
                  });
                }
              } catch {}
            });
          } catch {}
        }
      } catch {
        // Fallback: usar evento de registro estándar si no está disponible el plugin de Firebase
        await new Promise<void>((resolve) => {
          PushNotifications.addListener('registration', async (token) => {
            fcmToken = token?.value || undefined;
            resolve();
          });
          // También escuchar errores para no bloquear
          PushNotifications.addListener('registrationError', () => resolve());
        });
      }

      if (!fcmToken) {
        try {
          console.warn('[Push] No FCM token');
        } catch {}
        return;
      }
      try {
        console.log('[Push] FCM token', fcmToken);
      } catch {}

      // Resolver identidad actual (cliente o trabajador) si hay sesión
      const role = this.userService.getUserRole?.();
      const doc = this.userService.getUserId?.();
      const isCliente = role === 'Cliente';
      const documentoCliente = isCliente && typeof doc === 'number' ? doc : undefined;
      const documentoTrabajador = !isCliente && typeof doc === 'number' ? doc : undefined;

      const payload: any = {
        plataforma: 'ANDROID',
        fcmToken,
        locale: (navigator && navigator.language) || 'es-CO',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        appVersion: '1.0.0',
        subscribedTopics: ['promos', 'novedades'] as string[],
        documentoCliente,
        documentoTrabajador,
      } as const;

      // Si no hay documento aún (usuario no logueado), registrar sin documento y dejar token activo
      await this.pushService.registrarDispositivo(payload).toPromise();
    } catch (e) {
      // Silencioso en web o si faltan plugins; logging mínimo en consola para debug manual
      try {
        console.warn('[NativePushService] init error', e);
      } catch {}
    }
  }
}
