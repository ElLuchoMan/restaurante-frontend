import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
  componentName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorBoundaryService {
  private errorState = new BehaviorSubject<ErrorBoundaryState>({ hasError: false });

  get errorState$(): Observable<ErrorBoundaryState> {
    return this.errorState.asObservable();
  }

  /**
   * Captura un error en un componente específico
   */
  captureError(error: Error, componentName: string, errorInfo?: string): void {
    console.error(`[ErrorBoundary] Error in ${componentName}:`, error);

    this.errorState.next({
      hasError: true,
      error,
      errorInfo,
      componentName,
    });
  }

  /**
   * Resetea el estado de error (para recovery)
   */
  resetError(): void {
    this.errorState.next({ hasError: false });
  }

  /**
   * Wrapper para ejecutar código con manejo de errores
   */
  safeExecute<T>(
    fn: () => T,
    componentName: string,
    fallback?: T,
    onError?: (error: Error) => void,
  ): T | undefined {
    try {
      return fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.captureError(err, componentName);
      onError?.(err);
      return fallback;
    }
  }

  /**
   * Wrapper async para promesas con manejo de errores
   */
  async safeExecuteAsync<T>(
    fn: () => Promise<T>,
    componentName: string,
    fallback?: T,
    onError?: (error: Error) => void,
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.captureError(err, componentName);
      onError?.(err);
      return fallback;
    }
  }
}
