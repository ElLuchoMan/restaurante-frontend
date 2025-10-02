import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNotFoundComponent implements OnInit {
  constructor(
    private meta: Meta,
    private title: Title,
  ) {}

  ngOnInit(): void {
    // Configurar metadatos SEO
    this.title.setTitle('404 - Página no encontrada | El fogón DE MARÍA');

    this.meta.updateTag({
      name: 'description',
      content:
        'La página que buscas no existe. Regresa al inicio de El fogón DE MARÍA para disfrutar de nuestra deliciosa comida colombiana.',
    });

    this.meta.updateTag({
      name: 'robots',
      content: 'noindex, nofollow',
    });

    this.meta.updateTag({
      property: 'og:title',
      content: '404 - Página no encontrada | El fogón DE MARÍA',
    });

    this.meta.updateTag({
      property: 'og:description',
      content:
        'La página que buscas no existe. Regresa al inicio para disfrutar de nuestra deliciosa comida colombiana.',
    });

    this.meta.updateTag({
      property: 'og:type',
      content: 'website',
    });
  }
}
