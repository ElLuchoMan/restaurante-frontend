import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import {
  mockSubcategoriaByIdResponse,
  mockSubcategoriaCreateBody,
  mockSubcategoriaCreateResponse,
  mockSubcategoriaDeleteResponse,
  mockSubcategoriasResponse,
  mockSubcategoriaUpdateBody,
} from '../../shared/mocks/subcategoria.mock';
import { createHandleErrorServiceMock } from '../../shared/mocks/test-doubles';
import { HandleErrorService } from './handle-error.service';
import { SubcategoriaService } from './subcategoria.service';

describe('SubcategoriaService', () => {
  let service: SubcategoriaService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/subcategorias`;
  const mockHandle = createHandleErrorServiceMock();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SubcategoriaService, { provide: HandleErrorService, useValue: mockHandle }],
    });
    service = TestBed.inject(SubcategoriaService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists subcategorias', () => {
    service.list().subscribe((res) => expect(res).toEqual(mockSubcategoriasResponse.data));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockSubcategoriasResponse);
  });

  it('lists subcategorias filter by categoria', () => {
    service.list(2).subscribe((res) => expect(res).toEqual(mockSubcategoriasResponse.data));
    const req = http.expectOne(`${baseUrl}?categoria_id=2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSubcategoriasResponse);
  });

  it('gets by id', () => {
    service.getById(1).subscribe((res) => expect(res).toEqual(mockSubcategoriaByIdResponse.data));
    const req = http.expectOne(`${environment.apiUrl}/subcategorias/search?id=1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSubcategoriaByIdResponse);
  });

  it('creates subcategoria', () => {
    service
      .create(mockSubcategoriaCreateBody as any)
      .subscribe((res) => expect(res).toEqual(mockSubcategoriaCreateResponse.data));
    const req = http.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockSubcategoriaCreateBody);
    req.flush(mockSubcategoriaCreateResponse);
  });

  it('updates subcategoria', () => {
    const mockUpdated = {
      code: 200,
      message: 'ok',
      data: { subcategoriaId: 1, nombre: 'Gaseosas light' },
    };
    service
      .update(1, mockSubcategoriaUpdateBody)
      .subscribe((res) => expect(res).toEqual(mockUpdated.data));
    const req = http.expectOne(`${baseUrl}?id=1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockUpdated);
  });

  it('deletes subcategoria', () => {
    service.delete(1).subscribe((res) => expect(res).toEqual(mockSubcategoriaDeleteResponse));
    const req = http.expectOne(`${baseUrl}?id=1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockSubcategoriaDeleteResponse);
  });
});
