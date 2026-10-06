// src/app/modules/client/carrito/carrito.component.ts

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
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
import { PagoService } from '../../../core/services/pago.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ProductoPedidoService } from '../../../core/services/producto-pedido.service';
import { TelemetryService } from '../../../core/services/telemetry.service';
import { UserService } from '../../../core/services/user.service';
import { estadoDomicilio, estadoPago } from '../../../shared/constants';
import { Cliente } from '../../../shared/models/cliente.model';
import { DomicilioCreate } from '../../../shared/models/domicilio.model';
import { MetodosPago } from '../../../shared/models/metodo-pago.model';
import { PagoCreate } from '../../../shared/models/pago.model';
import { PedidoCreate } from '../../../shared/models/pedido.model';
import { Producto } from '../../../shared/models/producto.model';
import { ProductoPedidoError } from '../../../shared/models/producto-pedido.model';

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

  constructor(
    private cart: CartService,
    private modalService: ModalService,
    private metodosPagoService: MetodosPagoService,
    private domicilioService: DomicilioService,
    private pedidoService: PedidoService,
    private productoPedidoService: ProductoPedidoService,
    private pagoService: PagoService,
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

    try {
      let domicilioId: number | null = null;

      // 🔹 Si requiere domicilio, crearlo PRIMERO
      if (needsDelivery) {
        const clienteId = this.userService.getUserId();
        const cliente = await this.fetchCliente(clienteId);
        domicilioId = await this.crearDomicilio(cliente, clienteId, metodoLabel, observacion);
        console.log(`✅ Domicilio creado con ID: ${domicilioId}`);
      }

      // 🔹 Crear el pedido (con o sin domicilio según corresponda)
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

    const nuevoDomicilio: DomicilioCreate = {
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      estadoDomicilio: estadoDomicilio.PENDIENTE,
      fechaDomicilio: fechaHoy,
      observaciones: obsCompleta,
      createdBy: `Usuario ${clienteId}`,
    };

    try {
      const resp = await firstValueFrom(
        this.domicilioService.createDomicilio(nuevoDomicilio).pipe(takeUntil(this.destroy$)),
      );
      return resp.data.domicilioId;
    } catch (err) {
      this.handleError(err, 'Error al crear domicilio');
      throw err;
    }
  }

  private async finalizeOrder(methodId: number, domicilioId: number | null): Promise<void> {
    try {
      const documentoCliente = this.userService.getUserId();

      // PASO 1: Crear pedido base (con pk_id_domicilio si se requiere). El cliente sale del token
      // en el back: un `documentoCliente` distinto al de la sesión respondería 403, así que no se envía.
      const pedidoPayload: PedidoCreate = {
        delivery: domicilioId !== null,
        restauranteId: 1,
        ...(domicilioId !== null && { pk_id_domicilio: domicilioId }),
      };

      const pedidoRes = await firstValueFrom(
        this.pedidoService.createPedido(pedidoPayload).pipe(takeUntil(this.destroy$)),
      );
      const pedidoId = pedidoRes.data.pedidoId;

      // PASO 2: Asociar productos al pedido
      const detalles = this.carrito.map((p) => ({
        productoId: p.productoId!,
        cantidad: p.cantidad!,
      }));

      await firstValueFrom(
        this.productoPedidoService.create(pedidoId, detalles).pipe(takeUntil(this.destroy$)),
      );

      // PASO 3: Crear registro de pago
      const now = new Date();

      // Obtener fecha/hora UTC con formato correcto (el backend maneja la conversión a Bogotá)
      const year = now.getUTCFullYear();
      const month = String(now.getUTCMonth() + 1).padStart(2, '0');
      const day = String(now.getUTCDate()).padStart(2, '0');
      const hour = String(now.getUTCHours()).padStart(2, '0');
      const minute = String(now.getUTCMinutes()).padStart(2, '0');
      const second = String(now.getUTCSeconds()).padStart(2, '0');

      const fechaPago = `${year}-${month}-${day}`;
      const horaPago = `${hour}:${minute}:${second}`;

      const nuevoPago: PagoCreate = {
        fechaPago,
        horaPago,
        monto: this.subtotal,
        estadoPago: estadoPago.PENDIENTE,
        metodoPagoId: methodId,
      };

      const pagoRes = await firstValueFrom(
        this.pagoService.createPago(nuevoPago).pipe(takeUntil(this.destroy$)),
      );
      const pagoId = pagoRes.data.pagoId;

      // PASO 4: Asignar pago al pedido (sin cambiar estados)
      await firstValueFrom(
        this.pedidoService.assignPago(pedidoId, pagoId, false).pipe(takeUntil(this.destroy$)),
      );

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
        requiresDelivery: domicilioId !== null,
        items: itemsSnapshot,
        subtotal: this.subtotal,
      });

      // Las notificaciones push del pedido (al cliente y a los trabajadores) las envía el servidor.

      // Limpiar carrito y redirigir
      this.cart.clearCart();
      this.live.announce('Pedido creado exitosamente');
      this.toastr.success(
        'Tu pedido ha sido creado. Pronto recibirás actualizaciones.',
        'Pedido Exitoso',
      );
      this.router.navigate(['/cliente/mis-pedidos']);
    } catch (err: any) {
      // Manejar errores específicos: 409 con el detalle por producto (ProductoPedidoError.data)
      const faltantes = this.inventarioInsuficiente(err);
      if (faltantes) {
        this.toastr.error(
          `No hay suficiente inventario: ${faltantes}. Por favor, reduce las cantidades.`,
          'Inventario Insuficiente',
        );
      } else {
        this.handleError(err, 'Error al crear el pedido. Intenta nuevamente.');
      }
      throw err;
    }
  }

  /**
   * Si el error es el 409 de inventario de /producto_pedido devuelve el texto con los productos
   * faltantes (nombre del carrito, requerido y disponible); si no, `null`.
   */
  private inventarioInsuficiente(err: unknown): string | null {
    const e = err as Partial<ProductoPedidoError> | null;
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
