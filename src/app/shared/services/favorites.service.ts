import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private favorites$ = new BehaviorSubject<Set<number>>(new Set());
  private readonly STORAGE_KEY = 'restaurant_favorites';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadFavorites();
    }
  }

  getFavorites(): Observable<Set<number>> {
    return this.favorites$.asObservable();
  }

  isFavorite(productId: number): boolean {
    return this.favorites$.value.has(productId);
  }

  toggleFavorite(product: Producto): boolean {
    if (!product.productoId) return false;

    const currentFavorites = this.favorites$.value;
    const isCurrentlyFavorite = currentFavorites.has(product.productoId!);

    if (isCurrentlyFavorite) {
      this.removeFavorite(product.productoId!);
      return false;
    } else {
      this.addFavorite(product.productoId!);
      return true;
    }
  }

  addFavorite(productId: number): void {
    const currentFavorites = this.favorites$.value;
    const newFavorites = new Set(currentFavorites);
    newFavorites.add(productId);
    this.favorites$.next(newFavorites);
    this.saveFavorites(newFavorites);
  }

  removeFavorite(productId: number): void {
    const currentFavorites = this.favorites$.value;
    const newFavorites = new Set(currentFavorites);
    newFavorites.delete(productId);
    this.favorites$.next(newFavorites);
    this.saveFavorites(newFavorites);
  }

  getFavoriteProducts(allProducts: Producto[]): Producto[] {
    const favoriteIds = this.favorites$.value;
    return allProducts.filter(
      (product) => product.productoId && favoriteIds.has(product.productoId!),
    );
  }

  clearFavorites(): void {
    this.favorites$.next(new Set());
    this.saveFavorites(new Set());
  }

  private saveFavorites(favorites: Set<number>): void {
    if (!this.isBrowser) return;

    try {
      const favoritesArray = Array.from(favorites);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favoritesArray));
    } catch (error) {
      console.warn('No se pudo guardar los favoritos:', error);
    }
  }

  private loadFavorites(): void {
    if (!this.isBrowser) return;

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const favoritesArray = JSON.parse(saved);
        const favoritesSet = new Set<number>(
          favoritesArray.filter((id: any) => typeof id === 'number'),
        );
        this.favorites$.next(favoritesSet);
      }
    } catch (error) {
      console.warn('No se pudo cargar los favoritos:', error);
    }
  }
}
