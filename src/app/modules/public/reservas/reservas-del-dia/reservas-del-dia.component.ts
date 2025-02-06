import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservaService } from '../../../../core/services/reserva.service';
import { Reserva } from '../../../../shared/models/reserva.model';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private reservaService: ReservaService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.consultarReservasDelDia();
  }

  consultarReservasDelDia(): void {
    this.reservaService.obtenerReservas().subscribe({
      next: (response) => {
        const reservas = response.data;

        const hoy = new Date();
        const dia = hoy.getDate().toString().padStart(2, '0');
        const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
        const anio = hoy.getFullYear();
        this.fechaHoy = `${dia}-${mes}-${anio}`;

        this.reservas = reservas
          .filter((reserva: Reserva) => reserva.fechaReserva === this.fechaHoy)
          .sort((a: Reserva, b: Reserva) => {
            // Convertir las horas en objetos Date para compararlas
            const horaA = new Date(`1970-01-01T${a.horaReserva}`);
            const horaB = new Date(`1970-01-01T${b.horaReserva}`);
            return horaA.getTime() - horaB.getTime();
          });

        console.log('Reservas del día (ordenadas por hora):', this.reservas);
      },
      error: () => {
        this.toastr.error('Ocurrió un error al consultar las reservas del día', 'Error');
      }
    });
  }

  confirmarReserva(reserva: Reserva): void {
    reserva.estadoReserva = "CONFIRMADA";
    this.actualizarReserva(reserva);
  }

  cancelarReserva(reserva: Reserva): void {
    reserva.estadoReserva = "CANCELADA";
    this.actualizarReserva(reserva);
  }

  cumplirReserva(reserva: Reserva): void {
    reserva.estadoReserva = "CUMPLIDA";
    this.actualizarReserva(reserva);
  }

  private actualizarReserva(reserva: Reserva): void {
    if (!reserva.reservaId || isNaN(reserva.reservaId)) {
      this.toastr.error('Error: ID de reserva no válido', 'Error');
      return;
    }

    const reservaActualizada = { ...reserva };

    const [dia, mes, anio] = reserva.fechaReserva.split('-');
    reservaActualizada.fechaReserva = `${anio}-${mes}-${dia}`;

    this.reservaService.actualizarReserva(Number(reservaActualizada.reservaId), reservaActualizada).subscribe({
      next: () => {
        this.toastr.success(`Reserva marcada como ${reserva.estadoReserva}`, 'Actualización Exitosa');
      },
      error: (error) => {
        console.log('Error:', error);
        this.toastr.error('Ocurrió un error al actualizar la reserva', 'Error');
      }
    });
  }
}