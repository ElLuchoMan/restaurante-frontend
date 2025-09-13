import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { DomicilioService } from '../../../core/services/domicilio.service';
import { getGoogleMapsApiKey } from '../../../shared/utils/config';

@Component({
  selector: 'app-ubicacion-restaurante',
  standalone: true,
  templateUrl: './ubicacion-restaurante.component.html',
  styleUrls: ['./ubicacion-restaurante.component.scss'],
  imports: [CommonModule],
})
export class UbicacionRestauranteComponent implements AfterViewInit {
  ubicacionUrl: SafeResourceUrl;
  mostrarInfo = false;

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private domicilioService: DomicilioService,
    private toastr: ToastrService,
  ) {
    const apiKey = getGoogleMapsApiKey();
    const address = encodeURIComponent('Calle 78a # 62 - 48, Bogotá, Colombia');
    const base = `https://www.google.com/maps/embed/v1/place`;
    const url = apiKey ? `${base}?key=${apiKey}&q=${address}` : `${base}?q=${address}`;
    this.ubicacionUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.mostrarInfo = true;
    }, 500);
  }
}
