import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-update-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="updateAvailable" class="update-banner" role="status" aria-live="polite">
      <div class="container d-flex justify-content-between align-items-center">
        <span>Hay una nueva versión disponible.</span>
        <div class="actions">
          <button class="btn btn-light btn-sm me-2" (click)="reload()">Actualizar</button>
          <button class="btn btn-outline-light btn-sm" (click)="dismiss()">Cerrar</button>
        </div>
      </div>
    </div>
    <div *ngIf="unrecoverable" class="update-banner error" role="alert" aria-live="assertive">
      <div class="container d-flex justify-content-between align-items-center">
        <span>Se produjo un error con la versión actual. Recarga para continuar.</span>
        <div class="actions">
          <button class="btn btn-light btn-sm" (click)="reload()">Recargar</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .update-banner {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        background: #0d6efd;
        color: #fff;
        padding: 0.5rem 1rem;
        z-index: 1055;
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
      }
      .actions .btn {
        min-width: 90px;
      }
      .update-banner.error {
        background: #dc3545;
      }
    `,
  ],
})
export class UpdateBannerComponent implements OnInit, OnDestroy {
  updateAvailable = false;
  unrecoverable = false;
  private destroyed$ = new Subject<void>();
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private swUpdate: SwUpdate,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser || !this.swUpdate.isEnabled) return;

    // Angular >=16: versionUpdates
    (this.swUpdate.versionUpdates as unknown as import('rxjs').Observable<VersionEvent>)
      ?.pipe(
        filter((e: VersionEvent) => (e as unknown as { type?: string }).type === 'VERSION_READY'),
        takeUntil(this.destroyed$),
      )
      .subscribe(() => (this.updateAvailable = true));

    // Compat: available observable
    (this.swUpdate as unknown as { available?: import('rxjs').Observable<unknown> }).available
      ?.pipe(takeUntil(this.destroyed$))
      .subscribe(() => (this.updateAvailable = true));

    // Errores irrecuperables (assets faltantes, manifiesto corrupto, etc.)
    this.swUpdate.unrecoverable.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.unrecoverable = true;
    });
  }

  reload(): void {
    if (!this.isBrowser) return;
    this.swUpdate
      .activateUpdate()
      .then(() => document.location.reload())
      .catch(() => document.location.reload());
  }

  dismiss(): void {
    this.updateAvailable = false;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
