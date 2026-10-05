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
    // 1) Override local (no versionado) y 2) config global por entorno.
    // Cada archivo se lee por separado: si uno falta, el fallback SPA (index.html con 200)
    // no debe impedir que se cargue el otro.
    await this.mergeFrom('/app-config.local.json');
    await this.mergeFrom('/app-config.json');

    // Exponer API key de Maps para util existente, si está configurada
    if (this.config.googleMapsApiKey) {
      (globalThis as Record<string, unknown>)['__GMAPS_API_KEY__'] = this.config.googleMapsApiKey;
    }
  }

  private async mergeFrom(url: string): Promise<void> {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) return;
      const json = (await response.json()) as Partial<RuntimeAppConfig>;
      this.config = { ...this.config, ...json } as RuntimeAppConfig;
    } catch {
      // Archivo ausente, HTML del fallback SPA o JSON invalido: se ignora
    }
  }

  get apiBase(): string {
    return this.config.apiBase;
  }

  get googleMapsApiKey(): string | undefined {
    return this.config.googleMapsApiKey;
  }
}
