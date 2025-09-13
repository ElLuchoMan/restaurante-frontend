import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PreloadAllModules,
  provideRouter,
  withInMemoryScrolling,
  withPreloading,
  withRouterConfig,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideToastr } from 'ngx-toastr';

import { APP_INITIALIZER, ErrorHandler } from '@angular/core';
import { routes } from './app.routes';
import { apiBaseInterceptor } from './interceptors/api-base.interceptor';
import { authInterceptor } from './interceptors/auth.interceptor';
import { correlationInterceptor } from './interceptors/correlation.interceptor';
import { retryInterceptor } from './interceptors/retry.interceptor';
import { telemetryInterceptor } from './interceptors/telemetry.interceptor';
import { AppConfigService } from './services/app-config.service';
import { GlobalErrorHandler } from './services/global-error.handler';

function loadAppConfig(cfg: AppConfigService): () => Promise<void> {
  return () => cfg.load();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      withRouterConfig({
        onSameUrlNavigation: 'ignore',
        paramsInheritanceStrategy: 'always',
      }),
    ),
    ...(!isDevMode() ? [provideClientHydration()] : []),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        apiBaseInterceptor,
        retryInterceptor,
        authInterceptor,
        correlationInterceptor,
        telemetryInterceptor,
      ]),
    ),
    provideAnimations(),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
      progressAnimation: 'decreasing',
      progressBar: true,
      enableHtml: true,
      disableTimeOut: false,
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    { provide: APP_INITIALIZER, useFactory: loadAppConfig, deps: [AppConfigService], multi: true },
  ],
};
