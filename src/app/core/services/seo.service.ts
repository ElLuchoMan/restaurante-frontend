import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private meta: Meta,
    private title: Title,
    @Inject(DOCUMENT) private doc: Document,
  ) {}

  update(description?: string, robots?: string): void {
    const pageTitle = this.title.getTitle();
    const desc = description || 'Restaurante colombiano: tradición e innovación en cada plato.';
    // Imagen por defecto para compartir
    const image = '/assets/img/carousel-1-1200.webp';

    this.meta.updateTag({ name: 'description', content: desc });
    if (robots) {
      this.meta.updateTag({ name: 'robots', content: robots });
    } else {
      // Limpia robots si veníamos de una página con noindex
      const tag = this.meta.getTag("name='robots'");
      if (tag) this.meta.removeTagElement(tag);
    }
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  private updateJsonLd(routePath: string): void {
    // Remover JSON-LD previo si existe
    const existing = this.doc.getElementById('dynamic-jsonld');
    if (existing) existing.remove();

    let jsonLd: Record<string, unknown> | null = null;

    if (routePath === '/menu' || routePath === '/ver-productos') {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Menu',
        name: 'Menú - La cocina de María',
        description: 'Platos tradicionales colombianos y opciones reinventadas',
        provider: {
          '@type': 'Restaurant',
          name: 'La cocina de María',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Calle 78a # 62 - 48',
            addressLocality: 'Bogotá',
            addressCountry: 'CO',
          },
        },
      };
    } else if (routePath === '/ubicacion') {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Place',
        name: 'La cocina de María - Ubicación',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Calle 78a # 62 - 48',
          addressLocality: 'Bogotá',
          addressCountry: 'CO',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '4.6097',
          longitude: '-74.0817',
        },
        telephone: '+57 304 244 9339',
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: '09:00',
            closes: '22:00',
          },
        ],
      };
    }

    if (jsonLd) {
      const script = this.doc.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'dynamic-jsonld';
      script.textContent = JSON.stringify(jsonLd);
      this.doc.head.appendChild(script);
    }
  }

  updateCanonical(routerUrl?: string): void {
    const head = this.doc.head;
    if (!head) return;
    let link = head.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    const origin = this.doc.location?.origin ?? '';
    const path = (routerUrl ?? this.doc.location?.pathname ?? '/').split('#')[0].split('?')[0];
    const href = origin ? `${origin}${path}` : path;
    link.setAttribute('href', href);
    this.meta.updateTag({ property: 'og:url', content: href });
  }

  applyForRoute(route: ActivatedRouteSnapshot, routerUrl?: string): void {
    // Ir al hijo más profundo para leer los datos
    let deepest: ActivatedRouteSnapshot = route;
    while (deepest.firstChild) {
      deepest = deepest.firstChild;
    }
    const description = deepest.data?.['description'] as string | undefined;
    const robots = deepest.data?.['robots'] as string | undefined;
    this.update(description, robots);

    // Actualizar JSON-LD específico por ruta
    if (routerUrl) {
      this.updateJsonLd(routerUrl);
    }
  }
}
