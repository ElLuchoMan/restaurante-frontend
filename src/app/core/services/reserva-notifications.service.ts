import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { estadoReserva } from '../../shared/constants';
import { ApiResponse } from '../../shared/models/api-response.model';
import { EnviarNotificacionRequest } from '../../shared/models/push.model';
import { PushService } from './push.service';
import { UserService } from './user.service';

/** Datos mínimos de una reserva para notificar al cliente (se extraen de `ReservaBase`). */
export interface ReservaNotificable {
  reservaId: number;
  /** DD-MM-YYYY (respuesta del backend) o YYYY-MM-DD. */
  fechaReserva: string;
  horaReserva: string;
  /** Documento del cliente registrado; sin él se usa el del usuario autenticado. */
  documentoCliente?: number | null;
}

@Injectable({ providedIn: 'root' })
export class ReservaNotificationsService {
  constructor(
    private pushService: PushService,
    private userService: UserService,
  ) {}

  /** El backend devuelve las fechas como DD-MM-YYYY; los requests usan YYYY-MM-DD. */
  private normalizarFecha(fecha?: string): string | undefined {
    const m = fecha ? /^(\d{2})-(\d{2})-(\d{4})$/.exec(fecha) : null;
    return m ? `${m[3]}-${m[2]}-${m[1]}` : fecha;
  }

  private formatDateTime(fechaRaw?: string, hora?: string): { fecha: string; hora: string } {
    const fechaISO = this.normalizarFecha(fechaRaw);
    try {
      const base = fechaISO ? `${fechaISO}T${hora || '00:00:00'}` : undefined;
      const d = base ? new Date(base) : new Date();
      const fecha = new Intl.DateTimeFormat('es-CO', {
        day: '2-digit',
        month: '2-digit',
      }).format(d);
      const horaTxt = new Intl.DateTimeFormat('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(d);
      return { fecha, hora: horaTxt };
    } catch {
      return { fecha: fechaRaw || '', hora: hora || '' };
    }
  }

  private buildEstadoMessage(
    nuevoEstado: estadoReserva,
    fechaISO?: string,
    hora?: string,
  ): { titulo: string; mensaje: string } {
    const { fecha, hora: horaTxt } = this.formatDateTime(fechaISO, hora);
    switch (nuevoEstado) {
      case estadoReserva.CONFIRMADA:
        return {
          titulo: 'Reserva confirmada',
          mensaje: `Tu reserva para el ${fecha} a las ${horaTxt} quedó confirmada. ¡Te esperamos!`,
        };
      case estadoReserva.CANCELADA:
        return {
          titulo: 'Reserva cancelada',
          mensaje: `Tu reserva del ${fecha} a las ${horaTxt} fue cancelada. Si necesitas ayuda, contáctanos.`,
        };
      case estadoReserva.CUMPLIDA:
        return {
          titulo: '¡Gracias por visitarnos!',
          mensaje: '¿Nos dejas tu opinión? Te tomará 30 segundos.',
        };
      case estadoReserva.PENDIENTE:
      default:
        return {
          titulo: 'Recibimos tu solicitud',
          mensaje: `Estamos validando tu reserva del ${fecha} ${horaTxt}. Te contactaremos para confirmar.`,
        };
    }
  }

  /** Documento del destinatario: el de la reserva o, si falta, el del usuario autenticado. */
  private resolverDocumento(reserva: ReservaNotificable): number | null {
    const documento = reserva.documentoCliente ?? this.userService.getUserId?.();
    if (!documento || isNaN(Number(documento))) return null;
    return Number(documento);
  }

  private enviar(
    documentoCliente: number,
    reserva: ReservaNotificable,
    estado: string,
    titulo: string,
    mensaje: string,
  ): Promise<ApiResponse<unknown>> {
    const payload: EnviarNotificacionRequest = {
      remitente: { tipo: 'SISTEMA' },
      destinatarios: { tipo: 'CLIENTE', documentoCliente },
      notificacion: {
        titulo,
        mensaje,
        datos: {
          tipo: 'RESERVA',
          reservaId: reserva.reservaId,
          estado,
          url: `/reservas/consultar?reservaId=${encodeURIComponent(String(reserva.reservaId))}`,
        },
      },
    };
    return firstValueFrom(this.pushService.enviarNotificacion(payload));
  }

  async notifyEstadoCambio(
    reserva: ReservaNotificable,
    nuevoEstado: estadoReserva,
  ): Promise<ApiResponse<unknown> | null> {
    const documento = this.resolverDocumento(reserva);
    if (documento === null) return null;
    const { titulo, mensaje } = this.buildEstadoMessage(
      nuevoEstado,
      reserva.fechaReserva,
      reserva.horaReserva,
    );
    return this.enviar(documento, reserva, nuevoEstado, titulo, mensaje);
  }

  async notifyCreacion(reserva: ReservaNotificable): Promise<ApiResponse<unknown> | null> {
    const documento = this.resolverDocumento(reserva); // Solo registrados
    if (documento === null) return null;
    const { fecha, hora } = this.formatDateTime(reserva.fechaReserva, reserva.horaReserva);
    return this.enviar(
      documento,
      reserva,
      'PENDIENTE',
      'Reserva creada',
      `Recibimos tu solicitud para el ${fecha} ${hora}. Te llamaremos días antes para confirmar.`,
    );
  }
}
