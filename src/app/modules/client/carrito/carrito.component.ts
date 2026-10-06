// src/app/modules/client/carrito/carrito.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CartService } from '../../../core/services/cart.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { LiveAnnouncerService } from '../../../core/services/live-announcer.service';
import { MetodosPagoService } from '../../../core/services/metodos-pago.service';
import { ModalService } from '../../../core/services/modal.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { UserService } from '../../../core/services/user.service';
import {
  CheckoutDomicilio,
  CheckoutError,
  CheckoutRequest,
} from '../../../shared/models/checkout.model';
import { Cliente } from '../../../shared/models/cliente.model';
import { MetodosPago } from '../../../shared/models/metodo-pago.model';
import { Producto } from '../../../shared/models/producto.model';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./carrito.component.scss'],
})
export class CarritoComponent implements OnInit, OnDestroy {
  carrito: Producto[] = [];
  subtotal = 0;
  totalCalorias = 0;
  paymentMethods: MetodosPago[] = [];

  private destroy$ = new Subject<void>();
  private enviando = false;

  constructor(
    private cart: CartService,
    private modalService: ModalService,
    private metodosPagoService: MetodosPagoService,
    private pedidoService: PedidoService,
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
    this.cart.changeQty(p.productoId!, +1, p.observaciones);
  }
  restar(p: Producto) {
    this.cart.changeQty(p.productoId!, -1, p.observaciones);
  }
  eliminar(p: Producto) {
    this.cart.remove(p.productoId!, p.observaciones);
    const obsText = p.observaciones ? ` (${p.observaciones})` : '';
    this.live.announce(`${p.nombre}${obsText} eliminado del carrito`);
  }

  trackByProductId(index: number, producto: Producto): string {
    // Usar combinación de ID + observaciones para identificar instancias únicas
    return `${producto.productoId}-${producto.observaciones || 'sin-obs'}`;
  }

