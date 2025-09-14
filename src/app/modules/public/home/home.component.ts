import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Inject,
  makeStateKey,
  PLATFORM_ID,
  TransferState,
} from '@angular/core';
import { RouterModule } from '@angular/router';

const HOME_STATE = makeStateKey<string>('home_bootstrap');

@Component({
  selector: 'app-home',
  imports: [RouterModule, NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements AfterViewInit {
  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private ts: TransferState,
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Marcar que el carrusel ya fue inicializado en SSR y evitar doble trabajo en hidratación
    if (!this.ts.hasKey(HOME_STATE)) {
      this.ts.set(HOME_STATE, 'init');
    } else {
      return;
    }
    const el = document.getElementById('header-carousel');
    if (!el) return;
    const Bootstrap = (window as any).bootstrap;
    const Carousel = Bootstrap?.Carousel;
    if (Carousel) {
      const instance = new Carousel(el, {
        interval: 5000,
        ride: true,
        pause: false,
        wrap: true,
        touch: true,
      });
      setTimeout(() => instance.cycle(), 100);
    }
  }
}
