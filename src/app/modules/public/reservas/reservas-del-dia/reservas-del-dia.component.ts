import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { LoggingService, LogLevel } from '../../../../core/services/logging.service';
import { ReservaService } from '../../../../core/services/reserva.service';
import { estadoReserva } from '../../../../shared/constants';
import { Reserva } from '../../../../shared/models/reserva.model';

@Component({
  selector: 'app-reservas-del-dia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas-del-dia.component.html',
  styleUrls: ['./reservas-del-dia.component.scss'],
})
export class ReservasDelDiaComponent implements OnInit {
  reservas: Reserva[] = [];
  fechaHoy: string = '';

  constructor(
    private reservaService: ReservaService,
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
        const normalizados: Reserva[] = (response.data || []).map((r: any) => {
          const nombreTop: string | undefined = r?.nombreCompleto;
          const telTop: string | undefined = r?.telefono;
          const nombreContacto: string | undefined = r?.contactoId?.nombreCompleto;
          const telContacto: string | undefined = r?.contactoId?.telefono;

          const nombreFinal =
            nombreTop && nombreTop.trim().length > 0 ? nombreTop : nombreContacto || '';
          const telefonoFinal = telTop && telTop.trim().length > 0 ? telTop : telContacto || '';

          const docTop: number | null | undefined = r?.documentoCliente as any;
          const docContacto: number | null | undefined = r?.contactoId?.documentoCliente
            ?.documentoCliente as any;

          return {
            ...r,
            nombreCompleto: nombreFinal,
            telefono: telefonoFinal,
            documentoCliente: (docTop ?? docContacto ?? null) as any,
          } as Reserva;
        });

        const needsEnrich = normalizados.some(
          (r: any) =>
            !r?.nombreCompleto ||
            r?.nombreCompleto.trim() === '' ||
            !r?.telefono ||
            r?.telefono.trim() === '',
        );

        const finish = (items: Reserva[]) => {
          this.reservas = items.sort((a: Reserva, b: Reserva) => {
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
          if (!cidVal) return r as Reserva;
          try {
            const info = await this.reservaService.getContactoById(cidVal).toPromise();
            if (info) {
              r.nombreCompleto =
                r?.nombreCompleto && r.nombreCompleto.trim() !== ''
                  ? r.nombreCompleto
                  : info.nombreCompleto || '';
              r.telefono =
                r?.telefono && r.telefono.trim() !== '' ? r.telefono : info.telefono || '';
              r.documentoCliente =
                r?.documentoCliente ?? info?.documentoCliente?.documentoCliente ?? null;
            }
          } catch {}
          return r as Reserva;
        });

        Promise.all(subs).then((enriched) => finish(enriched as Reserva[]));
      },
      error: () => {
        this.toastr.error('Ocurrió un error al consultar las reservas del día', 'Error');
      },
    });
  }

  confirmarReserva(reserva: Reserva): void {
    this.actualizarReserva({ ...reserva, estadoReserva: estadoReserva.CONFIRMADA });
  }

  cancelarReserva(reserva: Reserva): void {
    this.actualizarReserva({ ...reserva, estadoReserva: estadoReserva.CANCELADA });
  }

  cumplirReserva(reserva: Reserva): void {
    this.actualizarReserva({ ...reserva, estadoReserva: estadoReserva.CUMPLIDA });
  }

  private actualizarReserva(reserva: Reserva): void {
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
      restauranteId:
        typeof (reserva as any)?.restauranteId === 'number'
          ? (reserva as any).restauranteId
          : ((reserva as any)?.restauranteId?.restauranteId ?? 1),
      contactoId:
        typeof (reserva as any)?.contactoId === 'number'
          ? (reserva as any).contactoId
          : ((reserva as any)?.contactoId?.contactoId ?? undefined),
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
          } as Reserva;
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
