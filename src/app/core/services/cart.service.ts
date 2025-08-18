import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Producto } from '../../shared/models/producto.model';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly storageKey = 'carrito';
  private readonly lastClearKey = `${this.storageKey}-lastClear`;
  private isBrowser: boolean;

  public count$ = new BehaviorSubject<number>(0);
  public items$ = new BehaviorSubject<Producto[]>([]);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private logger: LoggingService
  ) {
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
    let arr: Producto[] = [];
    if (raw) {
      try {
        arr = JSON.parse(raw);
      } catch (error) {
        localStorage.removeItem(this.storageKey);
        this.logger.error('Error parsing cart data', error);
      }
    }
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

  /** Agrega un producto (aumenta cantidad si ya existe) */
  addToCart(product: Producto): void {
    const items = [...this.items$.value];
    const idx = items.findIndex(p => p.productoId === product.productoId);
    if (idx > -1) {
      items[idx].cantidad = (items[idx].cantidad || 1) + 1;
    } else {
      const nueva: Producto = { ...product, cantidad: 1 };
      items.push(nueva);
    }
    this.saveCart(items);
  }

  /** Cambia la cantidad de un producto; si llega a 0 lo elimina */
  changeQty(productId: number, delta: number): void {
    const items = this.items$.value
      .map(p => {
        if (p.productoId === productId) {
          return { ...p, cantidad: (p.cantidad || 1) + delta };
        }
        return p;
      })
      .filter(p => (p.cantidad || 0) > 0);
    this.saveCart(items);
  }

  /** Elimina por completo un producto del carrito */
  remove(productId: number): void {
    const items = this.items$.value.filter(p => p.productoId !== productId);
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
