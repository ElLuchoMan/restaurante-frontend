import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retryWhen, throwError, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

// Exponential backoff for idempotent requests (GET/HEAD)
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 200;

function shouldRetry(error: HttpErrorResponse, method: string): boolean {
  const status = error.status ?? 0;
  const idempotent = method === 'GET' || method === 'HEAD';
  if (!idempotent) return false;
  // Retry on network error (status 0), timeouts/too many requests and 5xx
  return status === 0 || status === 408 || status === 429 || (status >= 500 && status < 600);
}

function computeDelayMs(error: HttpErrorResponse, attempt: number): number {
  const retryAfter = error?.headers?.get?.('Retry-After');
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (!Number.isNaN(seconds)) {
      return Math.min(seconds * 1000, 5000);
    }
  }
  return Math.min(BASE_DELAY_MS * Math.pow(2, attempt), 2000);
}

export const retryInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    retryWhen((errors) =>
      errors.pipe(
        mergeMap((err: unknown, attempt: number) => {
          const httpErr = err as HttpErrorResponse;
          if (attempt >= MAX_RETRIES || !shouldRetry(httpErr, req.method)) {
            return throwError(() => httpErr);
          }
          const delayMs = computeDelayMs(httpErr, attempt);
          return timer(delayMs);
        }),
      ),
    ),
  );
