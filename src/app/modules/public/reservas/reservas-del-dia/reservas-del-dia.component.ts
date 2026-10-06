import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { LoggingService, LogLevel } from '../../../../core/services/logging.service';
import { ReservaService } from '../../../../core/services/reserva.service';
import { estadoReserva } from '../../../../shared/constants';
import { ReservaBase, ReservaUpdate } from '../../../../shared/models/reserva.model';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-reservas-del-dia',
  standalone: true,
  imports: [CommonModule, FormatDatePipe],
  templateUrl: './reservas-del-dia.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./reservas-del-dia.component.scss'],
})
export class ReservasDelDiaComponent implements OnInit {
  reservas: ReservaBase[] = [];
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

    // El backend ya incluye el contacto (nombre, teléfono, documentos) en cada reserva
    this.reservaService.getReservaByParameter(undefined, fechaISO).subscribe({
      next: (response) => {
        this.reservas = [...response.data].sort((a, b) => {
          const horaA = new Date(`1970-01-01T${a.horaReserva}`);
          const horaB = new Date(`1970-01-01T${b.horaReserva}`);
          return horaA.getTime() - horaB.getTime();
        });
      },
      error: () => {
        this.toastr.error('Ocurrió un error al consultar las reservas del día', 'Error');
      },
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
    if (!reserva.reservaId || isNaN(reserva.reservaId)) {
      this.toastr.error('Error: ID de reserva no válido', 'Error');
      return;
    }

    // PUT con merge: basta con enviar el campo que cambia
    const payload: ReservaUpdate = { estadoReserva: nuevoEstado };

    this.reservaService.actualizarReserva(reserva.reservaId, payload).subscribe({
      next: (response) => {
        this.toastr.success(`Reserva marcada como ${nuevoEstado}`, 'Actualización Exitosa');
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
