// src/app/modules/client/carrito/carrito.component.ts

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

import { CartService } from '../../../core/services/cart.service';
import { ModalService } from '../../../core/services/modal.service';
import { MetodosPagoService } from '../../../core/services/metodos-pago.service';
import { DomicilioService } from '../../../core/services/domicilio.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ProductoPedidoService } from '../../../core/services/producto-pedido.service';
import { PedidoClienteService } from '../../../core/services/pedido-cliente.service';
import { UserService } from '../../../core/services/user.service';
import { ClienteService } from '../../../core/services/cliente.service';

import { Producto } from '../../../shared/models/producto.model';
import { MetodosPago } from '../../../shared/models/metodo-pago.model';
import { Domicilio } from '../../../shared/models/domicilio.model';
import { Cliente } from '../../../shared/models/cliente.model';
import { estadoPago } from '../../../shared/constants';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss']
})
export class CarritoComponent implements OnInit, OnDestroy {
  carrito: Producto[] = [];
  subtotal = 0;
  totalCalorias = 0;
  paymentMethods: MetodosPago[] = [];

  private sub!: Subscription;

  constructor(
    private cart: CartService,
    private modalService: ModalService,
    private metodosPagoService: MetodosPagoService,
    private domicilioService: DomicilioService,
    private pedidoService: PedidoService,
    private productoPedidoService: ProductoPedidoService,
    private pedidoClienteService: PedidoClienteService,
    private userService: UserService,
    private clienteService: ClienteService, // Ya existe en tu proyecto
    private router: Router
  ) { }

