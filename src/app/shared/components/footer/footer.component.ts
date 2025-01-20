import { Component } from '@angular/core';
import { Restaurante } from '../../models/restaurante.model';
import { CambioHorario } from '../../models/cambio-horario.model';
import { ApiResponse } from '../../models/api-response.model';
import { RestauranteService } from '../../../core/services/restaurante.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  restaurante !: ApiResponse<Restaurante>;
  cambioHorario !: ApiResponse<CambioHorario>;
  horaApertura: string = '08:00';
  horaCierre: string = '20:00';
  estado: string = 'Abierto';
  estadoActual: string = 'Abierto';

  constructor(private restauranteService: RestauranteService) { }
  ngOnInit(): void {

    this.restauranteService.getRestauranteInfo().subscribe((response: ApiResponse<Restaurante>) => {
      this.restaurante = response;
    });

    this.estadoActual = this.horaCierre < new Date().toLocaleTimeString() ? 'Cerrado' : 'Abierto';

    this.restauranteService.getCambiosHorario().subscribe({
      next: (response: ApiResponse<CambioHorario>) => {
        this.horaApertura = response.data.HORA_APERTURA;
        this.horaCierre = response.data.HORA_CIERRE;
        if (response.code !== 404) {
          if (!response.data.ABIERTO) {
            this.estado = 'Cerrado';
            this.horaApertura = 'No Aplica';
            this.horaCierre = 'No Aplica';
          }

        }
        this.cambioHorario = response;
      },
      error: (error) => {

      },
    });
  }

}

