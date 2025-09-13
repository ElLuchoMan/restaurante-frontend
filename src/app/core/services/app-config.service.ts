import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

export interface RuntimeAppConfig {
  apiBase: string;
  googleMapsApiKey?: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private config: RuntimeAppConfig = { apiBase: '/restaurante/v1' };
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async load(): Promise<void> {
    if (!this.isBrowser) {
      // En SSR/Prerender no hacemos llamadas fetch relativas
      return;
    }
    try {
      // 1) Intentar override local (no versionado)
      const local = await fetch('/app-config.local.json', { cache: 'no-store' });
      if (local.ok) {
        const json = (await local.json()) as Partial<RuntimeAppConfig>;
        this.config = { ...this.config, ...json } as RuntimeAppConfig;
      }
      // 2) Config global por entorno
      const response = await fetch('/app-config.json', { cache: 'no-store' });
      if (response.ok) {
        const json = (await response.json()) as Partial<RuntimeAppConfig>;
        this.config = { ...this.config, ...json } as RuntimeAppConfig;
      }
    } catch {
      // Mantener valores por defecto
    }

    // Exponer API key de Maps para util existente, si está configurada
    if (this.config.googleMapsApiKey) {
      (globalThis as Record<string, unknown>)['__GMAPS_API_KEY__'] = this.config.googleMapsApiKey;
    }
  }

  get apiBase(): string {
    return this.config.apiBase;
  }

  get googleMapsApiKey(): string | undefined {
    return this.config.googleMapsApiKey;
  }
}
