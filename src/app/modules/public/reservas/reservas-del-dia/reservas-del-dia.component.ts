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
    // Obtener la fecha de hoy en formato YYYY-MM-DD para la API
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const dia = hoy.getDate().toString().padStart(2, '0');
    this.fechaHoy = `${dia}-${mes}-${anio}`; // Formato para la vista
    const fechaISO = `${anio}-${mes}-${dia}`; // Formato para la API

    this.reservaService.getReservaByParameter(undefined, fechaISO).subscribe({
      next: (response) => {
        this.reservas = response.data.sort((a: Reserva, b: Reserva) => {
          const horaA = new Date(`1970-01-01T${a.horaReserva}`);
          const horaB = new Date(`1970-01-01T${b.horaReserva}`);
          return horaA.getTime() - horaB.getTime();
        });

      },
      error: () => {
        this.toastr.error('Ocurrió un error al consultar las reservas del día', 'Error');
      }
    });
  }

  confirmarReserva(reserva: Reserva): void {
    this.actualizarReserva({ ...reserva, estadoReserva: "CONFIRMADA" });
  }

  cancelarReserva(reserva: Reserva): void {
    this.actualizarReserva({ ...reserva, estadoReserva: "CANCELADA" });
  }

  cumplirReserva(reserva: Reserva): void {
    this.actualizarReserva({ ...reserva, estadoReserva: "CUMPLIDA" });
  }

  private actualizarReserva(reserva: Reserva): void {
    if (!reserva.reservaId || isNaN(reserva.reservaId)) {
      this.toastr.error('Error: ID de reserva no válido', 'Error');
      return;
    }

    // Convertir fecha de DD-MM-YYYY a YYYY-MM-DD antes de enviarla a la API
    const [dia, mes, anio] = reserva.fechaReserva.split('-');
    reserva.fechaReserva = `${anio}-${mes}-${dia}`;

    this.reservaService.actualizarReserva(Number(reserva.reservaId), reserva).subscribe({
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
