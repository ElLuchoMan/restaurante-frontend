import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { createSpy } from '../../shared/mocks/test-doubles';
import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    jest.resetAllMocks();
    global.fetch = originalFetch as any;
    TestBed.resetTestingModule();
    delete (globalThis as any)['__GMAPS_API_KEY__'];
  });

  function init(platform: 'browser' | 'server' = 'browser') {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: platform }] });
    return TestBed.inject(AppConfigService);
  }

  function mockFetchSequence(responses: Array<{ ok: boolean; json?: any }>) {
    const fn: any = createSpy();
    for (const r of responses) {
      (fn as any).mockResolvedValueOnce({ ok: r.ok, json: async () => r.json } as any);
    }
    global.fetch = fn as any;
    return fn;
  }

  it('no hace nada en SSR y mantiene valores por defecto', async () => {
    const svc = init('server');
    const fetchSpy: any = createSpy();
    global.fetch = fetchSpy;
    await svc.load();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(svc.apiBase).toBe('/restaurante/v1');
    expect(svc.googleMapsApiKey).toBeUndefined();
  });

  it('fusiona config local y global, respetando valores por defecto y setea API key', async () => {
    const svc = init('browser');
    const fetchSpy = mockFetchSequence([
      { ok: true, json: { apiBase: '/api-local', googleMapsApiKey: 'GMAPS_KEY' } },
      { ok: true, json: { apiBase: '/api-global' } },
    ]);

    await svc.load();

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    // El último override define apiBase
    expect(svc.apiBase).toBe('/api-global');
    // La key queda de la primera respuesta (local)
    expect(svc.googleMapsApiKey).toBe('GMAPS_KEY');
    expect((globalThis as any)['__GMAPS_API_KEY__']).toBe('GMAPS_KEY');
  });

  it('tolera fallos en fetch y conserva defaults', async () => {
    const svc = init('browser');
    // 1) local falla, 2) global no ok (llamamos manualmente ambas)
    const fetchSpy: any = createSpy();
    (global as any).fetch = fetchSpy;
    (fetchSpy as any).mockRejectedValueOnce(new Error('network'));
    (fetchSpy as any).mockResolvedValueOnce({ ok: false } as any);

    await svc.load();

    // Puede intentar la segunda aun si la primera falla
    expect(fetchSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(svc.apiBase).toBe('/restaurante/v1');
    expect(svc.googleMapsApiKey).toBeUndefined();
  });
});
