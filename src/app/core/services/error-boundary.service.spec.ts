import { TestBed } from '@angular/core/testing';

import { ErrorBoundaryService } from './error-boundary.service';

describe('ErrorBoundaryService', () => {
  let service: ErrorBoundaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorBoundaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should capture error and update state', () => {
    const testError = new Error('Test error');
    const componentName = 'TestComponent';

    service.captureError(testError, componentName, 'Additional info');

    service.errorState$.subscribe((state) => {
      expect(state.hasError).toBe(true);
      expect(state.error).toBe(testError);
      expect(state.componentName).toBe(componentName);
      expect(state.errorInfo).toBe('Additional info');
    });
  });

  it('should reset error state', () => {
    // First set an error
    service.captureError(new Error('Test'), 'TestComponent');

    // Then reset
    service.resetError();

    service.errorState$.subscribe((state) => {
      expect(state.hasError).toBe(false);
      expect(state.error).toBeUndefined();
      expect(state.componentName).toBeUndefined();
    });
  });

  it('should safely execute function and return result', () => {
    const testFn = () => 'success';

    const result = service.safeExecute(testFn, 'TestComponent');

    expect(result).toBe('success');
  });

  it('should catch error in safeExecute and return fallback', () => {
    const testError = new Error('Test error');
    const testFn = () => {
      throw testError;
    };
    let errorCaught: Error | undefined;
    const onError = (error: Error) => {
      errorCaught = error;
    };

    const result = service.safeExecute(testFn, 'TestComponent', 'fallback', onError);

    expect(result).toBe('fallback');
    expect(errorCaught).toBe(testError);
  });

  it('should safely execute async function', async () => {
    const testFn = async () => 'async success';

    const result = await service.safeExecuteAsync(testFn, 'TestComponent');

    expect(result).toBe('async success');
  });

  it('should catch error in safeExecuteAsync and return fallback', async () => {
    const testError = new Error('Async test error');
    const testFn = async () => {
      throw testError;
    };
    let errorCaught: Error | undefined;
    const onError = (error: Error) => {
      errorCaught = error;
    };

    const result = await service.safeExecuteAsync(
      testFn,
      'TestComponent',
      'async fallback',
      onError,
    );

    expect(result).toBe('async fallback');
    expect(errorCaught).toBe(testError);
  });
});