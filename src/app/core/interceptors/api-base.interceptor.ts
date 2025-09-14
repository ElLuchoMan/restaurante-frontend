import { isPlatformBrowser } from '@angular/common';
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

import { AppConfigService } from '../services/app-config.service';

const API_BASE_SEGMENT = '/restaurante/v1';

function normalizeBase(value: string): string {
  // remove trailing slash
  return value.replace(/\/+$/, '');
}

export const apiBaseInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  // Evitar reescritura de URLs en SSR/Prerender
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    // Log mínimo para detectar origen si vuelve a fallar durante prerender
    try {
      const urlType = typeof (req as unknown as { url?: unknown }).url;
      console.warn('api-base: SSR request url type', urlType);
    } catch {}
    return next(req);
  }
  const cfg = inject(AppConfigService);
  const configuredBase = normalizeBase(cfg.apiBase || API_BASE_SEGMENT);

  let rawUrl: string;
  try {
    const candidate = (req as unknown as { url?: unknown }).url;
    rawUrl = typeof candidate === 'string' ? candidate : String(candidate ?? req.url);
  } catch (e) {
    console.warn('api-base: url not readable', e);
    return next(req);
  }

  let newUrl = rawUrl;

  // Caso 1: URL absoluta con host (http/https) que contiene el segmento base
  if (/^https?:\/\//i.test(rawUrl) && rawUrl.indexOf(API_BASE_SEGMENT) !== -1) {
    const [, tail = ''] = rawUrl.split(API_BASE_SEGMENT);
    newUrl = `${configuredBase}${tail}`;
  }

  // Caso 2: URL que comienza con el segmento base relativo
  if (
    !/^https?:\/\//i.test(rawUrl) &&
    rawUrl.slice(0, API_BASE_SEGMENT.length) === API_BASE_SEGMENT
  ) {
    const tail = rawUrl.slice(API_BASE_SEGMENT.length);
    newUrl = `${configuredBase}${tail}`;
  }

  // Si no coincide ningún caso, dejar pasar sin cambios
  if (newUrl !== rawUrl) {
    return next(req.clone({ url: newUrl }));
  }

  return next(req);
};
