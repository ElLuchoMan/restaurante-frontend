import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class LoginComponent {
  documento: any = null;
  password: string = '';

  constructor(private router: Router, private toastr: ToastrService) { }

  onSubmit(): void {
    console.log('Documento:', this.documento);
    console.log('Password:', this.password);

    if (this.documento === 1234568 && this.password === 'password123') {
      this.router.navigate(['/']);
    } else {
      this.toastr.error('Credenciales incorrectas', 'Error de autenticación',);
    }
  }
}
