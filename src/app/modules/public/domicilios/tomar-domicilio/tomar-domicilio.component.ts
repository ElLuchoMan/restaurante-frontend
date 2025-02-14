import { Component, OnInit } from '@angular/core';
import { DomicilioService } from '../../../../core/services/domicilio.service';
import { Domicilio } from '../../../../shared/models/domicilio.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tomar-domicilio',
  standalone: true,
  templateUrl: './tomar-domicilio.component.html',
  styleUrls: ['./tomar-domicilio.component.scss']
})
export class TomarDomicilioComponent implements OnInit {
  domicilios: Domicilio[] = [];
  trabajadorId: number = 1035467890; // Aquí se debería asignar el ID del trabajador autenticado

  constructor(
    private domicilioService: DomicilioService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.obtenerDomiciliosDisponibles();
  }

  obtenerDomiciliosDisponibles(): void {
    this.domicilioService.getDomicilios({ trabajador: this.trabajadorId }).subscribe({
      next: (response) => {
        this.domicilios = response.data;
      },
      error: () => {
        this.toastr.error('No hay domicilios disponibles', 'Error');
      }
    });
  }

  tomarDomicilio(domicilio: Domicilio): void {
    if (!domicilio.domicilioId) {
      this.toastr.error('ID de domicilio no válido', 'Error');
      return;
    }
    this.domicilioService.updateDomicilio(domicilio.domicilioId, { trabajadorAsignado: this.trabajadorId }).subscribe({
      next: () => {
        this.toastr.success('Domicilio asignado con éxito', 'Éxito');
        this.obtenerDomiciliosDisponibles();
      },
      error: () => {
        this.toastr.error('Error al asignar domicilio', 'Error');
      }
    });
  }
}
