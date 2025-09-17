import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LoggingService, LogLevel } from '../../../core/services/logging.service';
import { RestauranteService } from '../../../core/services/restaurante.service';
import { ApiResponse } from '../../models/api-response.model';
import { CambioHorario } from '../../models/cambio-horario.model';
import { Restaurante } from '../../models/restaurante.model';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  restaurante!: ApiResponse<Restaurante>;
  cambioHorario!: ApiResponse<CambioHorario>;
  horaApertura: string = '08:00';
  horaCierre: string = '20:00';
  estado: string = 'Abierto';
  estadoActual: string = 'Abierto';

  constructor(
    private restauranteService: RestauranteService,
    private router: Router,
    private logger: LoggingService,
  ) {}

  ngOnInit(): void {
    this.restauranteService.getRestauranteInfo().subscribe((response: ApiResponse<Restaurante>) => {
      this.restaurante = response;
    });

    if (this.horaCierre && this.horaApertura) {
      const horaActual = new Date().toLocaleTimeString('en-GB', { hour12: false });
      this.estadoActual =
        horaActual >= this.horaApertura && horaActual <= this.horaCierre ? 'Abierto' : 'Cerrado';
    }

    this.restauranteService.getCambiosHorario().subscribe({
      next: (response: ApiResponse<CambioHorario>) => {
        if (response.data != undefined) {
          this.horaApertura = response.data?.horaApertura ?? this.horaApertura;
          this.horaCierre = response.data?.horaCierre ?? this.horaCierre;
          if (response.data?.abierto === false) {
            this.estado = 'Cerrado';
            this.horaApertura = 'No Aplica';
            this.horaCierre = 'No Aplica';
          }
        }
        this.cambioHorario = response;
      },
      error: (error) => {
        this.logger.log(LogLevel.ERROR, error);
      },
    });
  }

  esPaginaUbicacion(): boolean {
    return this.router.url.includes('/ubicacion');
  }
}
