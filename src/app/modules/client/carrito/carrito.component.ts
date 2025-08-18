// src/app/modules/client/carrito/carrito.component.ts

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { ModalService } from '../../../core/services/modal.service';
import { MetodosPagoService } from '../../../core/services/metodos-pago.service';
import { CheckoutService } from '../../../core/services/checkout.service';

import { Producto } from '../../../shared/models/producto.model';
import { MetodosPago } from '../../../shared/models/metodo-pago.model';

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
    private checkoutService: CheckoutService
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
    const { selects } = this.modalService.getModalData();
    const [methodSelect, deliverySelect] = selects;
    const methodId = methodSelect.selected as number;
    const needsDelivery = deliverySelect.selected as boolean;

    this.modalService.closeModal();

    this.checkoutService.checkout(methodId, needsDelivery).subscribe({
      error: err => {
        console.error('Error en el proceso de checkout:', err);
      }
    });
  }
}
