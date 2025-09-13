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

    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
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
