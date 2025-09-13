import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LiveAnnouncerService {
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  announce(message: string, politeness: 'polite' | 'assertive' = 'polite'): void {
    if (!this.isBrowser) return;
    const region = this.document.getElementById('aria-live-region');
    if (!region) return;
    region.setAttribute('aria-live', politeness);
    // Limpia y vuelve a colocar el texto para forzar anuncio en lectores
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 50);
  }
}
