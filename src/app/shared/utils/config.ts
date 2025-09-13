import { environment } from '../../../environments/environment';

type EnvironmentWithGoogleMaps = typeof environment & { googleMapsApiKey?: string };

export function getGoogleMapsApiKey(): string | undefined {
  const env = environment as EnvironmentWithGoogleMaps;
  const fromEnv = env.googleMapsApiKey;
  // Permite inyectar por global en tiempo de ejecución, si se define
  const fromGlobal = (globalThis as Record<string, unknown>)['__GMAPS_API_KEY__'];
  const value = (fromEnv ?? (typeof fromGlobal === 'string' ? fromGlobal : undefined))?.trim();
  return value ? value : undefined;
}
