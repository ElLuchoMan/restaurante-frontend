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
  wazeLink = 'https://waze.com/ul?q=Calle%2078a%20%23%2062%20-%2048%2C%20Bogot%C3%A1%2C%20Colombia';
  isWebView = false;
  platform: 'ios' | 'android' | 'web' = 'web';

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private domicilioService: DomicilioService,
    private toastr: ToastrService,
  ) {
    const apiKey = getGoogleMapsApiKey();
    const address = encodeURIComponent('Calle 78a # 62 - 48, Bogotá, Colombia');
    const base = `https://www.google.com/maps/embed/v1/place`;
    const url = apiKey
      ? `${base}?key=${apiKey}&q=${address}`
      : `https://www.google.com/maps?q=${address}&output=embed`;
    this.ubicacionUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.mostrarInfo = true;
    }, 500);

    // Detectar Capacitor WebView (no web puro)
    try {
      const cap: any = typeof window !== 'undefined' ? (window as any).Capacitor : undefined;
      const platform = cap && typeof cap.getPlatform === 'function' ? cap.getPlatform() : 'web';
      this.platform = (platform as 'ios' | 'android' | 'web') ?? 'web';
      this.isWebView = this.platform !== 'web';
    } catch {
      this.isWebView = false;
      this.platform = 'web';
    }
  }

  call(): void {
    window.location.href = 'tel:3042449339';
  }

  get mapsLink(): string {
    const address = encodeURIComponent('Calle 78a # 62 - 48, Bogotá, Colombia');
    if (this.platform === 'ios') {
      return `https://maps.apple.com/?q=${address}`;
    }
    return `https://maps.google.com/?q=${address}`;
  }
}
