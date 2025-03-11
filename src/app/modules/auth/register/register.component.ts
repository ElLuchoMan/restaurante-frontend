import { ClienteService } from './../../../core/services/cliente.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../core/services/user.service';
import { Cliente } from '../../../shared/models/cliente.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Trabajador } from '../../../shared/models/trabajador.model';
import { Roles } from '../../../shared/constants';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { TrabajadorService } from '../../../core/services/trabajador.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

  documento: any;
  nombre: string = '';
  apellido: string = '';
  direccion: string = '';
  password: string = '';
  esTrabajador: boolean = false;
  sueldo?: number;
  telefono: string = '';
  observaciones: string = '';
  fechaNacimiento: Date = new Date();
  fechaIngreso: Date = new Date();
  rol?: string;
  roles: string[] = [];
  nuevo: boolean = true;
  horasEntradaDisponibles: string[] = ['08:00', '12:00', '16:00'];
  horasSalidaDisponibles: string[] = ['17:00', '20:00', '22:00'];
  horaEntrada: string = '';
  horaSalida: string = '';

  constructor(
    private userService: UserService,
    private trabajadorService: TrabajadorService,
    private clienteService: ClienteService,
    private toastr: ToastrService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    const admin = this.isAdmin();
    Object.values(Roles).forEach((element: string) => {
      this.roles.push(element);
    });
  }

  isAdmin(): boolean {
    const rol = this.userService.getUserRole();
    if (rol === 'Administrador') {
      return true;
    }
    return false;
  }


  onSubmit(): void {
    const formattedFechaNacimiento = new FormatDatePipe().transform(this.fechaNacimiento);
    const formattedFechaIngreso = new FormatDatePipe().transform(new Date())
    if (this.esTrabajador) {
      const trabajador: Trabajador = {
        documentoTrabajador: this.documento,
        nombre: this.nombre,
        apellido: this.apellido,
        password: this.password,
        restauranteId: 1,
        rol: this.rol || 'Mesero',
        nuevo: true,
        horario: `${this.horaEntrada} - ${this.horaSalida}`,
        sueldo: this.sueldo!,
        telefono: this.telefono,
        fechaIngreso: formattedFechaIngreso,
        fechaNacimiento: formattedFechaNacimiento,
      };
      this.trabajadorService.registroTrabajador(trabajador).subscribe({
        next: response => {
          if (response?.code === 201) {
            this.toastr.success(response?.message);
            this.router.navigate(['/']);
          } else {
            this.toastr.error(response?.message || 'Ocurrió un error desconocido', 'Error');
          }
        },
        error: err => {
          this.toastr.error(err.message, 'Error');
        }
      });
    } else {
      const cliente: Cliente = {
        documentoCliente: this.documento!,
        nombre: this.nombre,
        apellido: this.apellido,
        password: this.password,
        direccion: this.direccion,
        telefono: this.telefono,
        observaciones: this.observaciones,
      };
      this.clienteService.registroCliente(cliente).subscribe({
        next: response => {
          if (response?.code === 201) {
            this.toastr.success('Cliente registrado con éxito');
            this.router.navigate(['/']);
          } else {
            this.toastr.error(response.message || 'Ocurrió un error', 'Error');
          }
        },
        error: err => {
          this.toastr.error(err.message, 'Error');
        }
      });
    }
  }
}
