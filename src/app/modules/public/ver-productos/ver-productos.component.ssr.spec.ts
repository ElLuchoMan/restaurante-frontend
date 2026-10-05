/** @jest-environment node */
import { VerProductosComponent } from './ver-productos.component';

describe('VerProductosComponent (SSR, sin window)', () => {
  let component: VerProductosComponent;

  beforeEach(() => {
    // El constructor accede a `window`, por lo que se crea la instancia sin invocarlo
    // y se ejercitan directamente los métodos con guarda SSR.
    component = Object.create(VerProductosComponent.prototype) as VerProductosComponent;
    component.isWebView = false;
    component.showScrollToTop = false;
  });

  it('entorno node no define window ni navigator', () => {
    expect(typeof window).toBe('undefined');
  });

  it('scrollToTop no hace nada sin window', () => {
    expect(() => (component as any).scrollToTop()).not.toThrow();
  });

  it('detectWebView no modifica isWebView sin window', () => {
    (component as any).detectWebView();
    expect(component.isWebView).toBe(false);
  });

  it('setupScrollListener no hace nada sin window', () => {
    expect(() => (component as any).setupScrollListener()).not.toThrow();
    expect(component.showScrollToTop).toBe(false);
  });
});
