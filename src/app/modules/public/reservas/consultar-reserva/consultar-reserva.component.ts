import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

import { LoggingService, LogLevel } from '../../../../core/services/logging.service';
import { ReservaService } from '../../../../core/services/reserva.service';
import { ReservaNotificationsService } from '../../../../core/services/reserva-notifications.service';
import { UserService } from '../../../../core/services/user.service';
import { estadoReserva } from '../../../../shared/constants';
import { ApiResponse } from '../../../../shared/models/api-response.model';
import {
  ReservaBase,
  ReservaConsulta,
  ReservaUpdate,
} from '../../../../shared/models/reserva.model';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-consultar-reserva',
  standalone: true,
  templateUrl: './consultar-reserva.component.html',
  styleUrls: ['./consultar-reserva.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule, FormatDatePipe],
})
export class ConsultarReservaComponent implements OnInit {
  reservas: ReservaBase[] = [];
  mostrarMensaje: boolean = false;
  mostrarFiltros: boolean = true;
  esAdmin: boolean = false;
  /** Sin sesión: solo puede consultar UNA reserva con su código y su teléfono/documento. */
  esInvitado: boolean = false;
  /** Cliente con sesión: ve únicamente sus propias reservas (el documento sale del token). */
  esCliente: boolean = false;

  // Consulta de invitado (GET /reservas/consulta): datos mínimos, nunca los del contacto.
  reservaIdConsulta: string = '';
  contactoConsulta: string = '';
  reservaConsultada: ReservaConsulta | null = null;
  consultaSinResultado: boolean = false;

  documentoCliente: string = '';
  fechaReserva: string = '';
  buscarPorDocumento: boolean = false;
  buscarPorFecha: boolean = false;

  constructor(
    private reservaService: ReservaService,
    private toastr: ToastrService,
    private userService: UserService,
    private logger: LoggingService,
    private reservaNoti: ReservaNotificationsService,
  ) {}

  ngOnInit(): void {
    const rol = this.userService.getUserRole();
    this.esAdmin = rol === 'Administrador';
    this.esInvitado = !rol;
    this.esCliente = rol === 'Cliente';

    // Invitado: formulario de consulta; Cliente: lista propia; personal: filtros
    this.mostrarFiltros = !this.esInvitado && !this.esCliente;
    this.buscarPorDocumento = false;
    this.buscarPorFecha = false;
    if (this.esCliente) this.cargarMisReservas();
  }

  /** Lista las reservas del Cliente con sesión (el backend usa el documento del token). */
  private cargarMisReservas(): void {
    this.reservaService.getMisReservas().subscribe({
      next: (response) => {
        this.reservas = this.ordenarMasRecientesPrimero(response.data);
        this.mostrarMensaje = true;
      },
      error: () => this.toastr.error('Ocurrió un error al buscar la reserva', 'Error'),
    });
  }

  /** Consulta de invitado: id de la reserva + teléfono o documento del contacto. */
  consultarComoInvitado(): void {
    this.reservaConsultada = null;
    this.consultaSinResultado = false;

    const reservaId = Number(String(this.reservaIdConsulta).trim());
    const contacto = String(this.contactoConsulta ?? '').trim();
    if (!Number.isInteger(reservaId) || reservaId <= 0) {
      this.toastr.warning('Ingresa el código de tu reserva', 'Atención');
      return;
    }
    if (contacto === '') {
      this.toastr.warning('Ingresa el teléfono o documento con el que reservaste', 'Atención');
      return;
    }

    this.reservaService.consultarReserva(reservaId, contacto).subscribe({
      next: (reserva) => {
        this.reservaConsultada = reserva;
        this.consultaSinResultado = reserva === null;
      },
      error: (error: { code?: number; message?: string }) =>
        this.toastr.error(
          error?.code === 429
            ? 'Demasiadas consultas, intenta de nuevo en un minuto'
            : 'Ocurrió un error al consultar la reserva',
          'Error',
        ),
    });
  }

  actualizarTipoBusqueda(): void {
    if (!this.buscarPorDocumento && !this.buscarPorFecha) {
      this.reservas = [];
      this.mostrarMensaje = false;
    }
  }

