import { environment } from '../../../environments/environment';
import { getGoogleMapsApiKey } from './config';

describe('getGoogleMapsApiKey', () => {
  const env = environment as unknown as { googleMapsApiKey?: string };
  const g = globalThis as Record<string, unknown>;
  let originalEnvKey: string | undefined;
  let hadEnvKey: boolean;
  let originalGlobal: unknown;

  beforeEach(() => {
    hadEnvKey = 'googleMapsApiKey' in env;
    originalEnvKey = env.googleMapsApiKey;
    originalGlobal = g['__GMAPS_API_KEY__'];
    delete env.googleMapsApiKey;
    delete g['__GMAPS_API_KEY__'];
  });

  afterEach(() => {
    if (hadEnvKey) env.googleMapsApiKey = originalEnvKey;
    else delete env.googleMapsApiKey;
    if (originalGlobal === undefined) delete g['__GMAPS_API_KEY__'];
    else g['__GMAPS_API_KEY__'] = originalGlobal;
  });

  it('devuelve undefined si no hay clave en environment ni global', () => {
    expect(getGoogleMapsApiKey()).toBeUndefined();
  });

  it('usa la clave de environment (recortada)', () => {
    env.googleMapsApiKey = '  ENV_KEY  ';
    expect(getGoogleMapsApiKey()).toBe('ENV_KEY');
  });

  it('prioriza environment sobre la global', () => {
    env.googleMapsApiKey = 'ENV';
    g['__GMAPS_API_KEY__'] = 'GLOBAL';
    expect(getGoogleMapsApiKey()).toBe('ENV');
  });

  it('usa la global si environment no define clave', () => {
    g['__GMAPS_API_KEY__'] = ' GLOBAL_KEY ';
    expect(getGoogleMapsApiKey()).toBe('GLOBAL_KEY');
  });

  it('ignora una global que no es string', () => {
    g['__GMAPS_API_KEY__'] = 123;
    expect(getGoogleMapsApiKey()).toBeUndefined();
  });

  it('devuelve undefined si la clave es vacía o solo espacios', () => {
    env.googleMapsApiKey = '   ';
    expect(getGoogleMapsApiKey()).toBeUndefined();
    env.googleMapsApiKey = '';
    expect(getGoogleMapsApiKey()).toBeUndefined();
  });
});
