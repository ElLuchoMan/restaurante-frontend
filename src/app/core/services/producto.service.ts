import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Producto } from '../../shared/models/producto.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private baseUrl = `${environment.apiUrl}/productos`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene productos del backend y los mapea con nombres en minúsculas
   * @param params 
   * @returns 
   */
  getProductos(params?: any): Observable<ApiResponse<Producto[]>> {
    return this.http.get<ApiResponse<Producto[]>>(`${this.baseUrl}`, { params });
  }

  /**
   * Crea un nuevo producto
   * @param formData FormData con los datos del producto
   * @returns 
   */
  createProducto(formData: FormData): Observable<ApiResponse<Producto>> {
    return this.http.post<ApiResponse<Producto>>(`${this.baseUrl}`, formData);
  }
}
