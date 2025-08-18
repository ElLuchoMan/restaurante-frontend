import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { LoggingService } from '../../../core/services/logging.service';
import { UserService } from '../../../core/services/user.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class LoginComponent {
  documento: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private userService: UserService,
    private logger: LoggingService
  ) { }

  onSubmit(): void {
    this.userService
      .login({ documento: this.documento, password: this.password })
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.userService.saveToken(response.data.token);
          this.toastr.success(
            'Inicio de sesión exitoso',
            `Bienvenido ${response.data.nombre}`
          );
          this.router.navigate(['/home']);
        },
        error: (err) => {
          if (!environment.production) {
            if (err && err.message) {
              this.logger.error('err.message:', err.message);
            } else {
              this.logger.error('No hay propiedad "message" en el error.');
            }
          }
          if (err && err.message) {
            this.toastr.error(err?.message, 'Error de autenticación');
          } else {
            this.toastr.error(
              'Credenciales incorrectas',
              'Error de autenticación'
            );
          }
        },
      });
  }
}