  ngOnInit(): void {
    this.sub = this.cart.items$.subscribe(items => {
      this.carrito = items;
      this.subtotal = items.reduce((s, p) => s + p.precio * (p.cantidad ?? 1), 0);
      this.totalCalorias = items.reduce((s, p) => s + (p.calorias || 0) * (p.cantidad ?? 1), 0);
    });

    this.metodosPagoService.getAll()
      .subscribe(r => this.paymentMethods = r.data || []);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  sumar(p: Producto)   { this.cart.changeQty(p.productoId!, +1); }
  restar(p: Producto)  { this.cart.changeQty(p.productoId!, -1); }
  eliminar(p: Producto){ this.cart.remove(p.productoId!); }

  crearOrden() {
    const selects = [
      {
        label: 'Método de pago',
        options: this.paymentMethods.map(m => ({ label: m.tipo, value: m.metodoPagoId! })),
        selected: null as number | null
      },
      {
        label: 'Requiere domicilio',
        options: [
          { label: 'No', value: false },
          { label: 'Sí', value: true }
        ],
        selected: false
      }
    ];

    this.modalService.openModal({
      title: 'Finalizar Pedido',
      selects,
      buttons: [
        { label: 'Cancelar', class: 'btn btn-secondary', action: () => this.modalService.closeModal() },
        { label: 'Confirmar', class: 'btn btn-primary',  action: () => this.onCheckoutConfirm() }
      ]
    });
  }

  private onCheckoutConfirm() {
    const modalData = this.modalService.getModalData();
    const selects = modalData?.selects;
    if (!selects) return;
    const [methodSelect, deliverySelect] = selects;
    const methodId      = methodSelect.selected as number;
    const needsDelivery = deliverySelect.selected as boolean;

    this.modalService.closeModal();

    // 1) Si NO requiere domicilio → finalizamos sin crear domicilio
    if (!needsDelivery) {
      return this.finalizeOrder(methodId, null);
    }

    // 2) Si requiere domicilio:
    //    2.1) Obtenemos el ID del cliente (documento) desde el token
    const clienteId = this.userService.getUserId();

    //    2.2) Llamamos a ClienteService.getClienteId(...) para traer su registro completo
    this.clienteService.getClienteId(clienteId).pipe(
      catchError(err => {
        console.error('Error al obtener datos del cliente:', err);
        // En caso de error, retornamos null para interrumpir el flujo
        return of(null as any);
      }),
      switchMap((resCliente) => {
        if (!resCliente || !resCliente.data) {
          throw new Error('No se pudo obtener la información del cliente');
        }
        const cliente: Cliente = resCliente.data;

        // 2.3) Creamos el objeto Domicilio con la dirección/telefono que trae el cliente
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm   = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd   = String(hoy.getDate()).padStart(2, '0');
        const fechaHoy = `${yyyy}-${mm}-${dd}`; // formato "YYYY-MM-DD"

        const nuevoDomicilio: Domicilio = {
          direccion:      cliente.direccion,
          telefono:       cliente.telefono,
          estadoPago:     estadoPago.PENDIENTE,   // Asignamos 'PENDIENTE' por defecto
          entregado:      false,         // Recién creado
          fechaDomicilio: fechaHoy,
          observaciones:  cliente.observaciones || '',
          createdBy:      `Usuario ${clienteId}`, // Asignamos el ID del cliente como creador
          // createdAt/updatedAt los maneja el backend; trabajadorAsignado=null
        };

        // 2.4) Llamamos a createDomicilio para insertarlo en la BD
        return this.domicilioService.createDomicilio(nuevoDomicilio).pipe(
          catchError(err2 => {
            console.error('Error al crear domicilio:', err2);
            throw err2;
          })
        );
      })
    ).subscribe({
      next: (respDomicilio) => {
        // 2.5) Ya tenemos el domicilio recién creado → extraemos domicilioId
        const domicilioId = (respDomicilio.data as Domicilio).domicilioId!;
        // 2.6) Continuamos el flujo normal con finalizeOrder
        this.finalizeOrder(methodId, domicilioId);
      },
      error: (err) => {
        // Si algo falla al obtener cliente o crear domicilio → mostramos un error
        console.error('No se pudo completar la creación de domicilio, el checkout se canceló.', err);
        // Aquí podrías mostrar un toast o mensaje en pantalla para avisar al usuario
      }
    });
  }

  private finalizeOrder(methodId: number, domicilioId: number | null) {
    // 3.1) Crear el pedido (POST /pedidos) → devolvemos el ID
    this.pedidoService.createPedido({ delivery: domicilioId !== null }).pipe(
      switchMap(res => {
        const pedidoId = res.data.pedidoId!;

        // 3.2) Crear ProductoPedido (POST /producto_pedido)
        const detalles = this.carrito.map(p => ({
          PK_ID_PRODUCTO:   p.productoId!,
          NOMBRE:           p.nombre,
          CANTIDAD:         p.cantidad!,
          PRECIO_UNITARIO:  p.precio,
          SUBTOTAL:         p.precio * p.cantidad!
        }));
        return this.productoPedidoService.create({
          PK_ID_PEDIDO:       pedidoId,
          DETALLES_PRODUCTOS: detalles
        }).pipe(switchMap(() => of(pedidoId)));
      }),
      // 3.3) Crear PedidoCliente (POST /pedido_clientes)
      switchMap(pedidoId =>
        this.pedidoClienteService.create({
          pedidoId:         pedidoId,
          documentoCliente: this.userService.getUserId()
        }).pipe(switchMap(() => of(pedidoId)))
      ),
      // 3.4) Asignar pago (POST /pedidos/asignar-pago?pedido_id=X&pago_id=Y)
      switchMap(pedidoId =>
        this.pedidoService.assignPago(pedidoId, methodId).pipe(switchMap(() => of(pedidoId)))
      ),
      // 3.5) Si existe domicilioId, asignarlo (POST /pedidos/asignar-domicilio?pedido_id=X&domicilio_id=Y)
      switchMap(pedidoId => {
        return domicilioId !== null
          ? this.pedidoService.assignDomicilio(pedidoId, domicilioId)
          : of(null);
      })
    ).subscribe({
      next: () => {
        // 3.6) Al terminar, limpio carrito y redirijo a “Mis pedidos”
        this.cart.clearCart();
        this.router.navigate(['/cliente/mis-pedidos']);
      },
      error: err => {
        console.error('Error en el flujo de finalizeOrder:', err);
        // Aquí podrías mostrar un toast de error
      }
    });
  }
}
