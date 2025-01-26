import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../core/services/user.service';
import { Cliente } from '../../../shared/models/cliente.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Trabajador } from '../../../shared/models/trabajador.model';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  documento: number | null = null;
  nombre: string = '';
  apellido: string = '';
  password: string = '';
  esTrabajador: boolean = false;
  sueldo?: number;
  rol?: string;

  constructor(
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router
  ) {
   }

  ngOnInit(): void {
    const admin = this.isAdmin();
  }

  isAdmin(): boolean {
    const rol = this.userService.getUserRole();
    if (rol === 'Administrador') {
      return true;
    }
    return false;
  }


  onSubmit(): void {
    if (this.esTrabajador) {
      const trabajador: Trabajador = {
        documentoTrabajador: this.documento!,
        nombre: this.nombre,
        apellido: this.apellido,
        password: this.password,
        restauranteId: 1,
        rol: this.rol || 'Empleado',
        nuevo: true,
        horario: '9:00 AM - 6:00 PM',
        sueldo: this.sueldo!,
        telefono: '',
        fechaIngreso: new Date(),
        fechaNacimiento: new Date(),
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
