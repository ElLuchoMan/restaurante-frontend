import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';
import { environment } from '../../../environments/environment';

interface DetalleProducto {
  PK_ID_PRODUCTO: number;
  NOMBRE: string;
  CANTIDAD: number;
  PRECIO_UNITARIO: number;
  SUBTOTAL: number;
}

interface CrearProductoPedido {
  PK_ID_PEDIDO: number;
  DETALLES_PRODUCTOS: DetalleProducto[];
}

@Injectable({ providedIn: 'root' })
export class ProductoPedidoService {
  private baseUrl = `${environment.apiUrl}/producto_pedido`;

  constructor(private http: HttpClient) { }

  create(payload: CrearProductoPedido): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.baseUrl, {
      PK_ID_PEDIDO: payload.PK_ID_PEDIDO,
      DETALLES_PRODUCTOS: JSON.stringify(payload.DETALLES_PRODUCTOS)
    });
  }
}
