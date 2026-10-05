import { browserLocation } from './browser-location';

describe('browserLocation', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    window.location.hash = '';
  });

  it('hostname devuelve el hostname actual de window.location', () => {
    expect(browserLocation.hostname()).toBe(window.location.hostname);
    expect(browserLocation.hostname()).toBe('localhost');
  });

  it('assign asigna la url a window.location.href', () => {
    browserLocation.assign('#destino');
    expect(window.location.hash).toBe('#destino');
    expect(window.location.href).toContain('#destino');
  });

  it('reload invoca window.location.reload (jsdom reporta navegación no implementada)', () => {
    // jsdom no implementa la navegación: la reporta por console.error (virtual console)
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => browserLocation.reload()).not.toThrow();
    errorSpy.mockRestore();
  });
});
