import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { Producto } from '../../models/producto.model';

interface CartItem {
  producto: Producto;
  cantidad: number;
}

@Component({
  selector: 'app-floating-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-cart.component.html',
  styleUrls: ['./floating-cart.component.scss'],
})
export class FloatingCartComponent implements OnInit, OnDestroy {
  @Input() isVisible = true;

  cartItems: CartItem[] = [];
  totalItems = 0;
  totalPrice = 0;
  isExpanded = false;
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cartService.items$.pipe(takeUntil(this.destroy$)).subscribe((items) => {
      this.cartItems = items.map((item) => ({
        producto: item,
        cantidad: item.cantidad || 1,
      }));
      this.calculateTotals();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  updateQuantity(productId: number, change: number): void {
    const item = this.cartItems.find((i) => i.producto.productoId === productId);
    if (item && item.producto.productoId) {
      const newQuantity = item.cantidad + change;
      if (newQuantity <= 0) {
        this.removeItem(item.producto.productoId);
      } else {
        this.cartService.changeQty(item.producto.productoId, change);
      }
    }
  }

  removeItem(productId: number): void {
    this.cartService.remove(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.isExpanded = false;
  }

  goToCheckout(): void {
    this.router.navigate(['/cliente/carrito-cliente']);
    this.isExpanded = false;
  }

  private calculateTotals(): void {
    this.totalItems = this.cartItems.reduce((sum, item) => sum + item.cantidad, 0);
    this.totalPrice = this.cartItems.reduce(
      (sum, item) => sum + item.producto.precio * item.cantidad,
      0,
    );
  }

  trackByProductId(index: number, item: any): number {
    return item.producto.productoId;
  }
}
