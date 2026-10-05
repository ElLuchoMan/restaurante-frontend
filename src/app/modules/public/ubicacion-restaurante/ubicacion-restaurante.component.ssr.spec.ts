/** @jest-environment node */
import { createFnMock } from '../../../shared/mocks/test-doubles';
import { UbicacionRestauranteComponent } from './ubicacion-restaurante.component';

describe('UbicacionRestauranteComponent (SSR, sin window)', () => {
  it('queda en plataforma web cuando window no existe', () => {
    jest.useFakeTimers();
    const sanitizer: any = { bypassSecurityTrustResourceUrl: createFnMock((u: string) => u) };
    const comp = new UbicacionRestauranteComponent(sanitizer, {} as any, {} as any, {} as any);

    expect(typeof window).toBe('undefined');
    comp.ngAfterViewInit();

    expect(comp.platform).toBe('web');
    expect(comp.isWebView).toBe(false);
    jest.advanceTimersByTime(500);
    expect(comp.mostrarInfo).toBe(true);
    jest.useRealTimers();
  });
});
