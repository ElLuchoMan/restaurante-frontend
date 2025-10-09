import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Producto } from '../../shared/models/producto.model';
import { getSafeImageSrc } from '../../shared/utils/image.utils';
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
  getProductos(
    params?: Record<string, string | number | boolean | readonly (string | number | boolean)[]>,
  ): Observable<ApiResponse<Producto[]>> {
    let httpParams: HttpParams | undefined;
    if (params) {
      let hp = new HttpParams();
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => (hp = hp.append(key, String(v))));
        } else if (value !== undefined) {
          hp = hp.set(key, String(value));
        }
      });
      httpParams = hp;
    }
    return this.http.get<ApiResponse<Producto[]>>(`${this.baseUrl}`, { params: httpParams }).pipe(
      map((res) => ({
        ...res,
        data: (res.data || []).map((p) => ({
          ...p,
          imagen: getSafeImageSrc(p?.imagen, p?.productoId),
        })),
      })),
      catchError(this.handleError.handleError),
    );
  }

  /**
   * Crea un nuevo producto
   */
  createProducto(producto: Producto, file?: File): Observable<ApiResponse<Producto>> {
    if (file) {
      const form = new FormData();
      form.append('nombre', producto.nombre);
      if (producto.calorias != null) form.append('calorias', String(producto.calorias));
      if (producto.descripcion != null) form.append('descripcion', producto.descripcion);
      form.append('precio', String(producto.precio));
      if (producto.estadoProducto) form.append('estadoProducto', String(producto.estadoProducto));
      if (producto.cantidad != null) form.append('cantidad', String(producto.cantidad));
      if (producto.subcategoriaId != null)
        form.append('subcategoriaId', String(producto.subcategoriaId));
      form.append('imagen', file);

      // Log del FormData para debug
      console.log('=== FormData a enviar ===');
      form.forEach((value, key) => {
        if (value instanceof File) {
          console.log(`${key}:`, {
            name: value.name,
            size: `${(value.size / 1024).toFixed(2)} KB`,
            type: value.type,
          });
        } else {
          console.log(`${key}:`, value);
        }
      });
      console.log('========================');

      return this.http
        .post<ApiResponse<Producto>>(`${this.baseUrl}`, form)
        .pipe(catchError(this.handleError.handleError));
    }
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
      .pipe(
        map((res) => ({
          ...res,
          data: res.data
            ? {
                ...res.data,
                imagen:
                  res.data.imagen &&
                  typeof res.data.imagen === 'string' &&
                  !res.data.imagen.startsWith('data:') &&
                  !res.data.imagen.startsWith('http')
                    ? `data:image/jpeg;base64,${res.data.imagen}`
                    : res.data.imagen,
              }
            : res.data,
        })),
        catchError(this.handleError.handleError),
      );
  }

  /**
   * Actualiza un producto por ID
   */
  updateProducto(id: number, producto: Producto, file?: File): Observable<ApiResponse<Producto>> {
    if (file) {
      const form = new FormData();
      form.append('nombre', producto.nombre);
      if (producto.calorias != null) form.append('calorias', String(producto.calorias));
      if (producto.descripcion != null) form.append('descripcion', producto.descripcion);
      form.append('precio', String(producto.precio));
      if (producto.estadoProducto) form.append('estadoProducto', String(producto.estadoProducto));
      if (producto.cantidad != null) form.append('cantidad', String(producto.cantidad));
      if (producto.subcategoriaId != null)
        form.append('subcategoriaId', String(producto.subcategoriaId));
      form.append('imagen', file);

      // Log del FormData para debug
      console.log('=== FormData a enviar (UPDATE) ===');
      form.forEach((value, key) => {
        if (value instanceof File) {
          console.log(`${key}:`, {
            name: value.name,
            size: `${(value.size / 1024).toFixed(2)} KB`,
            type: value.type,
          });
        } else {
          console.log(`${key}:`, value);
        }
      });
      console.log('================================');

      return this.http
        .put<ApiResponse<Producto>>(`${this.baseUrl}`, form, { params: { id: id.toString() } })
        .pipe(catchError(this.handleError.handleError));
    }
    return this.http
      .put<ApiResponse<Producto>>(`${this.baseUrl}`, producto, { params: { id: id.toString() } })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Elimina un producto por ID
   */
  deleteProducto(id: number): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<unknown>>(`${this.baseUrl}`, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
