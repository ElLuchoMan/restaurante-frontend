import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HandleErrorService } from '../../core/services/handle-error.service';
import { UserService } from '../../core/services/user.service';
import { ApiResponse } from '../../shared/models/api-response.model';
import {
  ReservaBase,
  ReservaConsulta,
  ReservaCreate,
  ReservaUpdate,
} from '../../shared/models/reserva.model';

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
   * POST /reservas (201). El backend resuelve el contacto SOLO a partir de `documentoContacto`
   * (invitado) o `documentoCliente` (cliente registrado); `contactoId` no se acepta.
   * Si el llamador no informa ninguno y el usuario es Cliente, se usa su documento del token.
   * Es público (se puede reservar sin cuenta): el personal y el cliente dueño reciben la reserva
   * completa (`ReservaBase`); un invitado recibe solo la vista mínima (`ReservaConsulta`).
   */
  crearReserva(reserva: ReservaCreate): Observable<ApiResponse<ReservaBase | ReservaConsulta>> {
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
      .post<ApiResponse<ReservaBase | ReservaConsulta>>(`${this.baseUrl}/reservas`, payload)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /reservas/consulta: consulta de invitado (pública, con límite por IP). Requiere el id de la
   * reserva y el teléfono o documento del contacto; devuelve solo datos mínimos. Si el id no existe
   * o el contacto no coincide el backend responde el mismo 404 y se devuelve `null`; el 429 (demasiadas
   * consultas) y el resto de errores se propagan.
   */
  consultarReserva(reservaId: number, contacto: string): Observable<ReservaConsulta | null> {
    const params = new HttpParams().set('reservaId', String(reservaId)).set('contacto', contacto);
    return this.http
      .get<ApiResponse<ReservaConsulta>>(`${this.baseUrl}/reservas/consulta`, { params })
      .pipe(
        map((res) => res.data),
        catchError((error) =>
          error?.status === 404 ? of(null) : this.handleError.handleError(error),
        ),
      );
  }

  /** GET /reservas (solo personal, requiere token). Sin reservas responde 200 con `data: []`. */
  obtenerReservas(): Observable<ApiResponse<ReservaBase[]>> {
    return this.http
      .get<ApiResponse<ReservaBase[]>>(`${this.baseUrl}/reservas`)
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /reservas/cliente sin documento: reservas del Cliente con sesión (el documento sale del
   * token), `fecha` opcional (YYYY-MM-DD). `data: []` si no hay.
   */
  getMisReservas(fecha?: string): Observable<ApiResponse<ReservaBase[]>> {
    let params = new HttpParams();
    if (fecha) params = params.set('fecha', fecha);

    return this.http
      .get<ApiResponse<ReservaBase[]>>(`${this.baseUrl}/reservas/cliente`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /reservas/cliente?documentoCliente=: reservas de un cliente registrado, `fecha` opcional
   * (YYYY-MM-DD). Requiere token: el personal consulta cualquiera; un Cliente solo el suyo (403).
   */
  getReservasByCliente(
    documentoCliente: number,
    fecha?: string,
  ): Observable<ApiResponse<ReservaBase[]>> {
    let params = new HttpParams().set('documentoCliente', String(documentoCliente));
    if (fecha) params = params.set('fecha', fecha);

    return this.http
      .get<ApiResponse<ReservaBase[]>>(`${this.baseUrl}/reservas/cliente`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** GET /reservas/documento (solo personal): reservas por documento (cliente registrado o invitado). `data: []` si no hay. */
  getReservasByDocumento(
    documento: number,
    fecha?: string,
  ): Observable<ApiResponse<ReservaBase[]>> {
    let params = new HttpParams().set('documento', String(documento));
    if (fecha) params = params.set('fecha', fecha);

    return this.http
      .get<ApiResponse<ReservaBase[]>>(`${this.baseUrl}/reservas/documento`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** PUT /reservas?id= (requiere token). Merge: solo se envían los campos a modificar. 404 si no existe. */
  actualizarReserva(
    reservaId: number,
    reserva: ReservaUpdate,
  ): Observable<ApiResponse<ReservaBase>> {
    const params = new HttpParams().set('id', String(reservaId));
    return this.http
      .put<ApiResponse<ReservaBase>>(`${this.baseUrl}/reservas`, reserva, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /** GET /reservas/parameter (solo personal): el backend solo filtra por `contactoId` y `fecha` (YYYY-MM-DD). */
  getReservaByParameter(
    contactoId?: number,
    fecha?: string,
  ): Observable<ApiResponse<ReservaBase[]>> {
    let params = new HttpParams();

    if (contactoId !== undefined && !isNaN(contactoId)) {
      params = params.set('contactoId', contactoId.toString());
    }

    if (fecha) params = params.set('fecha', fecha);

    return this.http
      .get<ApiResponse<ReservaBase[]>>(`${this.baseUrl}/reservas/parameter`, { params })
      .pipe(catchError(this.handleError.handleError));
  }

  /**
   * GET /reservas/search?id= (requiere token: el personal ve cualquiera; un Cliente solo las suyas).
   * Si la reserva no existe (o no es suya) el backend responde 404 y se devuelve `null`; un id inválido (400) y el resto de errores se propagan.
   */
  getReservaById(id: number): Observable<ReservaBase | null> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .get<ApiResponse<ReservaBase>>(`${this.baseUrl}/reservas/search`, { params })
      .pipe(
        map((res) => res.data),
        catchError((error) =>
          error?.status === 404 ? of(null) : this.handleError.handleError(error),
        ),
      );
  }

  /**
   * DELETE /reservas?id= (requiere token). El backend no borra: marca la reserva como
   * CANCELADA y la devuelve en `data`. 404 si no existe y 409 si ya estaba cancelada; ambos
   * se propagan como error (`code` 404/409).
   */
  deleteReserva(id: number): Observable<ApiResponse<ReservaBase>> {
    const params = new HttpParams().set('id', String(id));
    return this.http
      .delete<ApiResponse<ReservaBase>>(`${this.baseUrl}/reservas`, { params })
      .pipe(catchError(this.handleError.handleError));
  }
}
