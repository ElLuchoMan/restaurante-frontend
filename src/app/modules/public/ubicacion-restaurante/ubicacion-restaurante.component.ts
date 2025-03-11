import { Component, AfterViewInit, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomicilioService } from '../../../core/services/domicilio.service';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private sanitizer: DomSanitizer, private router: Router, private domicilioService: DomicilioService, private toastr: ToastrService) {
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
}
