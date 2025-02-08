import { Component } from '@angular/core';
import { ReservaService } from '../../../../core/services/reserva.service';
import { Reserva } from '../../../../shared/models/reserva.model';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consultar-reserva',
  standalone: true,
  templateUrl: './consultar-reserva.component.html',
  styleUrls: ['./consultar-reserva.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class ConsultarReservaComponent {
  reservas: Reserva[] = [];
  documentoCliente: string = '';
  fechaReserva: string = '';
  buscarPorDocumento: boolean = false;
  buscarPorFecha: boolean = false;
  mostrarMensaje: boolean = false;

  constructor(private reservaService: ReservaService, private toastr: ToastrService) { }

  actualizarTipoBusqueda(): void {
    if (!this.buscarPorDocumento && !this.buscarPorFecha) {
      this.reservas = [];
      this.mostrarMensaje = false;
    }
  }

  buscarReserva(): void {
    this.mostrarMensaje = false;

    if (!this.buscarPorDocumento && !this.buscarPorFecha) {
      this.toastr.warning('Selecciona al menos un criterio de búsqueda', 'Atención');
      return;
    }

    let documentoNumerico: number | undefined;
    let fechaISO: string | undefined;

    if (this.buscarPorDocumento && !this.documentoCliente) {
      this.toastr.warning('Por favor ingresa un documento', 'Atención');
      return;
    }

    if (this.buscarPorFecha && !this.fechaReserva) {
      this.toastr.warning('Por favor selecciona una fecha', 'Atención');
      return;
    }

    if (this.buscarPorDocumento) {
      documentoNumerico = Number(this.documentoCliente);
      if (isNaN(documentoNumerico)) {
        this.toastr.error('El documento debe ser un número válido', 'Error');
        return;
      }
    }

    if (this.buscarPorFecha) {
      fechaISO = this.convertirFechaISO(this.fechaReserva);
    }

    this.reservaService.getReservaByParameter(documentoNumerico, fechaISO).subscribe({
      next: (response) => {
        this.reservas = response.data
          .sort((a: Reserva, b: Reserva) => {
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
      },
      error: () => {
        this.toastr.error('Ocurrió un error al buscar la reserva', 'Error');
      }
    });
  }

  private convertirFechaISO(fecha: string): string {
    const partes = fecha.split('-');
    return partes.length === 3 ? `${partes[0]}-${partes[1]}-${partes[2]}` : fecha;
  }

  confirmarReserva(reserva: Reserva): void {
    this.actualizarReserva(reserva, "CONFIRMADA");
  }

  cancelarReserva(reserva: Reserva): void {
    this.actualizarReserva(reserva, "CANCELADA");
  }

  cumplirReserva(reserva: Reserva): void {
    this.actualizarReserva(reserva, "CUMPLIDA");
  }

  private actualizarReserva(reserva: Reserva, nuevoEstado: string): void {
    if (!reserva.reservaId || isNaN(reserva.reservaId)) {
      this.toastr.error('Error: ID de reserva no válido', 'Error');
      return;
    }

    const [dia, mes, anio] = reserva.fechaReserva.split('-');
    reserva.fechaReserva = `${anio}-${mes}-${dia}`;

    reserva.estadoReserva = nuevoEstado;

    this.reservaService.actualizarReserva(reserva.reservaId, reserva).subscribe({
      next: () => {
        this.toastr.success(`Reserva marcada como ${nuevoEstado}`, 'Actualización Exitosa');
      },
      error: (error) => {
        console.log('Error:', error);
        this.toastr.error('Ocurrió un error al actualizar la reserva', 'Error');
      }
    });
  }

}
