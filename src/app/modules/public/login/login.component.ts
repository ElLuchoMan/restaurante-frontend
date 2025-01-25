import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../../core/services/user.service';

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
        if (userRole === 'Administrador') {
          this.router.navigate(['/admin']);
        } else if (userRole === 'cliente') {
          this.router.navigate(['/client']);
        }
      },
      error: (err) => {
        console.error('Err.message:', err.message);
        console.error('Err:', err);
        console.log('Error[9]:', err[0]);
        this.toastr.error(err?.message || 'Credenciales incorrectas', 'Error de autenticación');
      },
    });
  }
}
