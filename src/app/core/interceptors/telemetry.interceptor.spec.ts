import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TelemetryService } from '../services/telemetry.service';
import { createTelemetryServiceMock } from '../../shared/mocks/test-doubles';
import { telemetryInterceptor } from './telemetry.interceptor';

describe('telemetryInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let telemetry: jest.Mocked<TelemetryService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([telemetryInterceptor])),
        provideHttpClientTesting(),
        { provide: TelemetryService, useValue: createTelemetryServiceMock() },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    telemetry = TestBed.inject(TelemetryService) as jest.Mocked<TelemetryService>;
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('should log http ok on success', () => {
    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    req.flush({});

    expect(telemetry.logHttp).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', url: '/api/test', ok: true, status: 200 }),
    );
  });

  it('should log http error on failure', () => {
    http.post('/api/fail', {}).subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/fail');
    req.flush('fail', { status: 500, statusText: 'Server Error' });

    expect(telemetry.logHttp).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST', url: '/api/fail', ok: false, status: 500 }),
    );
  });
});

// Mock centralizado en shared/mocks/test-doubles
