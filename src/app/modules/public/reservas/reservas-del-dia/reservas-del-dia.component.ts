import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { LoggingService, LogLevel } from '../../../../core/services/logging.service';
import { ReservaService } from '../../../../core/services/reserva.service';
import { ReservaContactoService } from '../../../../core/services/reserva-contacto.service';
import { estadoReserva } from '../../../../shared/constants';
import { ReservaPopulada } from '../../../../shared/models/reserva.model';

@Component({
  selector: 'app-reservas-del-dia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas-del-dia.component.html',
  styleUrls: ['./reservas-del-dia.component.scss'],
})
export class ReservasDelDiaComponent implements OnInit {
  reservas: ReservaPopulada[] = [];
  fechaHoy: string = '';

  constructor(
    private reservaService: ReservaService,
    private reservaContactoService: ReservaContactoService,
    private toastr: ToastrService,
    private logger: LoggingService,
  ) {}

  ngOnInit(): void {
    this.consultarReservasDelDia();
  }

  consultarReservasDelDia(): void {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const dia = hoy.getDate().toString().padStart(2, '0');
    this.fechaHoy = `${dia}-${mes}-${anio}`;
    const fechaISO = `${anio}-${mes}-${dia}`;

    this.reservaService.getReservaByParameter(undefined, fechaISO).subscribe({
      next: (response) => {
        const normalizados: ReservaPopulada[] = (response.data || []).map((r: any) => {
          const nombreTop: string | undefined = r?.nombreCompleto;
          const telTop: string | undefined = r?.telefono;
          const nombreContacto: string | undefined = r?.contactoId?.nombreCompleto;
          const telContacto: string | undefined = r?.contactoId?.telefono;

          const nombreFinal =
            nombreTop && nombreTop.trim().length > 0 ? nombreTop : nombreContacto || '';
          const telefonoFinal = telTop && telTop.trim().length > 0 ? telTop : telContacto || '';

          const docTop: number | null | undefined = r?.documentoCliente as any;
          const docContacto: number | null | undefined = r?.contactoId?.documentoCliente as any;

          return {
            ...r,
            nombreCompleto: nombreFinal,
            telefono: telefonoFinal,
            documentoCliente: (docTop ?? docContacto ?? null) as any,
          } as ReservaPopulada;
        });

        const needsEnrich = normalizados.some(
          (r: any) =>
            !r?.nombreCompleto ||
            r?.nombreCompleto.trim() === '' ||
            !r?.telefono ||
            r?.telefono.trim() === '',
        );

        const finish = (items: ReservaPopulada[]) => {
          this.reservas = items.sort((a: ReservaPopulada, b: ReservaPopulada) => {
            const horaA = new Date(`1970-01-01T${a.horaReserva}`);
            const horaB = new Date(`1970-01-01T${b.horaReserva}`);
            return horaA.getTime() - horaB.getTime();
          });
        };

        if (!needsEnrich) {
          finish(normalizados);
          return;
        }

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
        this.toastr.error('Ocurrió un error al consultar las reservas del día', 'Error');
      },
    });
  }

  confirmarReserva(reserva: ReservaPopulada): void {
    this.actualizarReserva({ ...reserva, estadoReserva: estadoReserva.CONFIRMADA });
  }

  cancelarReserva(reserva: ReservaPopulada): void {
    this.actualizarReserva({ ...reserva, estadoReserva: estadoReserva.CANCELADA });
  }

  cumplirReserva(reserva: ReservaPopulada): void {
    this.actualizarReserva({ ...reserva, estadoReserva: estadoReserva.CUMPLIDA });
  }

  private actualizarReserva(reserva: ReservaPopulada): void {
    if (!reserva.reservaId || isNaN(reserva.reservaId)) {
      this.toastr.error('Error: ID de reserva no válido', 'Error');
      return;
    }

    const [dia, mes, anio] = reserva.fechaReserva.split('-');
    const fechaISO = `${anio}-${mes}-${dia}`;

    const payload: any = {
      estadoReserva: reserva.estadoReserva,
      fechaReserva: fechaISO,
      horaReserva: reserva.horaReserva,
      indicaciones: reserva.indicaciones,
      personas: reserva.personas,
      restauranteId: (reserva as any).restauranteId,
      contactoId: (reserva as any).contactoId,
    };

    this.reservaService.actualizarReserva(Number(reserva.reservaId), payload).subscribe({
      next: () => {
        this.toastr.success(
          `Reserva marcada como ${reserva.estadoReserva}`,
          'Actualización Exitosa',
        );
        const idx = this.reservas.findIndex((r) => r.reservaId === reserva.reservaId);
        if (idx > -1) {
          const updated = {
            ...this.reservas[idx],
            estadoReserva: reserva.estadoReserva,
          } as ReservaPopulada;
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