  volverAlMenu() {
    this.router.navigate(['/cliente/menu']);
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

    // Construir mensaje con observaciones de productos (si existen)
    const productosConObs = this.carrito.filter((p) => p.observaciones && p.observaciones.trim());
    let mensaje = '';

    if (productosConObs.length > 0) {
      mensaje = 'Observaciones de productos:\n\n';
      productosConObs.forEach((p) => {
        mensaje += `• ${p.nombre} (x${p.cantidad}): ${p.observaciones}\n`;
      });
    }

    this.modalService.openModal({
      title: 'Finalizar Pedido',
      message: mensaje || undefined, // Solo mostrar si hay observaciones
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
    const { selects } = this.modalService.getModalData();
    const [methodSelect, deliverySelect] = selects!;
    const methodId = methodSelect.selected as number;
    const metodoLabel = methodSelect.options?.find((o) => o.value === methodId)?.label || '';
    const observacion = this.modalService.getObservaciones() || ''; // Obtener del campo automático
    const needsDelivery =
      deliverySelect.selected === true || String(deliverySelect.selected).toLowerCase() === 'true';

    this.modalService.closeModal();
    // Evita un segundo checkout mientras el primero sigue en vuelo (crearía otro pedido).
    if (this.enviando) return;
    this.enviando = true;
    try {
      let domicilio: CheckoutDomicilio | undefined;
      if (needsDelivery) {
        const cliente = await this.fetchCliente(this.userService.getUserId());
        if (!cliente) return;
        domicilio = this.construirDomicilio(cliente, metodoLabel, observacion);
      }
      await this.enviarCheckout(methodId, domicilio);
    } finally {
      this.enviando = false;
    }
  }

  /** Devuelve el cliente de la sesión o `null` (tras avisar al usuario) si no se pudo obtener. */
  private async fetchCliente(clienteId: number): Promise<Cliente | null> {
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
      return null;
    }
  }

  /** Domicilio del checkout: dirección y teléfono del cliente más las observaciones del pedido. */
  private construirDomicilio(
    cliente: Cliente,
    metodoLabel: string,
    observacion: string,
  ): CheckoutDomicilio {
    // Construir observaciones incluyendo las de cada producto
    let obsCompleta = `Método pago: ${metodoLabel}`;

    // Agregar observaciones generales
    if (observacion) {
      obsCompleta += ` - Observaciones generales: ${observacion}`;
    }

    // Agregar observaciones específicas por producto
    const productosConObs = this.carrito.filter((p) => p.observaciones);
    if (productosConObs.length > 0) {
      obsCompleta += '\n\nObservaciones por producto:';
      productosConObs.forEach((p) => {
        obsCompleta += `\n• ${p.nombre} (x${p.cantidad}): ${p.observaciones}`;
      });
    }

    if (!observacion && productosConObs.length === 0) {
      obsCompleta += ' - Sin observaciones';
    }

    // La fecha del domicilio y el estado (PENDIENTE) los fija el servidor.
    return { direccion: cliente.direccion, telefono: cliente.telefono, observaciones: obsCompleta };
  }

  /**
   * Una sola llamada atómica: el back crea domicilio, pedido, productos (descontando inventario) y
   * pago en una transacción; si falla no queda nada guardado y el usuario puede reintentar. El
   * cliente sale del token y el monto lo calcula el servidor (el `subtotal` local es solo una
   * vista previa).
   */
  private async enviarCheckout(methodId: number, domicilio?: CheckoutDomicilio): Promise<void> {
    try {
      const documentoCliente = this.userService.getUserId();
      const request: CheckoutRequest = {
        restauranteId: 1,
        ...(domicilio && { domicilio }),
        productos: this.carrito.map((p) => ({ productoId: p.productoId!, cantidad: p.cantidad! })),
        pago: { metodoPagoId: methodId },
      };

      const res = await firstValueFrom(
        this.pedidoService.checkout(request).pipe(takeUntil(this.destroy$)),
      );
      const total = res.data.monto; // total real que fijó el servidor

      // ✅ Telemetría de compra completada
      const itemsSnapshot = this.carrito.map((p) => ({
        productId: p.productoId!,
        name: p.nombre,
        quantity: p.cantidad!,
        unitPrice: p.precio,
      }));
      const methodLabel =
        this.paymentMethods.find((m) => m.metodoPagoId === methodId)?.tipo ?? String(methodId);

      this.telemetry.logPurchase({
        userId: documentoCliente || null,
        paymentMethodId: methodId,
        paymentMethodLabel: methodLabel,
        requiresDelivery: !!domicilio,
        items: itemsSnapshot,
        subtotal: total,
      });

      // Las notificaciones push del pedido (al cliente y a los trabajadores) las envía el servidor.

      // Limpiar carrito y redirigir
      this.cart.clearCart();
      this.live.announce('Pedido creado exitosamente');
      this.toastr.success(
        `Tu pedido por $${total.toLocaleString('es-CO')} ha sido creado. Pronto recibirás actualizaciones.`,
        'Pedido Exitoso',
      );
      this.router.navigate(['/cliente/mis-pedidos']);
    } catch (err) {
      // 409 con el detalle por producto (CheckoutError.data): el carrito se conserva para ajustarlo
      const faltantes = this.inventarioInsuficiente(err);
      if (faltantes) {
        this.toastr.error(
          `No hay suficiente inventario: ${faltantes}. Por favor, reduce las cantidades.`,
          'Inventario Insuficiente',
        );
      } else {
        this.handleError(err, 'Error al crear el pedido. Intenta nuevamente.');
      }
    }
  }

  /**
   * Si el error es el 409 de inventario de /pedidos/checkout devuelve el texto con los productos
   * faltantes (nombre del carrito, requerido y disponible); si no, `null`.
   */
  private inventarioInsuficiente(err: unknown): string | null {
    const e = err as Partial<CheckoutError> | null;
    if (e?.code !== 409 || !Array.isArray(e.data)) return null;
    return e.data
      .map((i) => {
        const nombre =
          this.carrito.find((p) => p.productoId === i.productoId)?.nombre ??
          `Producto ${i.productoId}`;
        return `${nombre} (pediste ${i.requerido}, disponible ${i.disponible})`;
      })
      .join(', ');
  }

  private handleError(error: unknown, message: string): void {
    console.error(message, error);
    // 403/404/409 traen un motivo claro del back (p. ej. "El pedido ya tiene un pago asignado").
    const api = error as Partial<{ code: number; message: string }> | null;
    const motivo = api?.code && [403, 404, 409].includes(api.code) ? api.message : undefined;
    this.toastr.error(motivo ? `${message} ${motivo}` : message, 'Error');
  }
}
