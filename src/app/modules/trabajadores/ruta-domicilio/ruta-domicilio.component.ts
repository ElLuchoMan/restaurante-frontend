import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { DomicilioService } from '../../../core/services/domicilio.service';
import { estadoPago } from '../../../shared/constants';

@Component({
  selector: 'app-ruta-domicilio',
  standalone: true,
  templateUrl: './ruta-domicilio.component.html',
  styleUrls: ['./ruta-domicilio.component.scss'],
  imports: [CommonModule]
})
export class RutaDomicilioComponent implements OnInit {
  ubicacionUrl: SafeResourceUrl | undefined;
  direccionCliente: string = '';
  telefonoCliente: string = '';
  observaciones: string = '';
  googleMapsUrl: string = '';
  domicilioId: number = 0; // Asumimos que el ID se pasa por queryParams

  private restauranteDireccion = 'Calle 78a # 62 - 48, Bogotá, Colombia';

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private domicilioService: DomicilioService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.direccionCliente = params['direccion'] || 'Calle 100 # 13 - 55, Bogotá, Colombia';
      this.telefonoCliente = params['telefono'] || 'No disponible';
      this.observaciones = params['observaciones'] || 'Sin observaciones';
      this.domicilioId = params['id'] ? +params['id'] : 0;

      if (this.direccionCliente) {
        this.generarRuta();
        this.generarUrlGoogleMaps();
      }
    });
  }

  private generarRuta(): void {
    const apiKey = environment.googleMapsApiKey;
    const origen = encodeURIComponent(this.restauranteDireccion);
    const destino = encodeURIComponent(this.direccionCliente);
    const url = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${origen}&destination=${destino}&mode=driving&avoid=tolls|highways`;
    this.ubicacionUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private generarUrlGoogleMaps(): void {
    const origen = encodeURIComponent(this.restauranteDireccion);
    const destino = encodeURIComponent(this.direccionCliente);
    this.googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origen}&destination=${destino}`;
  }

  marcarFinalizado(): void {
    if (this.domicilioId) {
      this.domicilioService.updateDomicilio(this.domicilioId, { entregado: true })
        .subscribe(
          response => {
            console.log('Domicilio marcado como finalizado', response);
            // Aquí podrías agregar lógica para notificar al usuario o actualizar la UI
          },
          error => {
            console.error('Error al marcar finalizado', error);
          }
        );
    } else {
      console.error('No se encontró el ID del domicilio.');
    }
  }

  marcarPago(): void {
    if (this.domicilioId) {
      this.domicilioService.updateDomicilio(this.domicilioId, { estadoPago: estadoPago.PAGADO })
        .subscribe(
          response => {
            console.log('Domicilio marcado como pagado', response);
            // Aquí podrías agregar lógica para notificar al usuario o actualizar la UI
          },
          error => {
            console.error('Error al marcar pago', error);
          }
        );
    } else {
      console.error('No se encontró el ID del domicilio.');
    }
  }
  volver(): void {
    this.router.navigate(['/trabajador/domicilios/tomar']);
  }
  
}
