import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../core/services/user.service';
import { Roles } from '../../../shared/constants';

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
    private userService: UserService
  ) { }

  onSubmit(): void {
    this.userService.login({ documento: this.documento, password: this.password }).subscribe({
      next: (response) => {
        this.userService.saveToken(response.data.token);
        this.toastr.success('Inicio de sesión exitoso', `Bienvenido ${response.data.nombre}`);
        const userRole = this.userService.getUserRole();
        if (userRole === Roles.ADMINISTRADOR) {
          this.router.navigate(['/home']);
        } else if (userRole === Roles.CLIENTE) {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        if (err && err.message) {
          console.error('err.message:', err.message);
          this.toastr.error(err?.message, 'Error de autenticación');
        } else {
          console.error('No hay propiedad "message" en el error.');
          this.toastr.error('Credenciales incorrectas', 'Error de autenticación');
        }
      },
    });
  }
}
