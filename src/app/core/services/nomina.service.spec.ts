import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { HandleErrorService } from './handle-error.service';
import { NominaService } from './nomina.service';

describe('NominaService', () => {
  let service: NominaService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/nominas`;
  const mockHandle = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NominaService, { provide: HandleErrorService, useValue: mockHandle }],
    });
    service = TestBed.inject(NominaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists nominas con filtros', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service
      .list({ fecha: '2025-09-01', mes: 9, anio: 2025 })
      .subscribe((res) => expect(res).toEqual([]));
    const req = http.expectOne(`${baseUrl}?fecha=2025-09-01&mes=9&anio=2025`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('actualiza estado nomina', () => {
    const mock = { code: 200, message: 'ok', data: { nominaId: 1 } } as any;
    service.updateEstado(1).subscribe((res) => expect(res).toEqual(mock.data));
    const req = http.expectOne(`${baseUrl}?id=1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mock);
  });
});
