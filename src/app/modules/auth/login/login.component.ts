import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';

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
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.telemetry.logLoginAttempt();
    this.userService
      .login(this.loginForm.value)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.userService.saveToken(response.data.token);
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
}
