import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { LoggingService, LogLevel } from '../../../../core/services/logging.service';
import { ReservaContactoService } from '../../../../core/services/reserva-contacto.service';
import { ReservaNotificationsService } from '../../../../core/services/reserva-notifications.service';
import { ReservaService } from '../../../../core/services/reserva.service';
import { UserService } from '../../../../core/services/user.service';
import { estadoReserva } from '../../../../shared/constants';
import { ReservaPopulada } from '../../../../shared/models/reserva.model';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-consultar-reserva',
  standalone: true,
  templateUrl: './consultar-reserva.component.html',
  styleUrls: ['./consultar-reserva.component.scss'],
  imports: [CommonModule, FormsModule, FormatDatePipe],
})
export class ConsultarReservaComponent implements OnInit {
  reservas: ReservaPopulada[] = [];
  mostrarMensaje: boolean = false;
  mostrarFiltros: boolean = true;
  esAdmin: boolean = false;

  documentoCliente: string = '';
  fechaReserva: string = '';
  buscarPorDocumento: boolean = false;
  buscarPorFecha: boolean = false;

  constructor(
    private reservaService: ReservaService,
    private reservaContactoService: ReservaContactoService,
    private toastr: ToastrService,
    private userService: UserService,
    private logger: LoggingService,
    private reservaNoti: ReservaNotificationsService,
  ) {}

  ngOnInit(): void {
    const rol = this.userService.getUserRole();
    this.esAdmin = rol === 'Administrador';

    if (!this.esAdmin) {
      this.mostrarFiltros = false;
      const doc = this.userService.getUserId();
      this.documentoCliente = doc ? String(doc) : '';
      this.buscarPorDocumento = true;
      this.buscarPorFecha = false;
      this.buscarReserva();
    } else {
      this.mostrarFiltros = true;
      this.buscarPorDocumento = false;
      this.buscarPorFecha = false;
    }
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
      fechaISO = this.convertirFechaISO(this.fechaReserva);
    }

    // Auto documento desde JWT cuando aplica
    if (!this.esAdmin && !documentoNumerico) {
      const uid = this.userService.getUserId();
      documentoNumerico = typeof uid === 'number' && !isNaN(uid) ? uid : undefined;
    }

    // Si el usuario elige solo Fecha (sin Documento), permitimos búsqueda sin documento
    if (!documentoNumerico && this.buscarPorFecha && !this.buscarPorDocumento) {
      this.reservaService.getReservaByParameter(undefined, fechaISO).subscribe({
        next: (response) => {
          const normalizados: ReservaPopulada[] = (response.data || []).map((r: any) => ({
            ...r,
          })) as any;
          const subs = normalizados.map(async (r: any) => {
            const cidVal =
              typeof r?.contactoId === 'number' ? r.contactoId : r?.contactoId?.contactoId;
            if (!cidVal) return r as ReservaPopulada;
            try {
              const info = await this.reservaContactoService.getById(cidVal).toPromise();
              if (info) {
                r.nombreCompleto =
                  r?.nombreCompleto && r.nombreCompleto.trim() !== ''
                    ? r.nombreCompleto
                    : info.data.nombreCompleto || '';
                r.telefono =
                  r?.telefono && r.telefono.trim() !== '' ? r.telefono : info.data.telefono || '';
                r.documentoCliente = r?.documentoCliente ?? info.data.documentoCliente ?? null;
              }
            } catch {}
            return r as ReservaPopulada;
          });
          Promise.all(subs).then((enriched) => {
            this.reservas = (enriched as ReservaPopulada[]).sort((a, b) => {
              const fechaA = new Date(a.fechaReserva.split('-').reverse().join('-'));
              const fechaB = new Date(b.fechaReserva.split('-').reverse().join('-'));
              if (fechaA.getTime() !== fechaB.getTime()) return fechaB.getTime() - fechaA.getTime();
              const horaA = new Date(`1970-01-01T${a.horaReserva}`);
              const horaB = new Date(`1970-01-01T${b.horaReserva}`);
              return horaB.getTime() - horaA.getTime();
            });
            this.mostrarMensaje = true;
          });
        },
        error: () => this.toastr.error('Ocurrió un error al buscar la reserva', 'Error'),
      });
      return;
    }

    if (!documentoNumerico) {
      this.toastr.warning('Documento requerido para la búsqueda', 'Atención');
      return;
    }

