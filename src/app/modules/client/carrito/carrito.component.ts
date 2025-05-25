import { Component, OnDestroy, OnInit } from '@angular/core';
import { CartService } from '../../../core/services/cart.service';
import { Producto } from '../../../shared/models/producto.model';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss'],
  imports: [CommonModule]

})
export class CarritoComponent implements OnInit, OnDestroy {
  carrito: Producto[] = [];
  subtotal = 0;
  totalCalorias = 0;

  private sub!: Subscription;

  constructor(private cart: CartService) { }

  ngOnInit(): void {
    this.sub = this.cart.items$.subscribe(items => {
      this.carrito = items;
      this.subtotal = items.reduce((sum, p) => sum + p.precio * (p.cantidad ?? 1), 0);
      this.totalCalorias = this.carrito.reduce((sum, p) => sum + (p.calorias || 0) * (p.cantidad || 1), 0);
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  sumar(p: Producto) { this.cart.changeQty(p.productoId!, +1); }
  restar(p: Producto) { this.cart.changeQty(p.productoId!, -1); }
  eliminar(p: Producto) { this.cart.remove(p.productoId!); }

  crearOrden() {
    console.log('Orden con', this.carrito);
  }
}