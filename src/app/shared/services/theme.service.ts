import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme$ = new BehaviorSubject<ThemeMode>('light');
  private readonly STORAGE_KEY = 'restaurant_theme';
  private readonly THEME_ATTRIBUTE = 'data-theme';

  constructor() {
    this.loadTheme();
    this.applyTheme(this.currentTheme$.value);
  }

  getCurrentTheme(): Observable<ThemeMode> {
    return this.currentTheme$.asObservable();
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme$.next(theme);
    this.applyTheme(theme);
    this.saveTheme(theme);
  }

  toggleTheme(): void {
    const current = this.currentTheme$.value;
    const newTheme = current === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  isDarkMode(): boolean {
    const theme = this.currentTheme$.value;
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return theme === 'dark';
  }

  private applyTheme(theme: ThemeMode): void {
    const root = document.documentElement;

    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute(this.THEME_ATTRIBUTE, prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute(this.THEME_ATTRIBUTE, theme);
    }

    // Aplicar clase CSS para transiciones suaves
    root.classList.add('theme-transition');
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);
  }

  private saveTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (error) {
      console.warn('No se pudo guardar el tema:', error);
    }
  }

  private loadTheme(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode;
      if (saved && ['light', 'dark', 'auto'].includes(saved)) {
        this.currentTheme$.next(saved);
      } else {
        // Detectar preferencia del sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.currentTheme$.next(prefersDark ? 'dark' : 'light');
      }
    } catch (error) {
      console.warn('No se pudo cargar el tema:', error);
      this.currentTheme$.next('light');
    }
  }
}
