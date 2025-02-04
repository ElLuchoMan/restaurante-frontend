import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../core/services/user.service';
import { ReservaService } from '../../../core/services/reserva.service';
import { Reserva } from '../../../shared/models/reserva.model';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.scss'],
})
export class ReservaComponent implements OnInit {
  nombreCompleto: string = '';
  telefono: string = '';
  fechaReserva: string = '';
  horaReserva: string = '';
  personas: string = '';
  indicaciones: string = '';
  documentoCliente: string = '';
  userId: number = 0;
  nombreTrabajador: string = '';
  rol: string | null = '';
  mostrarCampo: boolean = true;
  personasExtra: number = 5;
  mostrarInputPersonas: boolean = false;
  mostrarInfoEvento: boolean = false;
  mostrarFormulario: boolean = false;
  esAdmin: boolean = false;

  constructor(
    private reservaService: ReservaService,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.rol = this.userService.getUserRole() || null;
    this.esAdmin = this.rol === 'Administrador';
    console.log('Rol del usuario:', this.rol);
    this.rol === 'Cliente' ? this.mostrarCampo = false : this.mostrarCampo = true;
  }

  onSubmit(): void {
    const timestamp = new Date().toISOString();
    const userRole = this.rol;
    const userId = this.userService.getUserId();
    this.userId = userId !== null ? Number(userId) : 0;

    if (userRole === 'Administrador') {
      this.userService.getTrabajadorId(this.userId).subscribe({
        next: (response) => {
          this.nombreTrabajador = response.data.nombre + ' ' + response.data.apellido;

          this.crearReserva(timestamp, userRole, userId);
        },
        error: () => {
          this.nombreTrabajador = 'Administrador Desconocido';
          this.crearReserva(timestamp, userRole, userId);
        }
      });
    } else if (userRole === 'Cliente') {
      this.userService.getClienteId(this.userId).subscribe({
        next: (response) => {
          this.nombreCompleto = response.data.nombre + ' ' + response.data.apellido;
          this.telefono = response.data.telefono;

          this.crearReserva(timestamp, userRole, userId);
        },
        error: () => {
          this.nombreCompleto = 'Cliente Desconocido';
          this.crearReserva(timestamp, userRole, userId);
        }
      });
      this.crearReserva(timestamp, userRole, userId);
    }
    else {
      this.crearReserva(timestamp, userRole, userId);
    }
  }

  checkPersonas(): void {
    if (this.personas === "5+") {
      this.mostrarInputPersonas = true;
      this.mostrarInfoEvento = true;
    } else {
      this.mostrarInputPersonas = false;
      this.mostrarInfoEvento = false;
    }
  }

  consultarReserva(): void {
    console.log('Consultar una reserva específica');
    // Implementar lógica para buscar una reserva específica
  }

  consultarReservasDelDia(): void {
    console.log('Consultar reservas del día');
    // Implementar lógica para obtener reservas del día
  }

  private crearReserva(timestamp: string, userRole: string | null, userId: string | null): void {
    const totalPersonas = this.personas === "5+" ? this.personasExtra : Number(this.personas);
    const reserva: Reserva = {
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: userRole === 'Administrador' ? `${this.rol} - ${this.nombreTrabajador}` : userRole ? `Cliente - ${this.nombreCompleto}` : 'Anónimo',
      updatedBy: userRole === 'Administrador' ? `${this.rol} - ${this.nombreTrabajador}` : userRole ? `Cliente - ${this.nombreCompleto}` : 'Anónimo',
      documentoCliente: userRole === 'Administrador' ? Number(userId) : userRole === 'Cliente' ? Number(userId) : Number(this.documentoCliente),
      estadoReserva: 'Pendiente',
      fechaReserva: this.fechaReserva,
      horaReserva: this.horaReserva,
      indicaciones: this.indicaciones,
      nombreCompleto: this.nombreCompleto,
      personas: totalPersonas,
      telefono: this.telefono,
    };

    console.table(reserva);

  }

}
