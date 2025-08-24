// src/app/modules/client/carrito/carrito.component.ts

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, firstValueFrom } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
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

  private destroy$ = new Subject<void>();

  constructor(
    private cart: CartService,
    private modalService: ModalService,
    private metodosPagoService: MetodosPagoService,
    private domicilioService: DomicilioService,
    private pedidoService: PedidoService,
    private productoPedidoService: ProductoPedidoService,
    private pedidoClienteService: PedidoClienteService,
    private userService: UserService,
    private clienteService: ClienteService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.cart.items$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.carrito = items;
        this.subtotal = items.reduce((s, p) => s + p.precio * (p.cantidad ?? 1), 0);
        this.totalCalorias = items.reduce((s, p) => s + (p.calorias || 0) * (p.cantidad ?? 1), 0);
      });

    this.metodosPagoService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe(r => this.paymentMethods = r.data || []);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sumar(p: Producto) { this.cart.changeQty(p.productoId!, +1); }
  restar(p: Producto) { this.cart.changeQty(p.productoId!, -1); }
  eliminar(p: Producto) { this.cart.remove(p.productoId!); }

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
        selected: null
      }
    ];

    this.modalService.openModal({
      title: 'Finalizar Pedido',
      selects,
      buttons: [
        { label: 'Cancelar', class: 'btn btn-secondary', action: () => this.modalService.closeModal() },
        { label: 'Confirmar', class: 'btn btn-primary', action: () => this.onCheckoutConfirm() }
      ]
    });
  }

  private async onCheckoutConfirm() {
    const { selects } = this.modalService.getModalData();
    const [methodSelect, deliverySelect] = selects!;
    const methodId = methodSelect.selected as number;
    const needsDelivery =
      deliverySelect.selected === true ||
      String(deliverySelect.selected).toLowerCase() === 'true';

    this.modalService.closeModal();

    try {
      let domicilioId: number | null = null;

      if (needsDelivery) {
        const clienteId = this.userService.getUserId();
        const cliente = await this.fetchCliente(clienteId);
        domicilioId = await this.crearDomicilio(cliente, clienteId);
      }

      await this.finalizeOrder(methodId, domicilioId);
    } catch (err) {
      this.handleError(err, 'No se pudo completar el checkout');
    }
  }

  private async fetchCliente(clienteId: number): Promise<Cliente> {
    try {
      const res = await firstValueFrom(
        this.clienteService.getClienteId(clienteId).pipe(takeUntil(this.destroy$))
      );
      if (!res?.data) {
        throw new Error('No se pudo obtener la información del cliente');
      }
      return res.data;
    } catch (err) {
      this.handleError(err, 'Error al obtener datos del cliente');
      throw err;
    }
  }

  private async crearDomicilio(cliente: Cliente, clienteId: number): Promise<number> {
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
      createdBy: `Usuario ${clienteId}`,
    };

    try {
      const resp = await firstValueFrom(
        this.domicilioService.createDomicilio(nuevoDomicilio).pipe(takeUntil(this.destroy$))
      );
      return (resp.data as Domicilio).domicilioId!;
    } catch (err) {
      this.handleError(err, 'Error al crear domicilio');
      throw err;
    }
  }

  private async finalizeOrder(methodId: number, domicilioId: number | null): Promise<void> {
    try {
      const pedidoRes = await firstValueFrom(
        this.pedidoService
          .createPedido({
            delivery: domicilioId !== null,
          })
          .pipe(takeUntil(this.destroy$))
      );
      const pedidoId = pedidoRes.data.pedidoId!;

      const detalles = this.carrito.map(p => ({
        PK_ID_PRODUCTO: p.productoId!,
        NOMBRE: p.nombre,
        CANTIDAD: p.cantidad!,
        PRECIO_UNITARIO: p.precio,
        SUBTOTAL: p.precio * p.cantidad!,
      }));

      await firstValueFrom(
        this.productoPedidoService
          .create({ PK_ID_PEDIDO: pedidoId, DETALLES_PRODUCTOS: detalles })
          .pipe(takeUntil(this.destroy$))
      );

      await firstValueFrom(
        this.pedidoClienteService
          .create({ pedidoId, documentoCliente: this.userService.getUserId() })
          .pipe(takeUntil(this.destroy$))
      );

      if (domicilioId !== null) {
        const resp = await firstValueFrom(
          this.pedidoService
            .assignDomicilio(pedidoId, domicilioId)
            .pipe(takeUntil(this.destroy$))
        );
        // Sólo validamos que delivery se mantenga TRUE; el estado sigue siendo INICIADO por contrato
        if (resp.data?.delivery !== true) {
          console.warn('Respuesta inesperada al asignar domicilio', resp.data);
        }
      }

      this.cart.clearCart();
      this.router.navigate(['/cliente/mis-pedidos']);
    } catch (err) {
      this.handleError(err, 'Error en el flujo de finalización del pedido');
      throw err;
    }
  }

  private handleError(error: any, message: string): void {
    console.error(message, error);
    this.toastr.error(message, 'Error');
  }
}
