import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';

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
  const cfg = inject(AppConfigService);
  const configuredBase = normalizeBase(cfg.apiBase || API_BASE_SEGMENT);

  let newUrl = req.url;

  // Caso 1: URL absoluta con host (http/https) que contiene el segmento base
  if (/^https?:\/\//i.test(req.url) && req.url.includes(API_BASE_SEGMENT)) {
    const [, tail = ''] = req.url.split(API_BASE_SEGMENT);
    newUrl = `${configuredBase}${tail}`;
  }

  // Caso 2: URL que comienza con el segmento base relativo
  if (!/^https?:\/\//i.test(req.url) && req.url.startsWith(API_BASE_SEGMENT)) {
    const tail = req.url.slice(API_BASE_SEGMENT.length);
    newUrl = `${configuredBase}${tail}`;
  }

  // Si no coincide ningún caso, dejar pasar sin cambios
  if (newUrl !== req.url) {
    return next(req.clone({ url: newUrl }));
  }

  return next(req);
};
