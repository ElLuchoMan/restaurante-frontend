import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';

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
  googleMapsUrl: string = '';

  private restauranteDireccion = 'Calle 78a # 62 - 48, Bogotá, Colombia';

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.direccionCliente = params['direccion'] || 'Calle 100 # 13 - 55, Bogotá, Colombia';

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
}
