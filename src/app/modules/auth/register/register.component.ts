import { Component } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Trabajador } from '../../../shared/models/trabajador.model';
import { Cliente } from '../../../shared/models/cliente.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  documento: number | null = null;
  nombre: string = '';
  apellido: string = '';
  password: string = '';
  esTrabajador: boolean = false;
  sueldo?: number;
  rol?: string;

  constructor(private userService: UserService, private toastr: ToastrService, private router: Router) { }

  onSubmit(): void {
    if (this.esTrabajador) {
      const trabajador: Trabajador = {
        documentoTrabajador: this.documento!,
        nombre: this.nombre,
        apellido: this.apellido,
        password: this.password,
        restauranteId: 1, // Cambiar según sea necesario
        rol: this.rol || 'Empleado',
        nuevo: true,
        horario: '9:00 AM - 6:00 PM',
        sueldo: this.sueldo!,
        telefono: '',
        fechaIngreso: new Date(),
        fechaNacimiento: new Date(), // Cambiar según el formulario
      };

      this.userService.registroTrabajador(trabajador).subscribe({
        next: () => {
          this.toastr.success('Trabajador registrado con éxito');
          this.router.navigate(['/']);
        },
        error: (err) => this.toastr.error(err.message, 'Error'),
      });
    } else {
      const cliente: Cliente = {
        documentoCliente: this.documento!,
        nombre: this.nombre,
        apellido: this.apellido,
        password: this.password,
        direccion: '',
        telefono: '',
        observaciones: '',
      };

      this.userService.registroCliente(cliente).subscribe({
        next: () => {
          this.toastr.success('Cliente registrado con éxito');
          this.router.navigate(['/']);
        },
        error: (err) => this.toastr.error(err.message, 'Error'),
      });
    }
  }
}
