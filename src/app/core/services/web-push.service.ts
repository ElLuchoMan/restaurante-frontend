import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { RegistrarDispositivoRequest } from '../../shared/models/push.model';
import { browserLocation } from '../../shared/utils/browser-location';
import { PushService } from './push.service';
import { UserService } from './user.service';

/** El backend rechazó el registro: 403 (dueño distinto al del token) o 404 (la cuenta ya no existe). */
function rechazoDeSesion(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  return code === 403 || code === 404;
}

@Injectable({ providedIn: 'root' })
export class WebPushService {
  constructor(
    private swPush: SwPush,
    private pushService: PushService,
    private userService: UserService,
  ) {}

  /**
   * Verifica si estamos en un navegador web (no WebView)
   */
  private isWebBrowser(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    const cap = (window as unknown as { Capacitor?: { getPlatform?: unknown } }).Capacitor;
    const isCapacitor = !!(cap && typeof cap.getPlatform === 'function');
    return !isCapacitor;
  }

  /**
   * Verifica si el navegador soporta notificaciones
   */
  isSupported(): boolean {
    return (
      this.isWebBrowser() &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    );
  }

  /**
   * Obtiene el estado actual de los permisos de notificación
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Solicita permisos y registra el dispositivo para notificaciones push
   */
  async requestPermissionAndSubscribe(): Promise<boolean> {
    try {
      if (!this.isSupported()) {
        console.warn('[WebPush] Notificaciones no soportadas en este navegador');
        alert(
          '❌ Tu navegador no soporta notificaciones push.\nPor favor usa Chrome, Firefox o Edge actualizados.',
        );
        return false;
      }

      // Verificar si Service Worker está habilitado
      if (!this.swPush.isEnabled) {
        console.error('[WebPush] Service Worker no está habilitado');
        alert(
          '⚠️ El Service Worker no está habilitado.\n\nPara desarrollo:\n1. Ejecuta: npm run build\n2. Sirve con: npx http-server dist/restaurante-frontend/browser -p 8080\n3. Abre: http://localhost:8080',
        );
        return false;
      }

      // Verificar si ya tiene permisos
      if (Notification.permission === 'granted') {
        console.log('[WebPush] Ya tiene permisos, procediendo a suscribir...');
        return await this.subscribe();
      }

      // Solicitar permisos
      console.log('[WebPush] Solicitando permisos...');
      const permission = await Notification.requestPermission();
      console.log('[WebPush] Permiso otorgado:', permission);

      if (permission !== 'granted') {
        console.warn('[WebPush] Permisos de notificación denegados por el usuario');
        alert(
          '❌ Permisos denegados.\n\nSi quieres activar las notificaciones:\n1. Haz clic en el icono 🔒 en la barra de direcciones\n2. Cambia "Notificaciones" a "Permitir"',
        );
        return false;
      }

      return await this.subscribe();
    } catch (error) {
      console.error('[WebPush] Error en requestPermissionAndSubscribe:', error);
      alert(
        `❌ Error al activar notificaciones:\n${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
      return false;
    }
  }

  /**
   * Se suscribe a las notificaciones push
   */
  private async subscribe(): Promise<boolean> {
    try {
      if (!this.swPush.isEnabled) {
        console.warn('[WebPush] Service Worker no está habilitado');
        return false;
      }

      console.log('[WebPush] Solicitando suscripción al Service Worker...');

      // Suscribirse al push manager
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: this.getVAPIDPublicKey(),
      });

      console.log('[WebPush] Suscripción obtenida del SW');

      // Extraer las credenciales de la suscripción
      const subscriptionJson = subscription.toJSON();
      const endpoint = subscriptionJson.endpoint;
      const keys = subscriptionJson.keys;

      if (!endpoint || !keys?.['p256dh'] || !keys?.['auth']) {
        console.error('[WebPush] Suscripción inválida: faltan endpoint o claves');
        alert('❌ Error: Suscripción inválida. Faltan credenciales push.');
        return false;
      }

      console.log('[WebPush] Credenciales obtenidas, registrando en backend...');

      // Registrar el dispositivo en el backend: el dueño lo fija el servidor a partir del token
      const doc = this.userService.getUserId?.();

      if (typeof doc !== 'number' || doc <= 0) {
        // El backend asigna el dispositivo al usuario del token: sin sesión no se registra.
        console.warn(
          '[WebPush] Sin sesión: registro del dispositivo diferido hasta iniciar sesión',
        );
        return false;
      }

      const payload: RegistrarDispositivoRequest = {
        plataforma: 'WEB' as const,
        endpoint,
        p256dh: keys['p256dh'],
        auth: keys['auth'],
        locale: (typeof navigator !== 'undefined' && navigator.language) || 'es-CO',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        appVersion: '1.0.0',
        userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) || '',
        subscribedTopics: ['promos', 'novedades'],
      };

      await firstValueFrom(this.pushService.registrarDispositivo(payload));
      console.log('[WebPush] ✅ Dispositivo registrado exitosamente en el backend');

      // Escuchar mensajes push
      this.listenToPushMessages();

      alert(
        '✅ ¡Notificaciones activadas correctamente!\n\nAhora recibirás promociones y ofertas.',
      );

      return true;
    } catch (error) {
      console.error('[WebPush] Error al suscribirse:', error);

      if (rechazoDeSesion(error)) {
        // 403/404 del registro: el servidor no acepta el dispositivo con la sesión actual
        alert(
          '❌ No se pudo registrar este dispositivo con tu sesión actual.\nCierra sesión, vuelve a ingresar e intenta de nuevo.',
        );
      } else if (error instanceof Error && error.message.includes('VAPID')) {
        // Error específico de VAPID
        alert(
          '❌ Error de configuración VAPID.\n\nLa clave pública VAPID no es válida.\nContacta al administrador del sistema.',
        );
      } else if (error instanceof Error && error.message.includes('backend')) {
        alert('❌ Error al registrar en el servidor.\nIntenta nuevamente más tarde.');
      } else {
        alert(
          `❌ Error al activar notificaciones:\n${error instanceof Error ? error.message : 'Error desconocido'}`,
        );
      }

      return false;
    }
  }

  /**
   * Escucha los mensajes push entrantes
   */
  private listenToPushMessages(): void {
    this.swPush.messages.subscribe((message: any) => {
      const { notification, data } = message;

      if (notification) {
        this.showNotification(
          notification.title || 'Notificación',
          notification.body || '',
          data || {},
        );
      }
    });

    // Escuchar clics en notificaciones
    this.swPush.notificationClicks.subscribe(({ action, notification }) => {
      const url = notification.data?.url;
      if (url && typeof window !== 'undefined') {
        browserLocation.assign(url);
      }
    });
  }

  /**
   * Muestra una notificación en el navegador
   */
  showNotification(title: string, body: string, data?: any): void {
    if (
      !this.isSupported() ||
      typeof window === 'undefined' ||
      Notification.permission !== 'granted'
    ) {
      return;
    }

    const options: NotificationOptions = {
      body,
      icon: '/icons/web-app-manifest-192x192.png',
      badge: '/icons/web-app-manifest-192x192.png',
      data: data || {},
      requireInteraction: false,
      tag: data?.tipo || 'general',
    };

    // Intentar mostrar a través del Service Worker
    if (
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator &&
      navigator.serviceWorker.controller
    ) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      });
    } else {
      // Fallback: notificación directa
      new Notification(title, options);
    }
  }

  /**
   * Cancela la suscripción a notificaciones push
   */
  async unsubscribe(): Promise<void> {
    try {
      await this.swPush.unsubscribe();
      console.log('[WebPush] Desuscrito exitosamente');
    } catch (error) {
      console.error('[WebPush] Error al desuscribirse:', error);
    }
  }

  /**
   * Obtiene la clave pública VAPID configurada en las variables de entorno
   */
  private getVAPIDPublicKey(): string {
    return environment.vapidPublicKey;
  }
}
