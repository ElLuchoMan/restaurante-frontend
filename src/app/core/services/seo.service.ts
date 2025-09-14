import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title,
  ) {}

  update(description?: string): void {
    const pageTitle = this.title.getTitle();
    const desc = description || 'Restaurante colombiano: tradición e innovación en cada plato.';
    // Imagen por defecto para compartir
    const image = '/assets/img/carousel-1-1200.webp';

    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  applyForRoute(route: ActivatedRouteSnapshot): void {
    // Ir al hijo más profundo para leer los datos
    let deepest: ActivatedRouteSnapshot = route;
    while (deepest.firstChild) {
      deepest = deepest.firstChild;
    }
    const description = deepest.data?.['description'] as string | undefined;
    this.update(description);
  }
}
