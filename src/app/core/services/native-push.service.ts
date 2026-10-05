import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { RegistrarDispositivoRequest } from '../../shared/models/push.model';
import { PushService } from './push.service';
import { UserService } from './user.service';

interface CapacitorGlobal {
  getPlatform?: () => string;
}

function getCapacitor(): CapacitorGlobal | undefined {
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
}

@Injectable({ providedIn: 'root' })
export class NativePushService {
  constructor(
    private pushService: PushService,
    private userService: UserService,
  ) {}

  private listenersBound = false;

  private isNativeWebView(): boolean {
    if (typeof window === 'undefined') return false;

    const cap = getCapacitor();
    return !!(cap && typeof cap.getPlatform === 'function' && cap.getPlatform() !== 'web');
  }

  /** Plataforma que acepta el backend para FCM: IOS o ANDROID (según Capacitor). */
  private nativePlatform(): 'ANDROID' | 'IOS' {
    return getCapacitor()?.getPlatform?.() === 'ios' ? 'IOS' : 'ANDROID';
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
            const url = (ev?.notification?.data as { url?: unknown } | undefined)?.url;
            console.log(
              '[Push] Notification tapped. URL:',
              url,
              'Full data:',
              ev?.notification?.data,
            );
            if (typeof url === 'string' && url) {
              // Emitir evento para que AppComponent lo maneje
              try {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('push-notification-action', { detail: { url } }),
                  );
                }
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

        // Manejo especial para iOS donde Firebase puede no estar completamente configurado
        try {
          const tokenRes: { token?: string } = (await FirebaseMessaging.getToken()) as any;
          fcmToken = tokenRes?.token || undefined;
        } catch (e: any) {
          // En iOS, si Firebase no está configurado correctamente, usar fallback
          const isIOS = getCapacitor()?.getPlatform?.() === 'ios';
          if (isIOS && (e?.message?.includes('APNS') || e?.message?.includes('Firebase'))) {
            console.warn('[Push] Firebase no configurado en iOS, usando fallback');
            fcmToken = await this.waitForRegistrationToken();
          } else {
            throw e; // Re-throw si no es el error esperado de iOS
          }
        }

        // Listener nativo de FirebaseMessaging en foreground (único)
        if (!this.listenersBound && fcmToken) {
          // Solo si tenemos token válido
          this.listenersBound = true;
          try {
            FirebaseMessaging.addListener('notificationReceived', async (notification: any) => {
              const title =
                notification?.notification?.title || notification?.title || 'Notificación';
              const body = notification?.notification?.body || notification?.body || '';
              const data = notification?.data || {};
              // Guardar en el centro local si es posible
              try {
                const { addNotification } =
                  await import('../../shared/utils/notification-center.store');
                addNotification({ title, body, data });
              } catch {}
              // Solo notificación local si app visible (evitar duplicado con notificación del sistema en background)
              try {
                if (
                  typeof document !== 'undefined' &&
                  typeof window !== 'undefined' &&
                  document.visibilityState === 'visible'
                ) {
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
        fcmToken = await this.waitForRegistrationToken();
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

      // Resolver identidad actual (cliente o trabajador). El backend exige exactamente uno de los dos.
      const role = this.userService.getUserRole?.();
      const doc = this.userService.getUserId?.();
      if (typeof doc !== 'number' || doc <= 0) {
        // Sin sesión: no se registra (el backend rechazaría el dispositivo). AppComponent
        // vuelve a llamar a init() cuando el usuario inicia sesión.
        console.warn('[Push] Sin sesión: registro del dispositivo diferido hasta iniciar sesión');
        return;
      }
      const isCliente = role === 'Cliente';

      const payload: RegistrarDispositivoRequest = {
        plataforma: this.nativePlatform(),
        fcmToken,
        locale: (typeof navigator !== 'undefined' && navigator.language) || 'es-CO',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        appVersion: '1.0.0',
        subscribedTopics: ['promos', 'novedades'],
        ...(isCliente ? { documentoCliente: doc } : { documentoTrabajador: doc }),
      };

      await firstValueFrom(this.pushService.registrarDispositivo(payload));
    } catch (e) {
      // Silencioso en web o si faltan plugins; logging mínimo en consola para debug manual
      try {
        console.warn('[NativePushService] init error', e);
      } catch {}
    }
  }

  /** Espera el token del evento de registro estándar de PushNotifications (sin bloquear si hay error). */
  private async waitForRegistrationToken(): Promise<string | undefined> {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    return new Promise<string | undefined>((resolve) => {
      PushNotifications.addListener('registration', async (token) => {
        resolve(token?.value || undefined);
      });
      // También escuchar errores para no bloquear
      PushNotifications.addListener('registrationError', () => resolve(undefined));
    });
  }
}
