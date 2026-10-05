import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Producto } from '../../shared/models/producto.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly storageKey = 'carrito';
  private readonly lastClearKey = `${this.storageKey}-lastClear`;
  private isBrowser: boolean;

  public count$ = new BehaviorSubject<number>(0);
  public items$ = new BehaviorSubject<Producto[]>([]);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.clearIfNeeded();
      this.loadCart();
    }
  }

  /** Borra el carrito si la última limpieza no fue hoy */
  private clearIfNeeded(): void {
    if (!this.isBrowser) return;
    const last = localStorage.getItem(this.lastClearKey);
    const today = new Date().toISOString().split('T')[0];
    if (last !== today) {
      localStorage.removeItem(this.storageKey);
      localStorage.setItem(this.lastClearKey, today);
    }
  }

  /** Carga el carrito desde localStorage y emite items$ y count$ */
  private loadCart(): void {
    if (!this.isBrowser) return;
    const raw = localStorage.getItem(this.storageKey);
    const arr: Producto[] = raw ? JSON.parse(raw) : [];
    this.items$.next(arr);
    this.count$.next(arr.reduce((sum, p) => sum + (p.cantidad || 1), 0));
  }

  /** Guarda el carrito y actualiza items$ y count$ */
  private saveCart(items: Producto[]): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.storageKey, JSON.stringify(items));
    this.items$.next(items);
    this.count$.next(items.reduce((sum, p) => sum + (p.cantidad || 1), 0));
  }

  /** Devuelve el arreglo actual de productos */
  getItems(): Producto[] {
    return this.items$.value;
  }

  /**
   * Agrega un producto al carrito
   * Si el producto YA existe con las MISMAS observaciones, aumenta la cantidad
   * Si el producto existe pero con DIFERENTES observaciones, se agrega como item separado
   */
  addToCart(product: Producto, observaciones?: string): void {
    const items = [...this.items$.value];

    // Buscar producto con mismo ID y mismas observaciones
    const idx = items.findIndex(
      (p) =>
        p.productoId === product.productoId && (p.observaciones || '') === (observaciones || ''),
    );

    if (idx > -1) {
      // Producto existente con mismas observaciones: aumentar cantidad
      items[idx].cantidad = (items[idx].cantidad || 1) + 1;
    } else {
      // Producto nuevo o con diferentes observaciones
      const nueva: Producto = {
        ...product,
        cantidad: 1,
        observaciones: observaciones || undefined,
      };
      items.push(nueva);
    }
    this.saveCart(items);
  }

  /**
   * Cambia la cantidad de un producto específico; si llega a 0 lo elimina
   * @param productId ID del producto
   * @param delta Cambio en la cantidad (+1 o -1)
   * @param observaciones Observaciones específicas del producto (para identificar la instancia exacta)
   */
  changeQty(productId: number, delta: number, observaciones?: string): void {
    const items = this.items$.value
      .map((p) => {
        // Coincide si tiene el mismo ID y las mismas observaciones
        if (p.productoId === productId && (p.observaciones || '') === (observaciones || '')) {
          return { ...p, cantidad: (p.cantidad || 1) + delta };
        }
        return p;
      })
      .filter((p) => (p.cantidad || 0) > 0);
    this.saveCart(items);
  }

  /**
   * Elimina por completo una instancia específica de un producto del carrito
   * @param productId ID del producto
   * @param observaciones Observaciones específicas del producto (para identificar la instancia exacta)
   */
  remove(productId: number, observaciones?: string): void {
    const items = this.items$.value.filter(
      (p) => !(p.productoId === productId && (p.observaciones || '') === (observaciones || '')),
    );
    this.saveCart(items);
  }

  /** Limpia manualmente todo el carrito y la marca de limpieza diaria */
  clearCart(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.lastClearKey);
    this.items$.next([]);
    this.count$.next(0);
  }
}