    // Endpoint universal: funciona para clientes y contactos
    this.reservaService.getReservasByDocumento(documentoNumerico, fechaISO).subscribe({
      next: (response) => {
        console.log('[Reservas] Respuesta /reservas/documento:', response);
        const normalizados: ReservaPopulada[] = (response.data || []).map((r: any) => ({
          ...r,
        })) as any;
        console.log('[Reservas] Normalizados (pre-enriquecidos):', normalizados);

        // Si falta nombre/telefono y tenemos contactoId numérico, enriquecer desde /reserva_contacto/search
        const needsEnrich = normalizados.some(
          (r: any) =>
            !r?.nombreCompleto ||
            r?.nombreCompleto.trim() === '' ||
            !r?.telefono ||
            r?.telefono.trim() === '',
        );

        const finish = (items: ReservaPopulada[]) => {
          this.reservas = items.sort((a: ReservaPopulada, b: ReservaPopulada) => {
            const fechaA = new Date(a.fechaReserva.split('-').reverse().join('-'));
            const fechaB = new Date(b.fechaReserva.split('-').reverse().join('-'));
            if (fechaA.getTime() !== fechaB.getTime()) {
              return fechaB.getTime() - fechaA.getTime();
            }
            const horaA = new Date(`1970-01-01T${a.horaReserva}`);
            const horaB = new Date(`1970-01-01T${b.horaReserva}`);
            return horaB.getTime() - horaA.getTime();
          });
          this.mostrarMensaje = true;
        };

        if (!needsEnrich) {
          finish(normalizados);
          return;
        }

        // Enriquecer en paralelo por cada contactoId
        const subs = normalizados.map(async (r: any) => {
          const cidVal =
            typeof r?.contactoId === 'number' ? r.contactoId : r?.contactoId?.contactoId;
          if (!cidVal) return r as ReservaPopulada;
          try {
            const info = await this.reservaContactoService.getById(cidVal).toPromise();
            if (info) {
              r.nombreCompleto =
                r?.nombreCompleto && r.nombreCompleto.trim() !== ''
                  ? r.nombreCompleto
                  : info.data.nombreCompleto || '';
              r.telefono =
                r?.telefono && r.telefono.trim() !== '' ? r.telefono : info.data.telefono || '';
              r.documentoCliente = r?.documentoCliente ?? info.data.documentoCliente ?? null;
            }
          } catch {}
          return r as ReservaPopulada;
        });

        Promise.all(subs).then((enriched) => finish(enriched as ReservaPopulada[]));
      },
      error: () => {
        this.toastr.error('Ocurrió un error al buscar la reserva', 'Error');
      },
    });
  }

  private convertirFechaISO(fecha: string): string {
    const partes = fecha.split('-');
    return partes.length === 3 ? `${partes[0]}-${partes[1]}-${partes[2]}` : fecha;
  }

  confirmarReserva(reserva: ReservaPopulada): void {
    this.actualizarReserva(reserva, estadoReserva.CONFIRMADA);
  }

  cancelarReserva(reserva: ReservaPopulada): void {
    this.actualizarReserva(reserva, estadoReserva.CANCELADA);
  }

  cumplirReserva(reserva: ReservaPopulada): void {
    this.actualizarReserva(reserva, estadoReserva.CUMPLIDA);
  }

  private actualizarReserva(reserva: ReservaPopulada, nuevoEstado: estadoReserva): void {
    if (!this.esAdmin) return;

    if (!reserva.reservaId || isNaN(reserva.reservaId)) {
      this.toastr.error('Error: ID de reserva no válido', 'Error');
      return;
    }

    const [dia, mes, anio] = reserva.fechaReserva.split('-');
    const fechaISO = `${anio}-${mes}-${dia}`;

    const payload: any = {
      estadoReserva: nuevoEstado,
      fechaReserva: fechaISO,
      horaReserva: reserva.horaReserva,
      indicaciones: reserva.indicaciones,
      personas: reserva.personas,
      restauranteId: (reserva as any).restauranteId,
      contactoId: (reserva as any).contactoId,
    };

    this.reservaService.actualizarReserva(reserva.reservaId, payload).subscribe({
      next: async () => {
        this.toastr.success(`Reserva marcada como ${nuevoEstado}`, 'Actualización Exitosa');
        try {
          console.log('[Reservas] Notificando estado cambio:', nuevoEstado);
          await this.reservaNoti.notifyEstadoCambio(
            {
              fechaReserva: fechaISO,
              horaReserva: reserva.horaReserva,
              documentoCliente: reserva.documentoCliente || null,
              reservaId: reserva.reservaId,
            } as any,
            nuevoEstado,
          );
        } catch {}
        const idx = this.reservas.findIndex((r) => r.reservaId === reserva.reservaId);
        if (idx > -1) {
          const updated = { ...this.reservas[idx], estadoReserva: nuevoEstado } as ReservaPopulada;
          this.reservas = [
            ...this.reservas.slice(0, idx),
            updated,
            ...this.reservas.slice(idx + 1),
          ];
        }
      },
      error: (error) => {
        this.logger.log(LogLevel.ERROR, 'Error:', error);
        this.toastr.error('Ocurrió un error al actualizar la reserva', 'Error');
      },
    });
  }
}