  buscarReserva(documentoInput?: string | number | null): void {
    this.mostrarMensaje = false;

    if (this.mostrarFiltros && !this.buscarPorDocumento && !this.buscarPorFecha) {
      this.toastr.warning('Selecciona al menos un criterio de búsqueda', 'Atención');
      return;
    }

    let documentoNumerico: number | undefined;
    let fechaISO: string | undefined;

    if (this.buscarPorDocumento) {
      const valorStr =
        documentoInput !== null && documentoInput !== undefined
          ? String(documentoInput).trim()
          : String(this.documentoCliente || '').trim();
      if (valorStr === '') {
        this.toastr.warning('Por favor ingresa un documento', 'Atención');
        return;
      }
      documentoNumerico = Number(valorStr);
      if (isNaN(documentoNumerico)) {
        this.toastr.error('El documento debe ser un número válido', 'Error');
        return;
      }
    }

    if (this.buscarPorFecha) {
      if (!this.fechaReserva) {
        this.toastr.warning('Por favor selecciona una fecha', 'Atención');
        return;
      }
      fechaISO = this.fechaReserva; // el input de fecha ya entrega YYYY-MM-DD
    }

    let solicitud: Observable<ApiResponse<ReservaBase[]>>;
    if (!documentoNumerico && this.buscarPorFecha && !this.buscarPorDocumento) {
      // Si el usuario elige solo Fecha (sin Documento), permitimos búsqueda sin documento
      solicitud = this.reservaService.getReservaByParameter(undefined, fechaISO);
    } else if (documentoNumerico) {
      // Endpoint universal: funciona para clientes y contactos
      solicitud = this.reservaService.getReservasByDocumento(documentoNumerico, fechaISO);
    } else {
      this.toastr.warning('Documento requerido para la búsqueda', 'Atención');
      return;
    }

    // El backend ya incluye el contacto (nombre, teléfono, documentos) en cada reserva
    solicitud.subscribe({
      next: (response) => {
        this.reservas = this.ordenarMasRecientesPrimero(response.data);
        this.mostrarMensaje = true;
      },
      error: () => this.toastr.error('Ocurrió un error al buscar la reserva', 'Error'),
    });
  }

  /** Fecha y hora descendentes; `fechaReserva` llega como DD-MM-YYYY. */
  private ordenarMasRecientesPrimero(reservas: ReservaBase[]): ReservaBase[] {
    return [...reservas].sort((a, b) => {
      const fechaA = new Date(a.fechaReserva.split('-').reverse().join('-'));
      const fechaB = new Date(b.fechaReserva.split('-').reverse().join('-'));
      if (fechaA.getTime() !== fechaB.getTime()) return fechaB.getTime() - fechaA.getTime();
      const horaA = new Date(`1970-01-01T${a.horaReserva}`);
      const horaB = new Date(`1970-01-01T${b.horaReserva}`);
      return horaB.getTime() - horaA.getTime();
    });
  }

  confirmarReserva(reserva: ReservaBase): void {
    this.actualizarReserva(reserva, estadoReserva.CONFIRMADA);
  }

  cancelarReserva(reserva: ReservaBase): void {
    this.actualizarReserva(reserva, estadoReserva.CANCELADA);
  }

  cumplirReserva(reserva: ReservaBase): void {
    this.actualizarReserva(reserva, estadoReserva.CUMPLIDA);
  }

  private actualizarReserva(reserva: ReservaBase, nuevoEstado: estadoReserva): void {
    if (!this.esAdmin) return;

    if (!reserva.reservaId || isNaN(reserva.reservaId)) {
      this.toastr.error('Error: ID de reserva no válido', 'Error');
      return;
    }

    // PUT con merge: basta con enviar el campo que cambia
    const payload: ReservaUpdate = { estadoReserva: nuevoEstado };

    this.reservaService.actualizarReserva(reserva.reservaId, payload).subscribe({
      next: async (response) => {
        this.toastr.success(`Reserva marcada como ${nuevoEstado}`, 'Actualización Exitosa');
        try {
          await this.reservaNoti.notifyEstadoCambio(
            {
              fechaReserva: reserva.fechaReserva,
              horaReserva: reserva.horaReserva,
              documentoCliente: reserva.contactoId.documentoCliente?.documentoCliente ?? null,
              reservaId: reserva.reservaId,
            },
            nuevoEstado,
          );
        } catch {}
        // El backend devuelve la reserva actualizada con su contacto y restaurante
        this.reservas = this.reservas.map((r) =>
          r.reservaId === reserva.reservaId ? response.data : r,
        );
      },
      error: (error) => {
        this.logger.log(LogLevel.ERROR, 'Error:', error);
        this.toastr.error('Ocurrió un error al actualizar la reserva', 'Error');
      },
    });
  }
}
