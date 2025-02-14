import { Component, AfterViewInit, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Domicilio } from '../../../shared/models/domicilio.model';
import { DomicilioService } from '../../../core/services/domicilio.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ubicacion-restaurante',
  standalone: true,
  templateUrl: './ubicacion-restaurante.component.html',
  styleUrls: ['./ubicacion-restaurante.component.scss'],
  imports: [CommonModule]
})
export class UbicacionRestauranteComponent implements AfterViewInit, OnInit {
  ubicacionUrl: SafeResourceUrl;
  mostrarInfo = false;
  domicilios: Domicilio[] = [];

  constructor(private sanitizer: DomSanitizer, private router: Router, private domicilioService: DomicilioService, private toastr: ToastrService) {
    const apiKey = environment.googleMapsApiKey;
    const address = encodeURIComponent('Calle 78a # 62 - 48, Bogotá, Colombia');
    const url = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${address}`;
    this.ubicacionUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngOnInit(): void {
    this.obtenerDomicilios();
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

  obtenerDomicilios(): void {
    this.domicilioService.getDomicilios().subscribe({
      next: (response) => {
        console.log(response);
        this.domicilios = response.data;
      },
      error: (error) => {
        this.toastr.error('Error al obtener domicilios', 'Error');
        console.error(error);
      }
    });
  }
}
