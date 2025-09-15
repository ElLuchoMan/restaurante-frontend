import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-offline',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="container d-flex flex-column align-items-center justify-content-center text-center"
      style="min-height: 60vh"
    >
      <h1 class="mb-3">Sin conexión</h1>
      <p class="text-muted" role="alert" aria-live="polite">
        Parece que no hay internet. Algunas funciones no estarán disponibles.
      </p>
      <div class="mt-3 d-flex gap-3">
        <a routerLink="/home" class="btn btn-primary">Ir al inicio</a>
        <button class="btn btn-secondary" (click)="reintentar()">Reintentar</button>
      </div>
    </div>
  `,
})
export class OfflineComponent {
  reintentar(): void {
    // Forzar reintento de carga; si vuelve la red, la app se recupera
    location.reload();
  }
}
