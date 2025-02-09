import { Component, AfterViewInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';

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

  constructor(private sanitizer: DomSanitizer) {
    const apiKey = environment.token;
    const address = encodeURIComponent('Calle 78a # 62 - 48, Bogotá, Colombia');
    const url = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${address}`;
    this.ubicacionUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.mostrarInfo = true;
    }, 500);
  }
}
