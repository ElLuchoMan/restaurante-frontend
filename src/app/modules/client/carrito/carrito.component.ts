// src/app/modules/client/carrito/carrito.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CartService } from '../../../core/services/cart.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { DomicilioService } from '../../../core/services/domicilio.service';
import { LiveAnnouncerService } from '../../../core/services/live-announcer.service';
import { MetodosPagoService } from '../../../core/services/metodos-pago.service';
import { ModalService } from '../../../core/services/modal.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { PedidoClienteService } from '../../../core/services/pedido-cliente.service';
import { ProductoPedidoService } from '../../../core/services/producto-pedido.service';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { UserService } from '../../../core/services/user.service';
import { estadoDomicilio } from '../../../shared/constants';
import { Cliente } from '../../../shared/models/cliente.model';
import { Domicilio, DomicilioRequest } from '../../../shared/models/domicilio.model';
import { MetodosPago } from '../../../shared/models/metodo-pago.model';
import { Producto } from '../../../shared/models/producto.model';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss'],
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
    private toastr: ToastrService,
    private telemetry: TelemetryService,
    private live: LiveAnnouncerService,
  ) {}

  ngOnInit(): void {
    this.cart.items$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
      this.carrito = items;
      this.subtotal = items.reduce((s, p) => s + p.precio * (p.cantidad ?? 1), 0);
      this.totalCalorias = items.reduce((s, p) => s + (p.calorias || 0) * (p.cantidad ?? 1), 0);
    });

    this.metodosPagoService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe((r) => (this.paymentMethods = r.data || []));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sumar(p: Producto) {
    this.cart.changeQty(p.productoId!, +1);
  }
  restar(p: Producto) {
    this.cart.changeQty(p.productoId!, -1);
  }
  eliminar(p: Producto) {
    this.cart.remove(p.productoId!);
    this.live.announce(`${p.nombre} eliminado del carrito`);
  }

  crearOrden() {
    const selects = [
      {
        label: 'Método de pago',
        options: this.paymentMethods.map((m) => ({ label: m.tipo, value: m.metodoPagoId! })),
        selected: null as number | null,
      },
      {
        label: 'Requiere domicilio',
        options: [
          { label: 'No', value: false },
          { label: 'Sí', value: true },
        ],
        selected: null,
      },
    ];

    this.modalService.openModal({
      title: 'Finalizar Pedido',
      input: { label: 'Observaciones', value: '' },
      selects,
      buttons: [
        {
          label: 'Cancelar',
          class: 'btn btn-secondary',
          action: () => this.modalService.closeModal(),
        },
        { label: 'Confirmar', class: 'btn btn-primary', action: () => this.onCheckoutConfirm() },
      ],
    });
  }

  private async onCheckoutConfirm() {
    const { selects, input } = this.modalService.getModalData();
    const [methodSelect, deliverySelect] = selects!;
    const methodId = methodSelect.selected as number;
    const metodoLabel = methodSelect.options?.find((o) => o.value === methodId)?.label || '';
    const observacion = input?.value || '';
    const needsDelivery =
      deliverySelect.selected === true || String(deliverySelect.selected).toLowerCase() === 'true';

    this.modalService.closeModal();

    try {
      let domicilioId: number | null = null;

      if (needsDelivery) {
        const clienteId = this.userService.getUserId();
        const cliente = await this.fetchCliente(clienteId);
        domicilioId = await this.crearDomicilio(cliente, clienteId, metodoLabel, observacion);
      }

      await this.finalizeOrder(methodId, domicilioId);
    } catch (err) {
      this.handleError(err, 'No se pudo completar el checkout');
    }
  }

  private async fetchCliente(clienteId: number): Promise<Cliente> {
    try {
      const res = await firstValueFrom(
        this.clienteService.getClienteId(clienteId).pipe(takeUntil(this.destroy$)),
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

  private async crearDomicilio(
    cliente: Cliente,
    clienteId: number,
    metodoLabel: string,
    observacion: string,
  ): Promise<number> {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const fechaHoy = `${yyyy}-${mm}-${dd}`;

    const obs = `Método pago: ${metodoLabel} - Observaciones: ${
      observacion || 'Sin observaciones'
    }`;

    const nuevoDomicilio: DomicilioRequest = {
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      estadoDomicilio: estadoDomicilio.PENDIENTE,
      fechaDomicilio: fechaHoy,
      observaciones: obs,
      createdBy: `Usuario ${clienteId}`,
    };

    try {
      const resp = await firstValueFrom(
        this.domicilioService.createDomicilio(nuevoDomicilio).pipe(takeUntil(this.destroy$)),
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
          .createPedido({ delivery: domicilioId !== null })
          .pipe(takeUntil(this.destroy$)),
      );
      const pedidoId = pedidoRes.data.pedidoId!;

      const detalles = this.carrito.map((p) => ({
        productoId: p.productoId!,
        cantidad: p.cantidad!,
      }));

      await firstValueFrom(
        this.productoPedidoService.create(pedidoId, detalles as any).pipe(takeUntil(this.destroy$)),
      );

      await firstValueFrom(
        this.pedidoClienteService
          .create({ pedidoId, documentoCliente: this.userService.getUserId() })
          .pipe(takeUntil(this.destroy$)),
      );

      if (domicilioId !== null) {
        const resp = await firstValueFrom(
          this.pedidoService.assignDomicilio(pedidoId, domicilioId).pipe(takeUntil(this.destroy$)),
        );
        // Sólo validamos que delivery se mantenga TRUE; el estado sigue siendo INICIADO por contrato
        if (resp.data?.delivery !== true) {
          console.warn('Respuesta inesperada al asignar domicilio', resp.data);
        }
      }

      // Telemetría de compra completada
      const itemsSnapshot = this.carrito.map((p) => ({
        productId: p.productoId!,
        name: p.nombre,
        quantity: p.cantidad!,
        unitPrice: p.precio,
      }));
      const subtotal = itemsSnapshot.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
      // Obtener label del método desde paymentMethods
      const methodLabel =
        this.paymentMethods.find((m) => m.metodoPagoId === methodId)?.tipo ?? String(methodId);
      this.telemetry.logPurchase({
        userId: this.userService.getUserId?.() ?? null,
        paymentMethodId: methodId,
        paymentMethodLabel: methodLabel,
        requiresDelivery: domicilioId !== null,
        items: itemsSnapshot,
        subtotal,
      });

      this.cart.clearCart();
      this.live.announce('Carrito vaciado');
      this.router.navigate(['/cliente/mis-pedidos']);
    } catch (err) {
      this.handleError(err, 'Error en el flujo de finalización del pedido');
      throw err;
    }
  }

  private handleError(error: unknown, message: string): void {
    console.error(message, error);
    this.toastr.error(message, 'Error');
  }
}
