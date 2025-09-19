import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { LiveAnnouncerService } from '../../../core/services/live-announcer.service';
import { LoggingService, LogLevel } from '../../../core/services/logging.service';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  isPasswordVisible = false;
  progress = '0%';
  isButtonEnabled = false;
  documentoFocused = false;
  passwordFocused = false;
  rememberMe = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private userService: UserService,
    private logger: LoggingService,
    private telemetry: TelemetryService,
    private live: LiveAnnouncerService,
  ) {
    this.loginForm = this.fb.group({
      documento: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });

    // Progreso visual dentro del botón según validación
    this.loginForm.valueChanges.subscribe(() => this.updateProgress());

    // Configurar el tipo de almacenamiento según "Recordarme"
    this.userService.setRemember(this.rememberMe);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.telemetry.logLoginAttempt();
    this.userService
      .login(this.loginForm.value)
      .pipe(
        take(1),
        finalize(() => (this.isSubmitting = false)),
      )
      .subscribe({
        next: (response) => {
          // Usar el nuevo sistema de tokens si están disponibles
          if (response.data.access_token && response.data.refresh_token) {
            this.userService.saveTokens(response.data.access_token, response.data.refresh_token);
          } else {
            // Fallback para compatibilidad hacia atrás
            this.userService.saveToken(response.data.token);
          }

          this.live.announce('Sesión iniciada');
          this.toastr.success('Inicio de sesión exitoso', `Bienvenido ${response.data.nombre}`);
          this.telemetry.logLoginSuccess(this.userService.getUserId?.() ?? null);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          if (!environment.production) {
            if (err && err.message) {
              this.logger.log(LogLevel.ERROR, 'Error de inicio de sesión', err);
            } else {
              this.logger.log(LogLevel.ERROR, 'No hay propiedad "message" en el error.');
            }
          }
          this.telemetry.logLoginFailure();
          if (err && err.message) {
            this.toastr.error(err?.message, 'Error de autenticación');
          } else {
            this.toastr.error('Credenciales incorrectas', 'Error de autenticación');
          }
        },
      });
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  private updateProgress(): void {
    const docValid = this.loginForm.get('documento')?.value?.toString().trim().length > 0;
    const passValid = this.loginForm.get('password')?.valid ?? false;

    if (docValid && passValid) {
      this.progress = '100%';
      // Delay para que se vea la animación completarse antes de habilitar el botón
      setTimeout(() => {
        this.isButtonEnabled = true;
      }, 450); // 50ms más que la animación CSS (400ms)
    } else {
      this.isButtonEnabled = false;
      if (docValid) {
        this.progress = '50%';
      } else {
        this.progress = '0%';
      }
    }
  }

  onRememberChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.rememberMe = target.checked;
    this.userService.setRemember(this.rememberMe);

    // Anunciar el cambio para accesibilidad
    this.live.announce(
      this.rememberMe
        ? 'Sesión se mantendrá activa por 30 días'
        : 'Sesión se cerrará al cerrar el navegador',
    );
  }
}
