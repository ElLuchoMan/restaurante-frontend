import { NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterModule, NgOptimizedImage],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
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
