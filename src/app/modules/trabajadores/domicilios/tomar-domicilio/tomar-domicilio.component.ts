import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DomicilioService } from '../../../../core/services/domicilio.service';
import { UserService } from '../../../../core/services/user.service';
import { Domicilio } from '../../../../shared/models/domicilio.model';
import { fechaYYYYMMDD_Bogota } from '../../../../shared/utils/dateHelper';

@Component({
  selector: 'app-tomar-domicilio',
  standalone: true,
  templateUrl: './tomar-domicilio.component.html',
  styleUrls: ['./tomar-domicilio.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CommonModule, FormsModule],
})
export class TomarDomicilioComponent implements OnInit {
  domicilios: Domicilio[] = [];
  trabajadorId: number | null = null;
  mostrarMensaje: boolean = false;
  mensaje: string = 'No se encontraron domicilios disponibles';

  constructor(
    private domicilioService: DomicilioService,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.trabajadorId = this.userService.getUserId();
    this.obtenerDomiciliosDisponibles();
  }

  obtenerDomiciliosDisponibles(): void {
    if (!this.trabajadorId) return;

    const params = { trabajador: this.trabajadorId, fecha: fechaYYYYMMDD_Bogota() };

    // Sin domicilios el back responde 200 con `data: []` (el aviso por defecto ya se muestra).
    this.domicilioService.getDomicilios(params).subscribe({
      next: (response) => {
        this.domicilios = response.data.filter(
          (domicilio) =>
            !domicilio.entregado &&
            (!domicilio.trabajadorAsignado ||
              domicilio.trabajadorAsignado.documentoTrabajador === this.trabajadorId),
        );
      },
      error: (err) => {
        this.mostrarMensaje = true;
        this.mensaje = err?.message || 'No se pudieron cargar los domicilios';
      },
    });
  }

  tomarDomicilio(domicilio: Domicilio): void {
    if (!this.trabajadorId) return;

    this.domicilioService.asignarDomiciliario(domicilio.domicilioId!, this.trabajadorId).subscribe({
      // `data` es el domicilio completo ya asignado y EN_CAMINO.
      next: (response) => Object.assign(domicilio, response.data),
      // 409 (ya tomado por otro) o 404: se vuelve a consultar para mostrar el estado real.
      error: (err) => {
        this.mostrarMensaje = true;
        this.mensaje = err?.message || 'No se pudo tomar el domicilio';
        this.obtenerDomiciliosDisponibles();
      },
    });
  }

  irARuta(domicilio: Domicilio): void {
    this.router.navigate(['/trabajador', 'domicilios', 'ruta-domicilio'], {
      queryParams: {
        direccion: domicilio.direccion,
        telefono: domicilio.telefono,
        observaciones: domicilio.observaciones || null,
        id: domicilio.domicilioId,
      },
    });
  }
}
