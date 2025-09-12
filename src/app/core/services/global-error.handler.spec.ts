import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { GlobalErrorHandler } from './global-error.handler';
import { TelemetryService } from './telemetry.service';
import { createTelemetryServiceMock } from '../../shared/mocks/test-doubles';

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
    expect(telemetry.logError).toHaveBeenCalledWith('boom', expect.any(String), false);
  });
});

// Mock centralizado en shared/mocks/test-doubles
