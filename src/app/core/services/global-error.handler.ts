import { ErrorHandler, Injectable } from '@angular/core';

import { TelemetryService } from './telemetry.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private telemetry: TelemetryService) {}

  handleError(error: unknown): void {
    const message = this.extractMessage(error);
    const stack = this.extractStack(error);
    const requestId = (globalThis as any).__lastCorrelationId as string | undefined;
    this.telemetry.logError(message, stack, /* handled */ false, requestId);
    // Re-lanza para no ocultar en consola en desarrollo
    // eslint-disable-next-line no-console
    console.error(`[Error]${requestId ? ' reqId=' + requestId : ''}`, error);
  }

  private extractMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown error';
    }
  }

  private extractStack(error: unknown): string | undefined {
    if (error instanceof Error) return error.stack ?? undefined;
    return undefined;
  }
}
