import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { NetworkService } from './core/services/network.service';
import { SeoService } from './core/services/seo.service';

import { ModalComponent } from './shared/components/modal/modal.component';
import { SharedModule } from './shared/shared.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SharedModule, ModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'restaurante-frontend';
  private destroy$ = new Subject<void>();
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object,
    private network: NetworkService,
    private route: ActivatedRoute,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        const main = document.getElementById('main');
        main?.focus();
        this.seo.applyForRoute(this.route.snapshot);
      });

    this.network.isOnline$.pipe(takeUntil(this.destroy$)).subscribe((online) => {
      if (!online) {
        this.router.navigate(['/not-found']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
