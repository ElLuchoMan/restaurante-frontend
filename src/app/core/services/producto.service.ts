import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Producto, ProductoListParams } from '../../shared/models/producto.model';
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
   * Obtiene productos del backend y normaliza la imagen de cada uno.
   * @param params includeImage / onlyActive (únicos query params que lee el back)
   */
  getProductos(params?: ProductoListParams): Observable<ApiResponse<Producto[]>> {
    let httpParams: HttpParams | undefined;
    if (params) {
      httpParams = new HttpParams();
      if (params.includeImage !== undefined) {
        httpParams = httpParams.set('includeImage', String(params.includeImage));
      }
      if (params.onlyActive !== undefined) {
        httpParams = httpParams.set('onlyActive', String(params.onlyActive));
      }
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
   * Crea un nuevo producto. Con archivo se envía multipart/form-data; sin archivo, JSON
   * (el back exige `estadoProducto` DISPONIBLE | NO_DISPONIBLE, `nombre` y `precio` > 0).
   */
  createProducto(producto: Producto, file?: File): Observable<ApiResponse<Producto>> {
    const body = file ? this.toFormData(producto, file) : this.toJsonBody(producto);
    return this.http
      .post<ApiResponse<Producto>>(`${this.baseUrl}`, body)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Obtiene un producto por ID. Si no existe, el back responde HTTP 200 con `code: 404`
   * y sin `data`.
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
   * Actualiza un producto por ID. En JSON el back reemplaza todos los campos (nombre, calorias,
   * descripcion, precio, estadoProducto, cantidad, subcategoriaId), por lo que se debe enviar el
   * producto completo; `imagen` sólo se reemplaza si viene con contenido.
   */
  updateProducto(id: number, producto: Producto, file?: File): Observable<ApiResponse<Producto>> {
    const body = file ? this.toFormData(producto, file) : this.toJsonBody(producto);
    return this.http
      .put<ApiResponse<Producto>>(`${this.baseUrl}`, body, { params: { id: id.toString() } })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * Desactiva un producto por ID (borrado lógico: pasa a NO_DISPONIBLE).
   */
  deleteProducto(id: number): Observable<ApiResponse<unknown>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<unknown>>(`${this.baseUrl}`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** Campos de formulario que lee el back en multipart (los demás del modelo son sólo front). */
  private toFormData(producto: Producto, file: File): FormData {
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
    return form;
  }

  /**
   * El back decodifica `imagen` como Base64 puro: un data URL (`data:image/...;base64,XXX`)
   * hace fallar el JSON con 400, así que se le quita el prefijo.
   */
  private toJsonBody(producto: Producto): Producto {
    const match = /^data:[^;]+;base64,(.*)$/.exec(producto.imagen ?? '');
    return match ? { ...producto, imagen: match[1] } : producto;
  }
}
