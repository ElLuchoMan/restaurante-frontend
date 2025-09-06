import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { LoggingService, LogLevel } from '../../../../core/services/logging.service';
import { ReservaService } from '../../../../core/services/reserva.service';
import { TrabajadorService } from '../../../../core/services/trabajador.service';
import { UserService } from '../../../../core/services/user.service';
import { estadoReserva } from '../../../../shared/constants';
import { ReservaCreate } from '../../../../shared/models/reserva.model';
import { ClienteService } from './../../../../core/services/cliente.service';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-reserva.component.html',
  styleUrls: ['./crear-reserva.component.scss'],
})
export class CrearReservaComponent implements OnInit {
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
    private trabajadorService: TrabajadorService,
    private clienteService: ClienteService,
    private toastr: ToastrService,
    private router: Router,
    private logger: LoggingService,
  ) {}

  ngOnInit(): void {
    this.rol = this.userService.getUserRole() || null;
    this.esAdmin = this.rol === 'Administrador';
    this.rol === 'Cliente' ? (this.mostrarCampo = false) : (this.mostrarCampo = true);
  }

  onSubmit(): void {
    const timestamp = new Date().toISOString();
    const userRole = this.rol;
    const userId = this.userService.getUserId();
    this.userId = userId !== null ? Number(userId) : 0;

    if (userRole === 'Administrador') {
      this.trabajadorService.getTrabajadorId(this.userId).subscribe({
        next: (response) => {
          this.nombreTrabajador = response.data.nombre + ' ' + response.data.apellido;

          this.crearReserva(timestamp, userRole, userId);
        },
        error: () => {
          this.nombreTrabajador = 'Administrador Desconocido';
          this.crearReserva(timestamp, userRole, userId);
        },
      });
    } else if (userRole === 'Cliente') {
      this.clienteService.getClienteId(this.userId).subscribe({
        next: (response) => {
          this.nombreCompleto = response.data.nombre + ' ' + response.data.apellido;
          this.telefono = response.data.telefono;

          this.crearReserva(timestamp, userRole, userId);
        },
        error: () => {
          this.nombreCompleto = 'Cliente Desconocido';
          this.crearReserva(timestamp, userRole, userId);
        },
      });
      this.crearReserva(timestamp, userRole, userId);
    } else {
      this.crearReserva(timestamp, userRole, userId);
    }
  }

  checkPersonas(): void {
    if (this.personas === '5+') {
      this.mostrarInputPersonas = true;
      this.mostrarInfoEvento = true;
    } else {
      this.mostrarInputPersonas = false;
      this.mostrarInfoEvento = false;
    }
  }
  private crearReserva(timestamp: string, userRole: string | null, userId: number | null): void {
    const totalPersonas = this.personas === '5+' ? this.personasExtra : Number(this.personas);
    if (this.horaReserva.length === 5) {
      this.horaReserva = `${this.horaReserva}:00`;
    }

    const [anio, mes, dia] = this.fechaReserva.split('-');
    const fechaReservaFormateada = `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;

    const reserva: ReservaCreate = {
      documentoCliente:
        userRole === 'Administrador'
          ? Number(userId)
          : userRole === 'Cliente'
            ? Number(userId)
            : Number(this.documentoCliente),
      estadoReserva: estadoReserva.PENDIENTE,
      fechaReserva: fechaReservaFormateada,
      horaReserva: this.horaReserva,
      indicaciones: this.indicaciones,
      nombreCompleto: this.nombreCompleto,
      personas: this.personas === '5+' ? this.personasExtra : Number(this.personas),
      telefono: this.telefono,
    };
    this.reservaService.crearReserva(reserva).subscribe({
      next: (response) => {
        this.toastr.success('Reserva creada exitosamente', 'Éxito');
        this.router.navigate(['/reservas']);
      },
      error: (error) => {
        this.logger.log(LogLevel.ERROR, 'Error al crear la reserva', error);
        this.toastr.error(error.message, 'Error');
      },
    });
  }
}
