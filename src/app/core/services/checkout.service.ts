import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { switchMap, catchError, tap, map } from 'rxjs/operators';

import { CartService } from './cart.service';
import { DomicilioService } from './domicilio.service';
import { PedidoService } from './pedido.service';
import { ProductoPedidoService } from './producto-pedido.service';
import { PedidoClienteService } from './pedido-cliente.service';
import { UserService } from './user.service';
import { ClienteService } from './cliente.service';

import { Producto } from '../../shared/models/producto.model';
import { Domicilio } from '../../shared/models/domicilio.model';
import { Cliente } from '../../shared/models/cliente.model';
import { estadoPago } from '../../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  constructor(
    private cart: CartService,
    private domicilioService: DomicilioService,
    private pedidoService: PedidoService,
    private productoPedidoService: ProductoPedidoService,
    private pedidoClienteService: PedidoClienteService,
    private userService: UserService,
    private clienteService: ClienteService,
    private router: Router
  ) {}

  checkout(methodId: number, needsDelivery: boolean): Observable<void> {
    if (!needsDelivery) {
      return this.finalizeOrder(methodId, null);
    }

    const clienteId = this.userService.getUserId();
    return this.clienteService.getClienteId(clienteId).pipe(
      catchError(err => {
        console.error('Error al obtener datos del cliente:', err);
        return throwError(() => err);
      }),
      switchMap(resCliente => {
        if (!resCliente || !resCliente.data) {
          return throwError(() => new Error('No se pudo obtener la información del cliente'));
        }
        const cliente: Cliente = resCliente.data;

        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        const fechaHoy = `${yyyy}-${mm}-${dd}`;

        const nuevoDomicilio: Domicilio = {
          direccion: cliente.direccion,
          telefono: cliente.telefono,
          estadoPago: estadoPago.PENDIENTE,
          entregado: false,
          fechaDomicilio: fechaHoy,
          observaciones: cliente.observaciones || '',
          createdBy: `Usuario ${clienteId}`
        };

        return this.domicilioService.createDomicilio(nuevoDomicilio).pipe(
          catchError(err2 => {
            console.error('Error al crear domicilio:', err2);
            return throwError(() => err2);
          }),
          switchMap(respDom => {
            const domicilioId = (respDom.data as Domicilio).domicilioId!;
            return this.finalizeOrder(methodId, domicilioId);
          })
        );
      })
    );
  }

  private finalizeOrder(methodId: number, domicilioId: number | null): Observable<void> {
    const carrito: Producto[] = this.cart.getItems();
    return this.pedidoService.createPedido({ delivery: domicilioId !== null }).pipe(
      switchMap(res => {
        const pedidoId = res.data.pedidoId!;
        const detalles = carrito.map(p => ({
          PK_ID_PRODUCTO: p.productoId!,
          NOMBRE: p.nombre,
          CANTIDAD: p.cantidad!,
          PRECIO_UNITARIO: p.precio,
          SUBTOTAL: p.precio * p.cantidad!
        }));
        return this.productoPedidoService.create({
          PK_ID_PEDIDO: pedidoId,
          DETALLES_PRODUCTOS: detalles
        }).pipe(switchMap(() => of(pedidoId)));
      }),
      switchMap(pedidoId =>
        this.pedidoClienteService.create({
          pedidoId,
          documentoCliente: this.userService.getUserId()
        }).pipe(switchMap(() => of(pedidoId)))
      ),
      switchMap(pedidoId =>
        this.pedidoService.assignPago(pedidoId, methodId).pipe(switchMap(() => of(pedidoId)))
      ),
      switchMap(pedidoId => {
        return domicilioId !== null
          ? this.pedidoService.assignDomicilio(pedidoId, domicilioId).pipe(switchMap(() => of(pedidoId)))
          : of(pedidoId);
      }),
      tap(() => {
        this.cart.clearCart();
        this.router.navigate(['/cliente/mis-pedidos']);
      }),
      catchError(err => {
        console.error('Error en el flujo de finalizeOrder:', err);
        return throwError(() => err);
      }),
      map(() => void 0)
    );
  }
}

