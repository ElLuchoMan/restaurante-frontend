import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import {
  mockTrabajadorBody,
  mockTrabajadorDeleteResponse,
  mockTrabajadorRegisterResponse,
  mockTrabajadorResponse,
  mockTrabajadorUpdateBody,
} from '../../shared/mocks/trabajador.mock';
import { HandleErrorService } from './handle-error.service';
import { TrabajadorService } from './trabajador.service';

describe('TrabajadorService', () => {
  let service: TrabajadorService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  const fakeHandleErrorService = {
    handleError: (error: any) => {
      throw error;
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TrabajadorService,
        { provide: HandleErrorService, useValue: fakeHandleErrorService },
      ],
    });
    service = TestBed.inject(TrabajadorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registroTrabajador', () => {
    it('should register a trabajador', () => {
      service.registroTrabajador(mockTrabajadorBody).subscribe((response) => {
        expect(response).toEqual(mockTrabajadorRegisterResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/trabajadores`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockTrabajadorBody);
      req.flush(mockTrabajadorRegisterResponse);
    });
  });

  describe('searchTrabajador', () => {
    it('should search and return a trabajador', () => {
      const documento = mockTrabajadorResponse.data.documentoTrabajador;
      service.searchTrabajador(documento).subscribe((response) => {
        expect(response).toEqual(mockTrabajadorResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/trabajadores/search?id=${documento}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTrabajadorResponse);
    });
  });

  describe('getTrabajadores', () => {
    it('should get an array of trabajadores', () => {
      const mockResponse = {
        code: 200,
        message: 'Success',
        data: [mockTrabajadorResponse.data],
      };

      service.getTrabajadores().subscribe((trabajadores) => {
        expect(trabajadores).toEqual([mockTrabajadorResponse.data]);
      });

      const req = httpMock.expectOne(`${baseUrl}/trabajadores`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should pass filter params to GET', () => {
      const mockResponse = {
        code: 200,
        message: 'Success',
        data: [mockTrabajadorResponse.data],
      };

      service
        .getTrabajadores({
          fecha_ingreso: '2025-02-01',
          rol: 'Mesero',
          incluir_retirados: true,
          solo_retirados: false,
        })
        .subscribe((trabajadores) => {
          expect(trabajadores).toEqual([mockTrabajadorResponse.data]);
        });

      const req = httpMock.expectOne(
        (r) =>
          r.url === `${baseUrl}/trabajadores` &&
          r.params.get('fecha_ingreso') === '2025-02-01' &&
          r.params.get('rol') === 'Mesero' &&
          r.params.get('incluir_retirados') === 'true' &&
          r.params.get('solo_retirados') === 'false',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getTrabajadorId', () => {
    it('should get a trabajador by ID', () => {
      const documento = mockTrabajadorResponse.data.documentoTrabajador;
      service.getTrabajadorId(documento).subscribe((response) => {
        expect(response).toEqual(mockTrabajadorResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/trabajadores/search?id=${documento}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTrabajadorResponse);
    });
  });

  describe('updateTrabajador', () => {
    it('should PUT partial trabajador', () => {
      const documento = mockTrabajadorResponse.data.documentoTrabajador;
      const partial = mockTrabajadorUpdateBody;
      service.updateTrabajador(documento, partial).subscribe((res) => {
        expect(res.data?.documentoTrabajador).toBe(documento);
      });
      const req = httpMock.expectOne(`${baseUrl}/trabajadores?id=${documento}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(partial);
      req.flush({ code: 200, message: 'ok', data: mockTrabajadorResponse.data });
    });
  });

  describe('deleteTrabajador', () => {
    it('should DELETE a trabajador by documento', () => {
      const documento = mockTrabajadorResponse.data.documentoTrabajador;
      service.deleteTrabajador(documento).subscribe((res) => {
        expect(res).toEqual(mockTrabajadorDeleteResponse);
      });
      const req = httpMock.expectOne(`${baseUrl}/trabajadores?id=${documento}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockTrabajadorDeleteResponse);
    });
  });

  describe('respuestas sin data', () => {
    it('searchTrabajador expone el 404 de cuerpo (HTTP 200, sin data)', () => {
      let result: { code: number; data?: unknown } | undefined;
      service.searchTrabajador(1).subscribe((res) => (result = res));
      httpMock
        .expectOne(`${baseUrl}/trabajadores/search?id=1`)
        .flush({ code: 404, message: 'Trabajador no encontrado' });
      expect(result?.code).toBe(404);
      expect(result?.data).toBeUndefined();
    });

    it('getTrabajadores devuelve [] cuando data llega null', () => {
      let result: unknown;
      service.getTrabajadores().subscribe((res) => (result = res));
      httpMock.expectOne(`${baseUrl}/trabajadores`).flush({ code: 200, message: 'ok', data: null });
      expect(result).toEqual([]);
    });
  });

  describe('getTrabajadores branches', () => {
    it('con objeto vacío no agrega params', () => {
      service.getTrabajadores({}).subscribe((r) => expect(r).toEqual([]));
      const req = httpMock.expectOne(`${baseUrl}/trabajadores`);
      expect(req.request.params.keys().length).toBe(0);
      req.flush({ code: 200, message: 'ok', data: [] });
    });

    it('envía booleanos false y omite fecha/rol vacíos', () => {
      service
        .getTrabajadores({
          fecha_ingreso: '',
          rol: '',
          incluir_retirados: false,
          solo_retirados: false,
        })
        .subscribe();
      const req = httpMock.expectOne((r) => r.url === `${baseUrl}/trabajadores`);
      expect(req.request.params.has('fecha_ingreso')).toBe(false);
      expect(req.request.params.has('rol')).toBe(false);
      expect(req.request.params.get('incluir_retirados')).toBe('false');
      expect(req.request.params.get('solo_retirados')).toBe('false');
      req.flush({ code: 200, message: 'ok', data: [] });
    });
  });
});
