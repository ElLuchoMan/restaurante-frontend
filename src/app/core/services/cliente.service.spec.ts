import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { environment } from '../../../environments/environment';
import {
  mockClienteBody,
  mockClienteDeleteResponse,
  mockClienteRegisterResponse,
  mockClientesResponse,
  mockClienteUpdateResponse,
  mockResponseCliente,
} from '../../shared/mocks/cliente.mock';
import { Cliente } from '../../shared/models/cliente.model';
import { ClienteService } from './cliente.service';
import { HandleErrorService } from './handle-error.service';

describe('ClienteService', () => {
  let service: ClienteService;
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
        ClienteService,
        { provide: HandleErrorService, useValue: fakeHandleErrorService },
      ],
    });
    service = TestBed.inject(ClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getClienteId', () => {
    it('should get cliente by id', () => {
      const documento = mockResponseCliente.data.documentoCliente;
      service.getClienteId(documento).subscribe((response) => {
        expect(response).toEqual(mockResponseCliente);
      });

      const req = httpMock.expectOne(`${baseUrl}/clientes/search?id=${documento}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponseCliente);
    });

    it('should handle error when fetching cliente by id', () => {
      const documento = mockResponseCliente.data.documentoCliente;
      service.getClienteId(documento).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });
      const req = httpMock.expectOne(`${baseUrl}/clientes/search?id=${documento}`);
      req.error(new ErrorEvent('API error'));
    });
  });

  describe('registroCliente', () => {
    it('should register a new cliente', () => {
      service.registroCliente(mockClienteBody).subscribe((response) => {
        expect(response).toEqual(mockClienteRegisterResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/clientes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockClienteBody);
      req.flush(mockClienteRegisterResponse);
    });

    it('should handle error when registering a cliente', () => {
      service.registroCliente(mockClienteBody).subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/clientes`);
      req.error(new ErrorEvent('API error'));
    });
  });

  describe('getClientes', () => {
    it('should list clientes with query params', () => {
      const params = 'limit=20&offset=0&fields=nombre_completo_telefono';
      service
        .getClientes({ limit: 20, offset: 0, fields: 'nombre_completo_telefono' })
        .subscribe((res) => {
          expect(res).toEqual(mockClientesResponse);
        });

      const req = httpMock.expectOne(`${baseUrl}/clientes?${params}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockClientesResponse);
    });

    it('should list clientes without options (no query string)', () => {
      service.getClientes().subscribe((res) => {
        expect(res).toEqual(mockClientesResponse);
      });
      const req = httpMock.expectOne(`${baseUrl}/clientes`);
      expect(req.request.method).toBe('GET');
      req.flush(mockClientesResponse);
    });

    it('should handle error on list clientes', () => {
      service.getClientes().subscribe({ error: (e) => expect(e).toBeTruthy() });
      const req = httpMock.expectOne(`${baseUrl}/clientes`);
      req.error(new ErrorEvent('API error'));
    });
  });

  describe('actualizarCliente', () => {
    it('should update cliente by id', () => {
      const documento = mockResponseCliente.data.documentoCliente;
      const partial: Partial<Cliente> = { telefono: '3001112233' };

      service.actualizarCliente(documento, partial).subscribe((res) => {
        expect(res).toEqual(mockClienteUpdateResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/clientes?id=${documento}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(partial);
      req.flush(mockClienteUpdateResponse);
    });

    it('should handle error when updating cliente', () => {
      const documento = mockResponseCliente.data.documentoCliente;
      service
        .actualizarCliente(documento, { telefono: 'x' })
        .subscribe({ error: (e) => expect(e).toBeTruthy() });
      const req = httpMock.expectOne(`${baseUrl}/clientes?id=${documento}`);
      req.error(new ErrorEvent('API error'));
    });
  });

  describe('eliminarCliente', () => {
    it('should delete cliente by id', () => {
      const documento = mockResponseCliente.data.documentoCliente;

      service.eliminarCliente(documento).subscribe((res) => {
        expect(res).toEqual(mockClienteDeleteResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/clientes?id=${documento}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockClienteDeleteResponse);
    });

    it('should handle error when deleting cliente', () => {
      const documento = mockResponseCliente.data.documentoCliente;
      service.eliminarCliente(documento).subscribe({ error: (e) => expect(e).toBeTruthy() });
      const req = httpMock.expectOne(`${baseUrl}/clientes?id=${documento}`);
      req.error(new ErrorEvent('API error'));
    });
  });
});
