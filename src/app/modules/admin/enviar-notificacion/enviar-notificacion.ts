import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { PushService } from '../../../core/services/push.service';
import { EnviarNotificacionRequest } from '../../../shared/models/push.model';

@Component({
  selector: 'app-enviar-notificacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enviar-notificacion.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './enviar-notificacion.scss',
})
export class EnviarNotificacionComponent {
  // Remitente
  tipoRemitente: 'SISTEMA' | 'TRABAJADOR' = 'TRABAJADOR';
  documentoTrabajador = 1015466494;

  // Destinatarios
  tipoDestinatario: 'TODOS' | 'CLIENTE' | 'TRABAJADOR' | 'TOPIC' | 'CLIENTES' | 'TRABAJADORES' =
    'CLIENTE';
  documentoCliente = 1015466495;
  documentoTrabajadorDestinatario = 1015466494;
  topic = 'promos';

  // Notificación
  titulo = '¡Nueva promoción! 🎉';
  mensaje = 'Disfruta de un 20% de descuento en todos nuestros platos hoy.';
  url = '/home';

  enviando = false;

  constructor(
    private pushService: PushService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  enviarNotificacion(): void {
    if (!this.validarFormulario()) {
      return;
    }

    this.enviando = true;

    const request: EnviarNotificacionRequest = {
      remitente:
        this.tipoRemitente === 'SISTEMA'
          ? { tipo: 'SISTEMA' }
          : { tipo: 'TRABAJADOR', documentoTrabajador: this.documentoTrabajador },
      destinatarios: this.construirDestinatarios(),
      notificacion: {
        titulo: this.titulo,
        mensaje: this.mensaje,
        datos: {
          url: this.url,
        },
      },
    };

    this.pushService.enviarNotificacion(request).subscribe({
      next: (response) => {
        this.toastr.success('Notificación enviada exitosamente', 'Éxito');
        console.log('Respuesta:', response);
      },
      error: (error) => {
        this.toastr.error(error.message || 'Error al enviar notificación', 'Error');
        console.error('Error:', error);
        this.enviando = false;
      },
      complete: () => {
        this.enviando = false;
      },
    });
  }

  private construirDestinatarios(): EnviarNotificacionRequest['destinatarios'] {
    switch (this.tipoDestinatario) {
      case 'CLIENTE':
        return { tipo: 'CLIENTE', documentoCliente: this.documentoCliente };
      case 'TRABAJADOR':
        return { tipo: 'TRABAJADOR', documentoTrabajador: this.documentoTrabajadorDestinatario };
      case 'TOPIC':
        return { tipo: 'TOPIC', topic: this.topic };
      case 'TODOS':
        return { tipo: 'TODOS' };
      case 'CLIENTES':
        return { tipo: 'CLIENTES' };
      case 'TRABAJADORES':
        return { tipo: 'TRABAJADORES' };
      default:
        return { tipo: 'CLIENTE', documentoCliente: this.documentoCliente };
    }
  }

  private validarFormulario(): boolean {
    if (!this.titulo.trim()) {
      this.toastr.warning('El título es obligatorio', 'Validación');
      return false;
    }

    if (!this.mensaje.trim()) {
      this.toastr.warning('El mensaje es obligatorio', 'Validación');
      return false;
    }

    if (this.tipoRemitente === 'TRABAJADOR' && !this.documentoTrabajador) {
      this.toastr.warning('El documento del trabajador es obligatorio', 'Validación');
      return false;
    }

    if (
      this.tipoDestinatario === 'CLIENTE' &&
      (!this.documentoCliente || isNaN(this.documentoCliente))
    ) {
      this.toastr.warning(
        'El documento del cliente es obligatorio y debe ser válido',
        'Validación',
      );
      return false;
    }

    if (
      this.tipoDestinatario === 'TRABAJADOR' &&
      (!this.documentoTrabajadorDestinatario || isNaN(this.documentoTrabajadorDestinatario))
    ) {
      this.toastr.warning(
        'El documento del trabajador destinatario es obligatorio y debe ser válido',
        'Validación',
      );
      return false;
    }

    if (this.tipoDestinatario === 'TOPIC' && !this.topic.trim()) {
      this.toastr.warning('El topic es obligatorio', 'Validación');
      return false;
    }

    return true;
  }

  cargarEjemplo(
    tipo:
      'bienvenida' | 'promo' | 'reserva' | 'calificacion' | 'promo-clientes' | 'aviso-trabajadores',
  ): void {
    switch (tipo) {
      case 'bienvenida':
        this.titulo = '¡Bienvenido a El Fogón de María! 👋';
        this.mensaje =
          'Gracias por registrarte. Explora nuestro menú y realiza tu primera reserva.';
        this.url = '/home';
        this.tipoDestinatario = 'CLIENTE';
        break;
      case 'promo':
        this.titulo = '🎉 Promoción Especial';
        this.mensaje = 'Disfruta de un 20% de descuento en todos nuestros platos hoy.';
        this.url = '/menu';
        this.tipoDestinatario = 'TODOS';
        break;
      case 'promo-clientes':
        this.titulo = '🎁 Promoción Exclusiva para Clientes';
        this.mensaje =
          '¡Descuento especial del 25% en tu próximo pedido! Válido solo por hoy para nuestros clientes registrados.';
        this.url = '/menu';
        this.tipoDestinatario = 'CLIENTES';
        break;
      case 'aviso-trabajadores':
        this.titulo = '📢 Comunicado Interno';
        this.mensaje = 'Reunión de equipo mañana a las 9:00 AM. Por favor confirmar asistencia.';
        this.url = '/trabajadores/comunicados';
        this.tipoDestinatario = 'TRABAJADORES';
        break;
      case 'reserva':
        this.titulo = 'Reserva Confirmada ✅';
        this.mensaje = 'Tu reserva para el 15/10/2024 a las 19:00 ha sido confirmada.';
        this.url = '/reservas/consultar';
        this.tipoDestinatario = 'CLIENTE';
        break;
      case 'calificacion':
        this.titulo = 'Califícanos con 🌟🌟🌟🌟🌟';
        this.mensaje = '¿Cómo fue tu experiencia? Nos encantaría conocer tu opinión.';
        this.url = '/cliente/perfil';
        this.tipoDestinatario = 'CLIENTE';
        break;
    }
  }

  volver(): void {
    this.router.navigate(['/admin/acciones']);
  }
}
