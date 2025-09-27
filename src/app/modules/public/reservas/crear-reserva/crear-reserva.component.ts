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
  documentoContacto: string = '';
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
          this.toastr.warning('No se pudo cargar la información del cliente', 'Error');
          this.crearReserva(timestamp, userRole, userId);
        },
      });
      // La reserva se crea dentro del callback anterior; evitar doble invocación
    } else {
      // Rol distinto a Cliente (incluye Administrador): pedir documento manual
      this.crearReserva(timestamp, null, null);
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

    // Construir payload de acuerdo a guía actualizada
    const base: ReservaCreate & {
      documentoCliente?: number | null;
      documentoContacto?: number | null;
      nombreCompleto?: string;
      telefono?: string;
    } = {
      estadoReserva: estadoReserva.PENDIENTE,
      fechaReserva: fechaReservaFormateada,
      horaReserva: this.horaReserva,
      indicaciones: this.indicaciones,
      personas: totalPersonas,
      restauranteId: 1,
    };

    if (userRole === 'Cliente') {
      // Usuario loggeado: enviar documento del JWT
      if (typeof this.userId === 'number' && !isNaN(this.userId) && this.userId > 0) {
        base.documentoCliente = this.userId;
      }
    } else {
      // Invitado o administrador: enviar datos completos de contacto
      const docContacto = Number(this.documentoContacto);
      base.nombreCompleto = this.nombreCompleto;
      base.telefono = this.telefono || undefined;
      base.documentoContacto = !isNaN(docContacto) ? docContacto : null;
    }

    this.reservaService.crearReserva(base).subscribe({
      next: (response) => {
        this.toastr.success('Reserva creada exitosamente', 'Éxito');
        // Refrescar el formulario como indicó el usuario
        this.router.navigate(['/reservas/crear']);
      },
      error: (error) => {
        this.logger.log(LogLevel.ERROR, 'Error al crear la reserva', error);
        this.toastr.error(error.message, 'Error');
      },
    });
  }
}
