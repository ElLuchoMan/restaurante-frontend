import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError,Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Producto } from '../../shared/models/producto.model';
import { HandleErrorService } from './handle-error.service';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private baseUrl = `${environment.apiUrl}/productos`;

  constructor(
    private http: HttpClient,
    private handleError: HandleErrorService,
  ) {}

  /**
   * Obtiene productos del backend y los mapea con nombres en minúsculas
   * @param params
   * @returns
   */
  getProductos(params?: any): Observable<ApiResponse<Producto[]>> {
    return this.http
      .get<ApiResponse<Producto[]>>(`${this.baseUrl}`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Crea un nuevo producto
   */
  createProducto(producto: Producto): Observable<ApiResponse<Producto>> {
    return this.http
      .post<ApiResponse<Producto>>(`${this.baseUrl}`, producto)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Obtiene un producto por ID
   */
  getProductoById(id: number): Observable<ApiResponse<Producto>> {
    return this.http
      .get<ApiResponse<Producto>>(`${this.baseUrl}/search`, {
        params: { id: id.toString() },
      })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Actualiza un producto por ID
   */
  updateProducto(id: number, producto: Producto): Observable<ApiResponse<Producto>> {
    return this.http
      .put<ApiResponse<Producto>>(`${this.baseUrl}`, producto, {
        params: { id: id.toString() },
      })
      .pipe(catchError(this.handleError.handleError));
  }
}
