import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { ControlNominaService } from './control-nomina.service';
import { HandleErrorService } from './handle-error.service';

describe('ControlNominaService', () => {
  let service: ControlNominaService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/control_nomina`;
  const mockHandle = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ControlNominaService, { provide: HandleErrorService, useValue: mockHandle }],
    });
    service = TestBed.inject(ControlNominaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists control nomina without filter', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.list().subscribe((res) => expect(res).toEqual([]));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('lists control nomina with fecha', () => {
    const mock = { code: 200, message: 'ok', data: [] };
    service.list('2025-09-15').subscribe((res) => expect(res).toEqual([]));
    const req = http.expectOne(`${baseUrl}?fecha=2025-09-15`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('gets by id', () => {
    const mock = {
      code: 200,
      message: 'ok',
      data: { controlNominaId: 1, fecha: '2025-09-01', estado: 'ABIERTO' },
    };
    service.getById(1).subscribe((res) => expect(res).toEqual(mock.data));
    const req = http.expectOne(`${environment.apiUrl}/control_nomina/search?id=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });
});
