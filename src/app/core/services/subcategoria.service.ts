import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Subcategoria } from '../../shared/models/subcategoria.model';
import { HandleErrorService } from './handle-error.service';

export type SubcategoriaCreate = Pick<Subcategoria, 'nombre' | 'categoriaId'>;
export type SubcategoriaUpdate = Partial<SubcategoriaCreate>;

@Injectable({ providedIn: 'root' })
export class SubcategoriaService {
  private baseUrl = `${environment.apiUrl}/subcategorias`;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  list(categoria_id?: number): Observable<Subcategoria[]> {
    let params: HttpParams | undefined;
    if (categoria_id) params = new HttpParams().set('categoria_id', String(categoria_id));
    return this.http.get<ApiResponse<Subcategoria[]>>(this.baseUrl, { params }).pipe(
      map((res) => res.data),
      catchError(this.handleError.handleError),
    );
  }

  getById(id: number): Observable<Subcategoria> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .get<ApiResponse<Subcategoria>>(`${environment.apiUrl}/subcategorias/search`, { params })
      .pipe(
        map((res) => res.data),
        catchError(this.handleError.handleError),
      );
  }

  create(body: SubcategoriaCreate): Observable<Subcategoria> {
    return this.http.post<ApiResponse<Subcategoria>>(this.baseUrl, body).pipe(
      map((res) => res.data),
      catchError(this.handleError.handleError),
    );
  }

  update(id: number, body: SubcategoriaUpdate): Observable<Subcategoria> {
    const params = new HttpParams().set('id', String(id));
    return this.http.put<ApiResponse<Subcategoria>>(this.baseUrl, body, { params }).pipe(
      map((res) => res.data),
      catchError(this.handleError.handleError),
    );
  }

  delete(id: number): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<unknown>>(this.baseUrl, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
