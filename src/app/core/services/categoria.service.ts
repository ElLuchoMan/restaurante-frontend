import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Categoria } from '../../shared/models/categoria.model';
import { HandleErrorService } from './handle-error.service';

export type CategoriaCreate = Pick<Categoria, 'nombre'>;
export type CategoriaUpdate = Partial<CategoriaCreate>;

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private baseUrl = `${environment.apiUrl}/categorias`;
  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  list(): Observable<Categoria[]> {
    return this.http.get<ApiResponse<Categoria[]>>(this.baseUrl).pipe(
      map((res) => res.data),
      catchError(this.handleError.handleError),
    );
  }

  getById(id: number): Observable<Categoria> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .get<ApiResponse<Categoria>>(`${environment.apiUrl}/categorias/search`, { params })
      .pipe(
        map((res) => res.data),
        catchError(this.handleError.handleError),
      );
  }

  create(body: CategoriaCreate): Observable<Categoria> {
    return this.http.post<ApiResponse<Categoria>>(this.baseUrl, body).pipe(
      map((res) => res.data),
      catchError(this.handleError.handleError),
    );
  }

  update(id: number, body: CategoriaUpdate): Observable<Categoria> {
    const params = new HttpParams().set('id', String(id));
    return this.http.put<ApiResponse<Categoria>>(this.baseUrl, body, { params }).pipe(
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
