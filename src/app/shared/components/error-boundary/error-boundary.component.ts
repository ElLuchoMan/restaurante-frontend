import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface ErrorBoundaryConfig {
  showDetails?: boolean;
  showRetry?: boolean;
  customMessage?: string;
  redirectTo?: string;
}

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-boundary" role="alert" aria-live="assertive">
      <div class="error-boundary__container">
        <div class="error-boundary__icon">
          <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
        </div>

        <div class="error-boundary__content">
          <h2 class="error-boundary__title">Algo salió mal</h2>

          <p class="error-boundary__message">
            {{
              config.customMessage ||
                'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.'
            }}
          </p>

          <div class="error-boundary__details" *ngIf="config.showDetails && error">
            <details>
              <summary>Detalles técnicos</summary>
              <pre class="error-boundary__stack"
                >{{ error.message }}
{{ error.stack }}</pre
              >
            </details>
          </div>

          <div class="error-boundary__actions">
            <button
              *ngIf="config.showRetry"
              class="btn btn-primary"
              (click)="retry()"
              type="button"
            >
              <i class="fas fa-redo" aria-hidden="true"></i>
              Intentar nuevamente
            </button>

            <a *ngIf="config.redirectTo" [routerLink]="config.redirectTo" class="btn btn-secondary">
              <i class="fas fa-home" aria-hidden="true"></i>
              Ir al inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .error-boundary {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 300px;
        padding: 2rem;
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 0.5rem;
        margin: 1rem 0;
      }

      .error-boundary__container {
        text-align: center;
        max-width: 500px;
      }

      .error-boundary__icon {
        font-size: 3rem;
        color: #dc3545;
        margin-bottom: 1rem;
      }

      .error-boundary__title {
        color: #495057;
        margin-bottom: 1rem;
        font-size: 1.5rem;
        font-weight: 600;
      }

      .error-boundary__message {
        color: #6c757d;
        margin-bottom: 1.5rem;
        line-height: 1.5;
      }

      .error-boundary__details {
        margin-bottom: 1.5rem;
        text-align: left;
      }

      .error-boundary__details summary {
        cursor: pointer;
        color: #6c757d;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }

      .error-boundary__stack {
        background-color: #f1f3f4;
        border: 1px solid #dee2e6;
        border-radius: 0.25rem;
        padding: 0.75rem;
        font-size: 0.75rem;
        color: #495057;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .error-boundary__actions {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 0.25rem;
        text-decoration: none;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-primary {
        background-color: #007bff;
        color: white;
      }

      .btn-primary:hover {
        background-color: #0056b3;
      }

      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }

      .btn-secondary:hover {
        background-color: #545b62;
        text-decoration: none;
        color: white;
      }

      .btn:focus-visible {
        outline: 2px solid #007bff;
        outline-offset: 2px;
      }
    `,
  ],
})
export class ErrorBoundaryComponent {
  @Input() error?: Error;
  @Input() config: ErrorBoundaryConfig = {
    showDetails: false,
    showRetry: true,
    redirectTo: '/home',
  };

  retry(): void {
    // Emitir evento para que el componente padre maneje el retry
    window.location.reload();
  }
}
