import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { createTelemetryServiceMock } from '../../shared/mocks/test-doubles';
import { GlobalErrorHandler } from './global-error.handler';
import { TelemetryService } from './telemetry.service';

describe('GlobalErrorHandler', () => {
  let handler: ErrorHandler;
  let telemetry: jest.Mocked<TelemetryService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TelemetryService, useValue: createTelemetryServiceMock() },
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
      ],
    });
    handler = TestBed.inject(ErrorHandler);
    telemetry = TestBed.inject(TelemetryService) as jest.Mocked<TelemetryService>;
  });

  it('should log error via TelemetryService', () => {
    const err = new Error('boom');
    // Evitar ruido en consola del re-lanzamiento
    jest.spyOn(console, 'error').mockImplementation(() => {});
    handler.handleError(err);
    expect(telemetry.logError).toHaveBeenCalledWith('boom', expect.any(String), false, undefined);
  });

  it('incluye requestId si existe y serializa string y objetos', () => {
    (globalThis as any).__lastCorrelationId = 'req-123';
    jest.spyOn(console, 'error').mockImplementation(() => {});
    handler.handleError('falló');
    expect(telemetry.logError).toHaveBeenCalledWith('falló', undefined, false, 'req-123');

    handler.handleError({ a: 1 });
    expect(telemetry.logError).toHaveBeenCalledWith('{"a":1}', undefined, false, 'req-123');
  });

  it('usa Unknown error cuando no puede serializar y captura stack cuando es Error', () => {
    const a: any = {};
    a.self = a; // objeto circular
    jest.spyOn(console, 'error').mockImplementation(() => {});
    handler.handleError(a);
    expect(telemetry.logError).toHaveBeenCalledWith(
      'Unknown error',
      undefined,
      false,
      expect.any(String),
    );

    const err = new Error('x');
    handler.handleError(err);
    expect(telemetry.logError).toHaveBeenCalledWith(
      'x',
      expect.any(String),
      false,
      expect.any(String),
    );
  });

  it('maneja Error sin stack (undefined) y sigue logueando', () => {
    const e: any = new Error('sin-stack');
    e.stack = undefined;
    jest.spyOn(console, 'error').mockImplementation(() => {});
    handler.handleError(e);
    expect(telemetry.logError).toHaveBeenCalledWith(
      'sin-stack',
      undefined,
      false,
      expect.any(String),
    );
  });
});

// Mock centralizado en shared/mocks/test-doubles
