import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../shared/models/api-response.model';
import { HandleErrorService } from './handle-error.service';

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
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient, private handleError: HandleErrorService) {}

  create(data: { PK_ID_PEDIDO: number; DETALLES_PRODUCTOS: any[] }) {
    const body = {
      pedidoId: data.PK_ID_PEDIDO,
      detallesProductos: data.DETALLES_PRODUCTOS,
    };
    return this.http
      .post<ApiResponse<any>>(`${this.baseUrl}/producto_pedido`, body)
      .pipe(catchError(this.handleError.handleError));
  }
}
