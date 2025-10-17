import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ApiResponse } from '../../shared/models/api-response.model';
import { EnviarNotificacionRequest } from '../../shared/models/push.model';
import { PushService } from './push.service';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class PedidoNotificationsService {
  constructor(
    private pushService: PushService,
    private userService: UserService,
  ) {}

  /**
   * Notifica al cliente que su pedido fue recibido
   */
  async notifyCreacion(
    documentoCliente: number,
    pedidoId: number,
  ): Promise<ApiResponse<unknown> | null> {
    if (!documentoCliente || isNaN(Number(documentoCliente))) return null;

    const titulo = 'Pedido recibido';
    const mensaje =
      'Recibimos tu pedido exitosamente. Pronto recibirás actualizaciones sobre su estado. ¡Gracias por tu compra!';

    const payload: EnviarNotificacionRequest = {
      remitente: { tipo: 'SISTEMA' },
      destinatarios: { tipo: 'CLIENTE', documentoCliente: Number(documentoCliente) },
      notificacion: {
        titulo,
        mensaje,
        datos: {
          tipo: 'PEDIDO',
          pedidoId,
          url: `/cliente/mis-pedidos`,
        },
      },
    };

    try {
      console.log('[Pedidos] Enviando notificación creación al cliente:', payload);
      return await firstValueFrom(this.pushService.enviarNotificacion(payload));
    } catch (error) {
      console.error('[Pedidos] Error al enviar notificación al cliente:', error);
      return null;
    }
  }

  /**
   * Notifica a los trabajadores (admins y domiciliarios) que hay un nuevo domicilio pendiente de asignar
   */
  async notifyAdminDomicilio(
    pedidoId: number,
    domicilioId: number,
  ): Promise<ApiResponse<unknown> | null> {
    const titulo = 'Nuevo pedido con domicilio';
    const mensaje = `Se ha creado un nuevo pedido (#${pedidoId}) que requiere asignación de domiciliario. Domicilio #${domicilioId}.`;

    const payload: EnviarNotificacionRequest = {
      remitente: { tipo: 'SISTEMA' },
      destinatarios: { tipo: 'TRABAJADORES' },
      notificacion: {
        titulo,
        mensaje,
        datos: {
          tipo: 'PEDIDO_DOMICILIO',
          pedidoId,
          domicilioId,
          url: `/admin/domicilios/consultar`,
        },
      },
    };

    try {
      console.log('[Pedidos] Enviando notificación domicilio al admin:', payload);
      return await firstValueFrom(this.pushService.enviarNotificacion(payload));
    } catch (error) {
      console.error('[Pedidos] Error al enviar notificación al admin:', error);
      return null;
    }
  }
}
