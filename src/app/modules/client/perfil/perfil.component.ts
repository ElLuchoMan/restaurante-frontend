import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  private router = inject(Router);

  documento: number = 0;
  nombre: string = 'Cliente';
  direccion: string = '';
  telefono: string = '';
  observaciones: string = '';
  correo: string = '';

  cargando = true;
  errorCargando = false;

  constructor(
    private userService: UserService,
    private clienteService: ClienteService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    // Documento (ID) desde el JWT
    this.documento = this.userService.getUserId();

    // Si no hay documento en el token → sesión inválida
      if (!this.documento) {
      this.router.navigate(['/login']);
      return;
    }

    // Nombre desde el JWT (mostrado en el encabezado)
    const tokenDecoded = this.userService.decodeToken();
    this.nombre = tokenDecoded?.nombre ?? 'Cliente';

    // Traer datos del cliente desde el API
    this.clienteService.getClienteId(this.documento).subscribe({
      next: (response) => {
        const data = response?.data ?? null;
        this.direccion = data?.direccion ?? 'No registrada';
        this.telefono = data?.telefono ?? 'No registrado';
        this.observaciones =
          data?.observaciones === 'Cliente frecuente' ? 'Cliente frecuente' : '';
        this.correo = data?.correo ?? 'No registrado';
        this.cargando = false;
        this.errorCargando = false;
      },
      error: (err) => {
        this.toastr.error('Error al cargar los datos del cliente', 'Error');
        console.error('Error cargando cliente', err);
        this.direccion = 'No registrada';
        this.telefono = 'No registrado';
        this.observaciones = '';
        this.cargando = false;
        this.errorCargando = true;
      },
    });
  }
}
