import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import {
  mockCategoriaByIdResponse,
  mockCategoriaCreateBody,
  mockCategoriaCreateResponse,
  mockCategoriaDeleteResponse,
  mockCategoriasResponse,
  mockCategoriaUpdateBody,
} from '../../shared/mocks/categoria.mock';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { CategoriaService } from './categoria.service';
import { HandleErrorService } from './handle-error.service';

describe('CategoriaService', () => {
  let service: CategoriaService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/categorias`;
  const mockHandle = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoriaService, { provide: HandleErrorService, useValue: mockHandle }],
    });
    service = TestBed.inject(CategoriaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists categorias', () => {
    service.list().subscribe((res) => expect(res).toEqual(mockCategoriasResponse.data));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategoriasResponse);
  });

  it('gets by id', () => {
    service.getById(1).subscribe((res) => expect(res).toEqual(mockCategoriaByIdResponse.data));
    const req = http.expectOne(`${environment.apiUrl}/categorias/search?id=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategoriaByIdResponse);
  });

  it('creates categoria', () => {
    service
      .create(mockCategoriaCreateBody)
      .subscribe((res) => expect(res).toEqual(mockCategoriaCreateResponse.data));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCategoriaCreateBody);
    req.flush(mockCategoriaCreateResponse);
  });

  it('updates categoria', () => {
    const mockUpdated = {
      code: 200,
      message: 'ok',
      data: { categoriaId: 1, nombre: 'Bebidas frías' },
    };
    service
      .update(1, mockCategoriaUpdateBody)
      .subscribe((res) => expect(res).toEqual(mockUpdated.data));
    const req = http.expectOne(`${baseUrl}?id=1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockUpdated);
  });

  it('deletes categoria', () => {
    service.delete(1).subscribe((res) => expect(res).toEqual(mockCategoriaDeleteResponse));
    const req = http.expectOne(`${baseUrl}?id=1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockCategoriaDeleteResponse);
  });
});
