import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClienteService } from './cliente.service';
import { HandleErrorService } from './handle-error.service';
import { environment } from '../../../environments/environment';
import { mockResponseCliente, mockClienteBody, mockClienteRegisterResponse } from '../../shared/mocks/cliente.mock';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  const fakeHandleErrorService = {
    handleError: (error: any) => { throw error; }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ClienteService,
        { provide: HandleErrorService, useValue: fakeHandleErrorService }
      ]
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
      service.getClienteId(documento).subscribe(response => {
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
        }
      });
      const req = httpMock.expectOne(`${baseUrl}/clientes/search?id=${documento}`);
      req.error(new ErrorEvent('API error'));
    });
  });

  describe('registroCliente', () => {
    it('should register a new cliente', () => {
      service.registroCliente(mockClienteBody).subscribe(response => {
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
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/clientes`);
      req.error(new ErrorEvent('API error'));
    });
  });
});
