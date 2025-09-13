import { Injectable } from '@angular/core';

export interface RuntimeAppConfig {
  apiBase: string;
  googleMapsApiKey?: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private config: RuntimeAppConfig = { apiBase: '/restaurante/v1' };

  async load(): Promise<void> {
    try {
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
