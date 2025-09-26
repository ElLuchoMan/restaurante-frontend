import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { HorarioTrabajadorService } from '../../../core/services/horario-trabajador.service';
import { TrabajadorService } from '../../../core/services/trabajador.service';
import { UserService } from '../../../core/services/user.service';
import { DiaSemana, RolTrabajador } from '../../../shared/constants';
import { Cliente } from '../../../shared/models/cliente.model';
import { HorarioTrabajador } from '../../../shared/models/horario-trabajador.model';
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
  // Focus states para las animaciones de los inputs
  documentoFocused = false;
  nombreFocused = false;
  apellidoFocused = false;
  telefonoFocused = false;
  direccionFocused = false;
  correoFocused = false;
  passwordFocused = false;
  fechaNacimientoFocused = false;
  sueldoFocused = false;
  rolFocused = false;
  isPasswordVisible = false;
  isSubmitting = false;
  progress = 0;

  // Sistema de horarios simplificado
  diasSemana = Object.values(DiaSemana);

  // Horario general (por defecto para toda la semana)
  horarioGeneral = {
    horaInicio: '08:00',
    horaFin: '17:00',
  };

  // Switch para activar horarios personalizados por día
  horariosDiferentes = false;

  // Días seleccionados para personalizar
  diasPersonalizados: { [key in DiaSemana]: boolean } = {
    [DiaSemana.DiaLunes]: false,
    [DiaSemana.DiaMartes]: false,
    [DiaSemana.DiaMiercoles]: false,
    [DiaSemana.DiaJueves]: false,
    [DiaSemana.DiaViernes]: false,
    [DiaSemana.DiaSabado]: false,
    [DiaSemana.DiaDomingo]: false,
  };

  // Horarios específicos solo para días personalizados
  horariosPersonalizados: {
    [key in DiaSemana]: { diaLibre: boolean; horaInicio: string; horaFin: string };
  } = {
    [DiaSemana.DiaLunes]: { diaLibre: false, horaInicio: '08:00', horaFin: '17:00' },
    [DiaSemana.DiaMartes]: { diaLibre: false, horaInicio: '08:00', horaFin: '17:00' },
    [DiaSemana.DiaMiercoles]: { diaLibre: false, horaInicio: '08:00', horaFin: '17:00' },
    [DiaSemana.DiaJueves]: { diaLibre: false, horaInicio: '08:00', horaFin: '17:00' },
    [DiaSemana.DiaViernes]: { diaLibre: false, horaInicio: '08:00', horaFin: '17:00' },
    [DiaSemana.DiaSabado]: { diaLibre: false, horaInicio: '08:00', horaFin: '17:00' },
    [DiaSemana.DiaDomingo]: { diaLibre: true, horaInicio: '', horaFin: '' },
  };

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
  });

  roles: string[] = [];

  constructor(
    private userService: UserService,
    private trabajadorService: TrabajadorService,
    private horarioTrabajadorService: HorarioTrabajadorService,
    private clienteService: ClienteService,
    private toastr: ToastrService,
    private router: Router,
    private formatDatePipe: FormatDatePipe,
  ) {}

  ngOnInit(): void {
    const admin = this.isAdmin();
    Object.values(RolTrabajador).forEach((element: string) => {
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
    if (this.registerForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    this.progress = 30; // Progreso inicial

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
        rol: (values.rol as unknown as RolTrabajador) || RolTrabajador.RolMesero,
        nuevo: values.nuevo,
        horario: 'Definido por días', // Los horarios se manejan por separado
        sueldo: Number(values.sueldo),
        telefono: values.telefono,
        fechaIngreso: formattedFechaIngreso,
        fechaNacimiento: formattedFechaNacimiento,
      };
      this.progress = 70; // Progreso medio

      this.trabajadorService.registroTrabajador(trabajador).subscribe({
        next: async (response) => {
          if (response?.code === 201) {
            this.progress = 80; // Trabajador creado, ahora crear horarios

            try {
              // Crear horarios del trabajador
              await this.crearHorariosTrabajador(Number(values.documento));

              this.progress = 100; // Completado
              this.isSubmitting = false;
              this.toastr.success('Trabajador y horarios registrados con éxito');
              this.router.navigate(['/']);
            } catch (error) {
              this.progress = 0;
              this.isSubmitting = false;
              this.toastr.error('Trabajador creado, pero error al crear horarios', 'Error');
            }
          } else {
            this.progress = 0; // Reset en error
            this.isSubmitting = false;
            this.toastr.error(response?.message || 'Ocurrió un error desconocido', 'Error');
          }
        },
        error: (err) => {
          this.progress = 0; // Reset en error
          this.isSubmitting = false;
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
      this.progress = 70; // Progreso medio

      this.clienteService.registroCliente(cliente).subscribe({
        next: (response) => {
          this.progress = 100; // Completado
          this.isSubmitting = false;

          if (response?.code === 201) {
            this.toastr.success('Cliente registrado con éxito');
            this.router.navigate(['/']);
          } else {
            this.toastr.error(response.message || 'Ocurrió un error', 'Error');
            this.progress = 0; // Reset en error
          }
        },
        error: (err) => {
          this.progress = 0; // Reset en error
          this.isSubmitting = false;
          this.toastr.error(err.message, 'Error');
        },
      });
    }
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  trackByDia(index: number, dia: DiaSemana): string {
    return dia;
  }

  calculateDuration(horaInicio: string, horaFin: string): string {
    if (!horaInicio || !horaFin) return '';

    const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
    const [finHora, finMin] = horaFin.split(':').map(Number);

    const inicioMinutos = inicioHora * 60 + inicioMin;
    const finMinutos = finHora * 60 + finMin;

    const duracionMinutos = finMinutos - inicioMinutos;
    const horas = Math.floor(duracionMinutos / 60);
    const minutos = duracionMinutos % 60;

    if (horas === 0) return `${minutos}min`;
    if (minutos === 0) return `${horas}h`;
    return `${horas}h ${minutos}min`;
  }

  // Métodos para el nuevo sistema de horarios
  onHorariosDiferentesChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.horariosDiferentes = target.checked;

    // Si se desactiva, resetear días personalizados
    if (!target.checked) {
      this.diasPersonalizados = Object.keys(this.diasPersonalizados).reduce(
        (acc, dia) => {
          acc[dia as DiaSemana] = false;
          return acc;
        },
        {} as { [key in DiaSemana]: boolean },
      );
    }
  }

  onHorarioGeneralChange(tipo: 'inicio' | 'fin', event: Event): void {
    const target = event.target as HTMLInputElement;
    if (tipo === 'inicio') {
      this.horarioGeneral.horaInicio = target.value;
    } else {
      this.horarioGeneral.horaFin = target.value;
    }
  }

  onDiaPersonalizadoChange(dia: DiaSemana, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.diasPersonalizados[dia] = target.checked;

    // Si se marca el día, copiar el horario general como base
    if (target.checked) {
      this.horariosPersonalizados[dia] = {
        diaLibre: false,
        horaInicio: this.horarioGeneral.horaInicio,
        horaFin: this.horarioGeneral.horaFin,
      };
    }
  }

  onDiaLibreChange(dia: DiaSemana, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.horariosPersonalizados[dia].diaLibre = target.checked;

    if (target.checked) {
      // Si es día libre, limpiar las horas
      this.horariosPersonalizados[dia].horaInicio = '';
      this.horariosPersonalizados[dia].horaFin = '';
    } else {
      // Si no es día libre, poner horarios por defecto
      this.horariosPersonalizados[dia].horaInicio = this.horarioGeneral.horaInicio;
      this.horariosPersonalizados[dia].horaFin = this.horarioGeneral.horaFin;
    }
  }

  onHorarioPersonalizadoChange(dia: DiaSemana, tipo: 'inicio' | 'fin', event: Event): void {
    const target = event.target as HTMLInputElement;
    if (tipo === 'inicio') {
      this.horariosPersonalizados[dia].horaInicio = target.value;
    } else {
      this.horariosPersonalizados[dia].horaFin = target.value;
    }
  }

  private async crearHorariosTrabajador(documentoTrabajador: number): Promise<void> {
    const horariosParaCrear: HorarioTrabajador[] = [];

    for (const dia of this.diasSemana) {
      let horario;

      if (this.horariosDiferentes && this.diasPersonalizados[dia]) {
        // Usar horario personalizado para este día
        horario = this.horariosPersonalizados[dia];
      } else if (!this.horariosDiferentes || !this.diasPersonalizados[dia]) {
        // Usar horario general para este día
        horario = {
          diaLibre: false,
          horaInicio: this.horarioGeneral.horaInicio,
          horaFin: this.horarioGeneral.horaFin,
        };
      } else {
        // Día personalizado pero sin horario definido, usar general
        horario = {
          diaLibre: false,
          horaInicio: this.horarioGeneral.horaInicio,
          horaFin: this.horarioGeneral.horaFin,
        };
      }

      // Solo crear horario si no es día libre y tiene horas válidas
      if (!horario.diaLibre && horario.horaInicio && horario.horaFin) {
        horariosParaCrear.push({
          documentoTrabajador,
          dia,
          horaInicio: horario.horaInicio + ':00', // Agregar segundos
          horaFin: horario.horaFin + ':00', // Agregar segundos
        });
      }
    }

    // Crear todos los horarios
    for (const horarioData of horariosParaCrear) {
      try {
        await this.horarioTrabajadorService.create(horarioData).toPromise();
      } catch (error) {
        console.error('Error creando horario para', horarioData.dia, error);
        throw error;
      }
    }
  }
}
