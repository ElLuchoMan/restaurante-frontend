import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { Domicilio } from '../../shared/models/domicilio.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DomicilioService {
  private baseUrl = `${environment.apiUrl}/domicilios`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los domicilios según filtros
   * @param params 
   * @returns 
   */
  getDomicilios(params?: any): Observable<ApiResponse<Domicilio[]>> {
    return this.http.get<ApiResponse<Domicilio[]>>(this.baseUrl, { params });
  }

  /**
   * Obtiene un domicilio por ID.
   * @param id ID del domicilio
   */
  getDomicilioById(id: number): Observable<ApiResponse<Domicilio>> {
    return this.http.get<ApiResponse<Domicilio>>(`${this.baseUrl}/search?id=${id}`);
  }

  /**
   * Crea un nuevo domicilio.
   * @param domicilio Datos del domicilio a crear
   */
  createDomicilio(domicilio: Domicilio): Observable<ApiResponse<Domicilio>> {
    return this.http.post<ApiResponse<Domicilio>>(this.baseUrl, domicilio);
  }

  /**
   * Actualiza un domicilio existente.
   * @param id ID del domicilio
   * @param domicilio Datos actualizados
   */
  updateDomicilio(id: number, domicilio: Partial<Domicilio>): Observable<ApiResponse<Domicilio>> {
    return this.http.put<ApiResponse<Domicilio>>(`${this.baseUrl}?id=${id}`, domicilio);
  }

  /**
   * Elimina un domicilio por ID.
   * @param id ID del domicilio
   */
  deleteDomicilio(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}?id=${id}`);
  }
  /**
   * Asigna un domiciliario a un domicilio
   * @param domicilioId 
   * @param trabajadorId 
   */
  asignarDomiciliario(domicilioId: number, trabajadorId: number): Observable<ApiResponse<Domicilio>> {
    const params = new HttpParams()
      .set('domicilio_id', domicilioId.toString())
      .set('trabajador_id', trabajadorId.toString());
    return this.http.post<ApiResponse<Domicilio>>(`${this.baseUrl}/asignar`, {}, { params });
  }
}
