import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { LoggingService, LogLevel } from '../../../../core/services/logging.service';
import { ReservaNotificationsService } from '../../../../core/services/reserva-notifications.service';
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
  // Validación de anticipación mínima
  minFechaReserva: string = '';

  constructor(
    private reservaService: ReservaService,
    private userService: UserService,
    private trabajadorService: TrabajadorService,
    private clienteService: ClienteService,
    private toastr: ToastrService,
    private router: Router,
    private logger: LoggingService,
    private reservaNoti: ReservaNotificationsService,
  ) {}

  ngOnInit(): void {
    this.rol = this.userService.getUserRole() || null;
    this.esAdmin = this.rol === 'Administrador';
    this.rol === 'Cliente' ? (this.mostrarCampo = false) : (this.mostrarCampo = true);
    // No permitir reservas para hoy ni mañana (mínimo 2 días de anticipación)
    const hoy = new Date();
    this.minFechaReserva = this.formatDateForInput(this.addDays(hoy, 2));
    // Input nativo de hora con ajuste a saltos de 30 via onHoraChange
  }

  onSubmit(): void {
    // Bloquear creación si no cumple anticipación mínima
    if (this.fechaNoPermitida) {
      this.toastr.warning('La fecha debe ser con al menos 2 días de anticipación', 'Atención');
      return;
    }
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
      next: async (response) => {
        this.toastr.success('Reserva creada exitosamente', 'Éxito');
        try {
          // Solo clientes loggeados: notificar creación
          const rolActual = this.rol || this.userService.getUserRole() || '';
          if (rolActual === 'Cliente') {
            await this.reservaNoti.notifyCreacion({
              fechaReserva: (response as any)?.data?.fechaReserva || fechaReservaFormateada,
              horaReserva: (response as any)?.data?.horaReserva || this.horaReserva,
              documentoCliente:
                ((response as any)?.data && (response as any).data.documentoCliente) ??
                base.documentoCliente ??
                this.userId,
              reservaId: (response as any)?.data?.reservaId,
            } as any);
          }
        } catch {}
        // Redirección según rol
        const rolActual = this.rol || this.userService.getUserRole() || '';
        if (rolActual === 'Administrador') {
          this.router.navigate(['/admin/reservas']);
        } else if (rolActual === 'Cliente') {
          this.router.navigate(['/reservas/consultar']);
        } else {
          // Invitado u otro: mantener en crear
          this.router.navigate(['/reservas/crear']);
        }
      },
      error: (error) => {
        this.logger.log(LogLevel.ERROR, 'Error al crear la reserva', error);
        this.toastr.error(error.message, 'Error');
      },
    });
  }

  // Helpers de fecha
  private addDays(base: Date, days: number): Date {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    d.setDate(d.getDate() + days);
    return d;
  }

  private formatDateForInput(date: Date): string {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get fechaNoPermitida(): boolean {
    if (!this.fechaReserva) return false;
    const parts = this.fechaReserva.split('-');
    if (parts.length !== 3) return false;
    const selected = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    selected.setHours(0, 0, 0, 0);
    const min = new Date();
    min.setHours(0, 0, 0, 0);
    min.setDate(min.getDate() + 2);
    return selected < min;
  }

  onHoraChange(inputEl?: HTMLInputElement): void {
    if (!this.horaReserva) return;
    const [hStr, mStr] = this.horaReserva.split(':');
    let hour = Number(hStr);
    let minute = Number(mStr);
    if (isNaN(hour) || isNaN(minute)) return;

    // Limitar a 0–23 y 0–59
    hour = Math.max(0, Math.min(23, hour));
    minute = Math.max(0, Math.min(59, minute));

    // Redondear al valor más cercano: 00 si [0..14], 30 si [15..44], 00 de la siguiente hora si [45..59]
    if (minute <= 14) {
      minute = 0;
    } else if (minute <= 44) {
      minute = 30;
    } else {
      minute = 0;
      hour = (hour + 1) % 24;
    }

    const hh = String(hour).padStart(2, '0');
    const mm = String(minute).padStart(2, '0');
    const normalized = `${hh}:${mm}`;
    if (this.horaReserva !== normalized) {
      this.horaReserva = normalized;
      // Re-abrir el picker para reflejar la hora corregida (cuando soporte)
      try {
        (inputEl as any)?.showPicker?.();
      } catch {}
    }
  }

  openTimePicker(inputEl: HTMLInputElement): void {
    try {
      // showPicker está soportado en Chromium/Android; en iOS abrirá el control nativo con el foco/click
      (inputEl as any).showPicker?.();
    } catch {
      // Silencioso si no existe
    }
  }
}
