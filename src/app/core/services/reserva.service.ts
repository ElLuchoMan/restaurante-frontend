import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HandleErrorService } from '../../core/services/handle-error.service';
import { UserService } from '../../core/services/user.service';
import { ApiResponse } from '../../shared/models/api-response.model';
import { ReservaBase, ReservaCreate, ReservaUpdate } from '../../shared/models/reserva.model';

@Injectable({
  providedIn: 'root',
})
export class ReservaService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private handleError: HandleErrorService,
  ) {}

  /**
   * POST /reservas. El backend resuelve el contacto SOLO a partir de `documentoContacto`
   * (invitado) o `documentoCliente` (cliente registrado); `contactoId` se ignora.
   * Si el llamador no informa ninguno y el usuario es Cliente, se usa su documento del token.
   */
  crearReserva(reserva: ReservaCreate): Observable<ApiResponse<ReservaBase>> {
    const payload: ReservaCreate = { ...reserva };
    const sinDocumento =
      (payload.documentoCliente == null || isNaN(Number(payload.documentoCliente))) &&
      (payload.documentoContacto == null || isNaN(Number(payload.documentoContacto)));

    if (sinDocumento && this.userService.getUserRole?.() === 'Cliente') {
      const userId = this.userService.getUserId?.();
      if (typeof userId === 'number' && !isNaN(userId)) {
        payload.documentoCliente = userId;
      }
    }

    return this.http
      .post<ApiResponse<ReservaBase>>(`${this.baseUrl}/reservas`, payload)
      .pipe(catchError(this.handleError.handleError));
  }

  obtenerReservas(): Observable<ApiResponse<ReservaBase[] | null>> {
    return this.http
      .get<ApiResponse<ReservaBase[] | null>>(`${this.baseUrl}/reservas`)
      .pipe(catchError(this.handleError.handleError));
  }

  // Nuevo endpoint: reservas por documento de cliente con fecha opcional
  getReservasByCliente(
    documentoCliente: number,
    fecha?: string,
  ): Observable<ApiResponse<ReservaBase[] | null>> {
    let params = new HttpParams().set('documentoCliente', String(documentoCliente));
    if (fecha) params = params.set('fecha', fecha);

    return this.http
      .get<ApiResponse<ReservaBase[] | null>>(`${this.baseUrl}/reservas/cliente`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  // Nuevo endpoint universal: reservas por documento (cliente registrado o contacto)
  getReservasByDocumento(
    documento: number,
    fecha?: string,
  ): Observable<ApiResponse<ReservaBase[] | null>> {
    let params = new HttpParams().set('documento', String(documento));
    if (fecha) params = params.set('fecha', fecha);

    return this.http
      .get<ApiResponse<ReservaBase[] | null>>(`${this.baseUrl}/reservas/documento`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** PUT /reservas?id= (requiere token). Solo se envían los campos a modificar. */
  actualizarReserva(
    reservaId: number,
    reserva: ReservaUpdate,
  ): Observable<ApiResponse<ReservaBase>> {
    const params = new HttpParams().set('id', String(reservaId));
    return this.http
      .put<ApiResponse<ReservaBase>>(`${this.baseUrl}/reservas`, reserva, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** GET /reservas/parameter: el backend solo filtra por `contactoId` y `fecha` (YYYY-MM-DD). */
  getReservaByParameter(
    contactoId?: number,
    fecha?: string,
  ): Observable<ApiResponse<ReservaBase[] | null>> {
    let params = new HttpParams();

    if (contactoId !== undefined && !isNaN(contactoId)) {
      params = params.set('contactoId', contactoId.toString());
    }

    if (fecha) params = params.set('fecha', fecha);

    return this.http
      .get<ApiResponse<ReservaBase[] | null>>(`${this.baseUrl}/reservas/parameter`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** GET /reservas/search?id=. Si no existe responde 200 con `code: 404` y sin `data`. */
  getReservaById(id: number): Observable<ApiResponse<ReservaBase | undefined>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .get<ApiResponse<ReservaBase | undefined>>(`${this.baseUrl}/reservas/search`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * DELETE /reservas?id= (requiere token). El backend no borra: marca la reserva como
   * CANCELADA y la devuelve en `data`. Si no existe responde 200 con `code: 404` y sin `data`.
   */
  deleteReserva(id: number): Observable<ApiResponse<ReservaBase | undefined>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<ReservaBase | undefined>>(`${this.baseUrl}/reservas`, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
