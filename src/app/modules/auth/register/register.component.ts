import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { TrabajadorService } from '../../../core/services/trabajador.service';
import { UserService } from '../../../core/services/user.service';
import { Roles } from '../../../shared/constants';
import { Cliente } from '../../../shared/models/cliente.model';
import { Trabajador } from '../../../shared/models/trabajador.model';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { ClienteService } from './../../../core/services/cliente.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  providers: [FormatDatePipe],
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup<{
    documento: FormControl<string>;
    nombre: FormControl<string>;
    apellido: FormControl<string>;
    direccion: FormControl<string>;
    correo: FormControl<string>;
    password: FormControl<string>;
    esTrabajador: FormControl<boolean>;
    sueldo: FormControl<number | null>;
    telefono: FormControl<string>;
    observaciones: FormControl<string>;
    fechaNacimiento: FormControl<string>;
    nuevo: FormControl<boolean>;
    rol: FormControl<string>;
    horaEntrada: FormControl<string>;
    horaSalida: FormControl<string>;
  }> = new FormGroup({
    documento: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    apellido: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    direccion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    correo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    esTrabajador: new FormControl(false, { nonNullable: true }),
    sueldo: new FormControl<number | null>(null),
    telefono: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    observaciones: new FormControl('', { nonNullable: true }),
    fechaNacimiento: new FormControl('', { nonNullable: true }),
    nuevo: new FormControl(true, { nonNullable: true }),
    rol: new FormControl('', { nonNullable: true }),
    horaEntrada: new FormControl('', { nonNullable: true }),
    horaSalida: new FormControl('', { nonNullable: true }),
  });

  roles: string[] = [];
  horasEntradaDisponibles: string[] = ['08:00', '12:00', '16:00'];
  horasSalidaDisponibles: string[] = ['17:00', '20:00', '22:00'];

  constructor(
    private userService: UserService,
    private trabajadorService: TrabajadorService,
    private clienteService: ClienteService,
    private toastr: ToastrService,
    private router: Router,
    private formatDatePipe: FormatDatePipe,
  ) {}

  ngOnInit(): void {
    const admin = this.isAdmin();
    Object.values(Roles).forEach((element: string) => {
      this.roles.push(element);
    });
    this.registerForm.get('esTrabajador')?.valueChanges.subscribe((esTrabajador) => {
      if (esTrabajador) {
        this.registerForm.get('direccion')?.clearValidators();
        this.registerForm.get('correo')?.clearValidators();
        this.registerForm.get('fechaNacimiento')?.setValidators([Validators.required]);
        this.registerForm.get('nuevo')?.setValidators([Validators.required]);
        this.registerForm.get('sueldo')?.setValidators([Validators.required]);
        this.registerForm.get('rol')?.setValidators([Validators.required]);
        this.registerForm.get('horaEntrada')?.setValidators([Validators.required]);
        this.registerForm.get('horaSalida')?.setValidators([Validators.required]);
      } else {
        this.registerForm.get('direccion')?.setValidators([Validators.required]);
        this.registerForm.get('correo')?.setValidators([Validators.required, Validators.email]);
        this.registerForm.get('fechaNacimiento')?.clearValidators();
        this.registerForm.get('nuevo')?.clearValidators();
        this.registerForm.get('sueldo')?.clearValidators();
        this.registerForm.get('rol')?.clearValidators();
        this.registerForm.get('horaEntrada')?.clearValidators();
        this.registerForm.get('horaSalida')?.clearValidators();
      }
      [
        'direccion',
        'correo',
        'fechaNacimiento',
        'nuevo',
        'sueldo',
        'rol',
        'horaEntrada',
        'horaSalida',
      ].forEach((ctrl) => {
        this.registerForm
          .get(ctrl as keyof typeof this.registerForm.controls)
          ?.updateValueAndValidity();
      });
    });
  }

  isAdmin(): boolean {
    const rol = this.userService.getUserRole();
    if (rol === 'Administrador') {
      return true;
    }
    return false;
  }

  get esTrabajador(): boolean {
    return this.registerForm.get('esTrabajador')?.value || false;
  }

  onSubmit(): void {
    const values = this.registerForm.getRawValue();
    const formattedFechaIngreso = this.formatDatePipe.transform(new Date());

    if (values.esTrabajador) {
      const formattedFechaNacimiento = this.formatDatePipe.transform(
        new Date(values.fechaNacimiento),
      );
      const trabajador: Trabajador = {
        documentoTrabajador: Number(values.documento),
        nombre: values.nombre,
        apellido: values.apellido,
        password: values.password,
        restauranteId: 1,
        rol: values.rol || 'Mesero',
        nuevo: values.nuevo,
        horario: `${values.horaEntrada} - ${values.horaSalida}`,
        sueldo: Number(values.sueldo),
        telefono: values.telefono,
        fechaIngreso: formattedFechaIngreso,
        fechaNacimiento: formattedFechaNacimiento,
      };
      this.trabajadorService.registroTrabajador(trabajador).subscribe({
        next: (response) => {
          if (response?.code === 201) {
            this.toastr.success(response?.message);
            this.router.navigate(['/']);
          } else {
            this.toastr.error(response?.message || 'Ocurrió un error desconocido', 'Error');
          }
        },
        error: (err) => {
          this.toastr.error(err.message, 'Error');
        },
      });
    } else {
      const cliente: Cliente = {
        documentoCliente: Number(values.documento),
        nombre: values.nombre,
        apellido: values.apellido,
        password: values.password,
        direccion: values.direccion,
        correo: values.correo,
        telefono: values.telefono,
        observaciones: values.observaciones,
      };
      this.clienteService.registroCliente(cliente).subscribe({
        next: (response) => {
          if (response?.code === 201) {
            this.toastr.success('Cliente registrado con éxito');
            this.router.navigate(['/']);
          } else {
            this.toastr.error(response.message || 'Ocurrió un error', 'Error');
          }
        },
        error: (err) => {
          this.toastr.error(err.message, 'Error');
        },
      });
    }
  }
}
