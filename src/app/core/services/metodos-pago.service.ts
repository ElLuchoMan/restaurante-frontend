import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { MetodosPago } from '../../shared/models/metodo-pago.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetodosPagoService {
  private baseUrl = `${environment.apiUrl}/metodos_pago`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los métodos de pago
   */
  getAll(): Observable<ApiResponse<MetodosPago[]>> {
    return this.http.get<ApiResponse<MetodosPago[]>>(this.baseUrl);
  }

  /**
   * (Opcional) Obtener un método de pago por ID
   */
  getById(id: number): Observable<ApiResponse<MetodosPago>> {
    return this.http.get<ApiResponse<MetodosPago>>(`${this.baseUrl}/search`, {
      params: { id: id.toString() }
    });
  }
}
