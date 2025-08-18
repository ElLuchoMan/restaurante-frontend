import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Producto } from '../../shared/models/producto.model';
import { environment } from '../../../environments/environment';
import { HandleErrorService } from './handle-error.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private baseUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient, private handleError: HandleErrorService) { }

  /**
   * Obtiene productos del backend y los mapea con nombres en minúsculas
   * @param params 
   * @returns 
   */
  getProductos(params?: Record<string, unknown>): Observable<ApiResponse<Producto[]>> {
    return this.http.get<ApiResponse<Producto[]>>(`${this.baseUrl}`, { params }).pipe(
      catchError(this.handleError.handleError)
    );
  }

  /**
   * Crea un nuevo producto
   * @param formData FormData con los datos del producto
   * @returns 
   */
  createProducto(formData: FormData): Observable<ApiResponse<Producto>> {
    return this.http.post<ApiResponse<Producto>>(`${this.baseUrl}`, formData).pipe(
      catchError(this.handleError.handleError)
    );
  }

  /**
 * Obtiene un producto por ID
 */
  getProductoById(id: number): Observable<ApiResponse<Producto>> {
    return this.http.get<ApiResponse<Producto>>(`${this.baseUrl}/search`, {
      params: { id: id.toString() }
    }).pipe(
      catchError(this.handleError.handleError)
    );
  }

  /**
   * Actualiza un producto por ID
   */
  updateProducto(id: number, formData: FormData): Observable<ApiResponse<Producto>> {
    return this.http.put<ApiResponse<Producto>>(`${this.baseUrl}`, formData, {
      params: { id: id.toString() }
    }).pipe(
      catchError(this.handleError.handleError)
    );
  }

}
