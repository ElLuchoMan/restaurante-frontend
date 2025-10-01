import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';

import { WebPushService } from '../../../core/services/web-push.service';

@Component({
  selector: 'app-notification-prompt',
  imports: [CommonModule],
  template: `
    <div class="notification-prompt" *ngIf="showPrompt">
      <div class="notification-prompt__content">
        <div class="notification-prompt__icon">
          <i class="fa fa-bell" aria-hidden="true"></i>
        </div>
        <div class="notification-prompt__text">
          <h3>Recibe nuestras notificaciones</h3>
          <p>Entérate de promociones, ofertas y novedades al instante</p>
        </div>
        <div class="notification-prompt__actions">
          <button
            type="button"
            class="btn btn-primary"
            (click)="enableNotifications()"
            [disabled]="requesting"
          >
            <i class="fa fa-bell" aria-hidden="true"></i>
            {{ requesting ? 'Activando...' : 'Activar' }}
          </button>
          <button type="button" class="btn btn-link" (click)="dismiss()">Ahora no</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .notification-prompt {
        position: fixed;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1050;
        width: calc(100% - 2rem);
        max-width: 500px;
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          transform: translate(-50%, 100%);
          opacity: 0;
        }
        to {
          transform: translate(-50%, 0);
          opacity: 1;
        }
      }

      .notification-prompt__content {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border: 1px solid #e5e7eb;
      }

      .notification-prompt__icon {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;

        i {
          font-size: 2.5rem;
          color: var(--primary);
        }
      }

      .notification-prompt__text {
        text-align: center;
        margin-bottom: 1.5rem;

        h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-title);
          margin: 0 0 0.5rem;
        }

        p {
          font-size: 0.9rem;
          color: var(--text-body);
          margin: 0;
        }
      }

      .notification-prompt__actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .btn {
          width: 100%;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
        }

        .btn-link {
          background: transparent;
          border: none;
          color: var(--text-muted);
          text-decoration: none;
          padding: 0.5rem;

          &:hover {
            color: var(--text-body);
            text-decoration: underline;
          }
        }
      }

      @media (min-width: 768px) {
        .notification-prompt {
          bottom: 2rem;
          right: 2rem;
          left: auto;
          transform: none;
          max-width: 400px;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      }
    `,
  ],
})
export class NotificationPromptComponent implements OnInit {
  showPrompt = false;
  requesting = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private webPush: WebPushService,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Verificar si debe mostrar el prompt
    setTimeout(() => {
      this.checkShouldShowPrompt();
    }, 3000); // Esperar 3 segundos antes de mostrar
  }

  private checkShouldShowPrompt(): void {
    // No mostrar si no es soportado
    if (!this.webPush.isSupported()) {
      return;
    }

    // No mostrar si ya tiene permisos
    const permission = this.webPush.getPermissionStatus();
    if (permission === 'granted') {
      return;
    }

    // No mostrar si ya fue denegado
    if (permission === 'denied') {
      return;
    }

    // No mostrar si el usuario ya cerró el prompt antes
    const dismissed = localStorage.getItem('notification-prompt-dismissed');
    if (dismissed === 'true') {
      return;
    }

    this.showPrompt = true;
  }

  async enableNotifications(): Promise<void> {
    this.requesting = true;

    try {
      const success = await this.webPush.requestPermissionAndSubscribe();

      if (success) {
        console.log('[NotificationPrompt] Notificaciones activadas exitosamente');
        this.showPrompt = false;
        // Guardar que el usuario activó notificaciones
        localStorage.setItem('notification-prompt-dismissed', 'true');
      } else {
        console.warn('[NotificationPrompt] No se pudieron activar las notificaciones');
        // Si fue denegado, no mostrar más el prompt
        const permissionStatus = this.webPush.getPermissionStatus();
        if (permissionStatus === 'denied') {
          this.showPrompt = false;
          localStorage.setItem('notification-prompt-dismissed', 'true');
        }
        // Si simplemente falló pero no fue denegado, mantener el prompt visible
        // para que el usuario pueda intentar de nuevo
      }
    } catch (error) {
      console.error('[NotificationPrompt] Error al activar notificaciones:', error);
      // En caso de error, no cerrar el prompt para permitir reintentar
    } finally {
      this.requesting = false;
    }
  }

  dismiss(): void {
    this.showPrompt = false;
    localStorage.setItem('notification-prompt-dismissed', 'true');
  }
}
