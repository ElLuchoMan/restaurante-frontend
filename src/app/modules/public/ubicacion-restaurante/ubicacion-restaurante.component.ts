import { Component, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ubicacion-restaurante',
  standalone: true,
  templateUrl: './ubicacion-restaurante.component.html',
  styleUrls: ['./ubicacion-restaurante.component.scss'],
  imports: [CommonModule]
})
export class UbicacionRestauranteComponent implements AfterViewInit {
  ubicacionUrl: SafeResourceUrl;
  mostrarInfo = false;

  constructor(private sanitizer: DomSanitizer, private router: Router) {
    const apiKey = environment.googleMapsApiKey;
    const address = encodeURIComponent('Calle 78a # 62 - 48, Bogotá, Colombia');
    const url = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${address}`;
    this.ubicacionUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.mostrarInfo = true;
    }, 500);
  }

  irARutaDomicilio(): void {
    const direccionClienteFake = 'Super Manana 2 portería 7, Bogotá, Colombia';
    this.router.navigate(['/trabajador/ruta-domicilio'], { queryParams: { direccion: direccionClienteFake } });
  }
}
