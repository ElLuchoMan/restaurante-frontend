import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { estadoReserva } from '../../shared/constants';
import { ApiResponse } from '../../shared/models/api-response.model';
import { EnviarNotificacionRequest } from '../../shared/models/push.model';
import { ReservaPopulada } from '../../shared/models/reserva.model';
import { PushService } from './push.service';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class ReservaNotificationsService {
  constructor(
    private pushService: PushService,
    private userService: UserService,
  ) {}

  private formatDateTime(fechaISO?: string, hora?: string): { fecha: string; hora: string } {
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
      return { fecha: fechaISO || '', hora: hora || '' };
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

  async notifyEstadoCambio(
    reserva: Pick<
      ReservaPopulada,
      'fechaReserva' | 'horaReserva' | 'documentoCliente' | 'reservaId'
    >,
    nuevoEstado: estadoReserva,
  ): Promise<ApiResponse<unknown> | null> {
    console.log('[Reservas] Notificando estado cambio:', nuevoEstado);
    let documento: number | { documentoCliente?: number; documento?: number } | null | undefined =
      (reserva?.documentoCliente as
        | number
        | { documentoCliente?: number; documento?: number }
        | null
        | undefined) ?? this.userService.getUserId?.();
    if (documento && typeof documento === 'object') {
      documento =
        (documento as { documentoCliente?: number; documento?: number }).documentoCliente ??
        (documento as { documentoCliente?: number; documento?: number }).documento ??
        null;
    }
    if (!documento || isNaN(Number(documento))) return null;
    const { titulo, mensaje } = this.buildEstadoMessage(
      nuevoEstado,
      reserva?.fechaReserva,
      reserva?.horaReserva,
    );
    const payload: EnviarNotificacionRequest = {
      remitente: { tipo: 'SISTEMA' },
      destinatarios: { tipo: 'CLIENTE', documentoCliente: Number(documento) },
      notificacion: {
        titulo,
        mensaje,
        datos: {
          tipo: 'RESERVA',
          reservaId: reserva?.reservaId,
          estado: nuevoEstado,
          url: `/reservas/consultar?reservaId=${encodeURIComponent(String(reserva?.reservaId ?? ''))}`,
        },
      },
    };
    try {
      console.log('[Reservas] Enviando notificación estado:', payload);
    } catch {}
    return await firstValueFrom(this.pushService.enviarNotificacion(payload));
  }

  async notifyCreacion(
    reserva: Pick<
      ReservaPopulada,
      'fechaReserva' | 'horaReserva' | 'documentoCliente' | 'reservaId'
    >,
  ): Promise<ApiResponse<unknown> | null> {
    let documento: number | { documentoCliente?: number; documento?: number } | null | undefined =
      (reserva?.documentoCliente as
        | number
        | { documentoCliente?: number; documento?: number }
        | null
        | undefined) ?? this.userService.getUserId?.();
    if (documento && typeof documento === 'object') {
      documento =
        (documento as { documentoCliente?: number; documento?: number }).documentoCliente ??
        (documento as { documentoCliente?: number; documento?: number }).documento ??
        null;
    }
    if (!documento || isNaN(Number(documento))) return null; // Solo registrados
    const { fecha, hora } = this.formatDateTime(reserva?.fechaReserva, reserva?.horaReserva);
    const titulo = 'Reserva creada';
    const mensaje = `Recibimos tu solicitud para el ${fecha} ${hora}. Te llamaremos días antes para confirmar.`;
    const payload: EnviarNotificacionRequest = {
      remitente: { tipo: 'SISTEMA' },
      destinatarios: { tipo: 'CLIENTE', documentoCliente: Number(documento) },
      notificacion: {
        titulo,
        mensaje,
        datos: {
          tipo: 'RESERVA',
          reservaId: reserva?.reservaId,
          estado: 'PENDIENTE',
          url: `/reservas/consultar?reservaId=${encodeURIComponent(String(reserva?.reservaId ?? ''))}`,
        },
      },
    };
    try {
      console.log('[Reservas] Enviando notificación creación:', payload);
    } catch {}
    return await firstValueFrom(this.pushService.enviarNotificacion(payload));
  }
}
