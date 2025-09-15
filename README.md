# Restaurante Frontend

![AutoGen with AI](https://img.shields.io/badge/AutoGen%20with%20AI-%F0%9F%8C%9F-blueviolet)
[![Netlify Status](https://api.netlify.com/api/v1/badges/08900eb5-ce5b-4278-932b-037569ffd3c4/deploy-status)](https://app.netlify.com/sites/lacocinademaria/deploys)

A modular Angular web application for restaurant operations, featuring administrative, public, and client-facing modules.

## Technologies
- Angular 20.1.6
- Angular CLI 20.1.6
- TypeScript 5.8.3
- Bootstrap 5.3.7
- Jest 29.7.0
- Stylelint 16.21.1

## Project Structure
```
restaurante-frontend/
├── public/                  # Static public assets
├── src/
│   ├── app/
│   │   ├── core/            # Bootstrapping config, guards, interceptors, services
│   │   ├── modules/         # Feature modules
│   │   │   ├── admin/       # Product management screens
│   │   │   ├── auth/        # Login and registration flows
│   │   │   ├── client/      # Cart, orders, profile
│   │   │   ├── public/      # Home, reservations, catalog, 404
│   │   │   └── trabajadores/# Delivery-staff views
│   │   └── shared/          # Reusable components, models, pipes, mocks
│   ├── assets/              # Global images, third-party scripts
│   ├── environments/        # Environment configurations
│   ├── main.ts              # Browser entry point
│   ├── main.server.ts       # SSR entry point
│   ├── server.ts            # Express server for SSR
│   └── setup-jest.ts        # Jest test setup
├── angular.json             # Angular workspace config
├── jest.config.cjs          # Jest configuration
├── netlify.toml             # Netlify deployment config
└── tsconfig*.json           # TypeScript configs
```

## Requisitos
- Node.js 20 LTS recomendado (18+ compatible)
- npm 9+ recomendado

## Installation
1. `npm install`
2. Archivos de configuración en la raíz (`angular.json`, `jest.config.cjs`, `netlify.toml`, `.stylelintrc.json`, etc.).

## Development
- `npm run start` – start local dev server on http://localhost:4200
- `npm run watch` – rebuilds on file changes
- `npm run lint` / `npm run lint:scss` – code and style linting
- `npm run deps:unused` – detect unused dependencies

## Styling
Color tokens are defined once in `src/assets/_base.scss` as CSS custom properties.
Use them in components with the `var(--token)` syntax (e.g., `var(--primary)`).
Sass variables remain only for build‑time values such as breakpoints.

## Testing
- `npm test` – ejecuta unit tests con Jest y genera cobertura
- `npm run lint` – análisis estático (ESLint)
- `npm run lint:scss` – lint de estilos (Stylelint)
- `npm run format` / `npm run format:check` – formateo con Prettier

### Cobertura (Coverage)
- Umbral global configurado en `jest.config.cjs`:
  - branches: 98
  - functions: 98
  - lines: 98
  - statements: 98
- Reportes generados en `coverage/` (HTML, lcov, text-summary, json-summary).
- Para inspección rápida, abre `coverage/index.html` en el navegador.

### Reglas y exclusiones de cobertura
- El proyecto prioriza pruebas de unidades de negocio. Algunas ramas poco valiosas o no demostrables pueden excluirse con directivas Istanbul, por ejemplo:
  - `/* istanbul ignore if */`
  - `/* istanbul ignore else */`
  - `/* istanbul ignore next */`
- Usa estas directivas con moderación y justifica el motivo en un comentario adyacente.
- No se excluyen archivos completos por configuración; se prefieren exclusiones quirúrgicas en ramas específicas.

### Consejos
- Refactoriza a funciones puras cuando sea posible para facilitar el testeo.
- Evita introducir dependencias nuevas para testeo sin justificación.
- Revisa `coverage-summary.json` y `lcov.info` para encontrar huecos específicos.

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run start` | Arranca dev server en `http://localhost:4200` |
| `npm run build` | Build de producción en `dist/` |
| `npm run watch` | Build en modo watch |
| `npm test` | Ejecuta tests con cobertura |
| `npm run lint` | Lint de código (ESLint) |
| `npm run lint:scss` | Lint de estilos (Stylelint) |
| `npm run format` | Formatea archivos soportados con Prettier |
| `npm run format:check` | Verifica formato con Prettier |
| `npm run deps:unused` | Revisa dependencias no usadas |
| `npm run updates` | Sube versiones con `npm-check-updates` |
| `npm run limpieza` | Limpieza de cachés/lock y reinstalación |

## Arquitectura y guías

- Angular standalone con módulos de características en `src/app/modules` y utilidades compartidas en `src/app/shared`.
- Componentes pequeños y reutilizables; lógica en servicios; `ChangeDetectionStrategy.OnPush` cuando aplique.
- Routing por rol; lazy loading por rutas para mejorar performance.
- Estilos SCSS con tokens en `src/assets/_base.scss`.
- Seguridad: sanitizar HTML, no almacenar PII, variables por entorno, validar inputs.

## Accesibilidad y rendimiento

- Usa atributos `aria-*` y etiquetas semánticas.
- Evita layout shifts (define tamaños de imágenes, usa skeletons si aplica).
- Lazy load de features e imágenes; divide bundles.
- Preferir detección de cambios OnPush en componentes aptos.

### Imágenes de productos (menú)
- Dimensión base recomendada: 800×800 px (relación 1:1).
- Formato: WebP (calidad ~80) con fallback JPEG cuando sea necesario.
- Peso objetivo: ≤ 150 KB (ideal ≤ 100 KB).
- Variantes responsivas: genera 400, 800 y 1200 px en `srcset`.
- `sizes` sugerido: `(max-width: 600px) 50vw, (max-width: 1200px) 33vw, 300px`.
- Atributos: `loading="lazy"`, `decoding="async"`, y define `width`/`height` para evitar CLS.
- Fondo transparente (WebP/PNG) si aplica; si no, usa un fondo sólido consistente con el tema.

## Entornos

- Archivos en `src/environments/` para configuración por entorno.
- No hardcodear claves o endpoints; usa variables de entorno/Angular environments.
 - Configuración runtime adicional en `public/app-config.json` (evita rebuild al cambiar `apiBase` y claves).

### Runtime config (`app-config.json`)

Por defecto:

```json
{ "apiBase": "/restaurante/v1" }
```

En CI (deploy a Netlify) se genera con secrets `APP_API_BASE` y `GMAPS_API_KEY`.

## Production
- `npm run build` – build de producción en `dist/` (SSR habilitado y prerender por Angular)
- `npx serve dist/restaurante-frontend/browser` – servir estático local
- `netlify dev` – servir con proxy `/restaurante/v1/*` → backend local

## Ejecutar en WebView (Android/iOS)

### Requisitos del contenedor
- Android (WebView/Chromium): si el backend corre en `http://localhost:8080`, habilita tráfico cleartext:
  - `AndroidManifest.xml`: `<application android:usesCleartextTraffic="true" ...>`
  - Opcional: `networkSecurityConfig` permitiendo `localhost`.
- iOS (WKWebView): añade excepciones ATS para `http://localhost` en `Info.plist` (`NSAppTransportSecurity` → `NSAllowsArbitraryLoadsInWebContent` o dominio específico).

### Cabeceras/CSP en Netlify
- `netlify.toml` ya incluye:
  - `connect-src` con `http://localhost:8080` para permitir llamadas desde WebView.
  - Directivas de producción sin `upgrade-insecure-requests` ni `block-all-mixed-content` mientras se pruebe contra HTTP local.
- Ajusta `frame-src` si embebes pasarelas de pago/mapas adicionales.

### Enlaces externos
- Abrir externos fuera del WebView: se añadieron `target="_blank" rel="noopener"` en cabecera y pie.
- En el contenedor nativo, intercepta `window.open`/navegación y abre en el navegador del sistema si es necesario.

### Estilos específicos para WebView
- Safe areas: definido `:root` con `env(safe-area-inset-*)` y aplicado en `html, body`.
- Rebote iOS: `overscroll-behavior: none` en `html, body` para evitar rubber-band.

### Service Worker
- Algunas versiones de WebView tienen soporte limitado. Si observas issues de caché, sirve una variante sin SW o desactívalo según `user-agent` desde el contenedor.

### Comandos útiles
- Build prod: `npm run build`
- Servir SSR local: `npm run serve:ssr:restaurante-frontend`
- Netlify local con proxy: `netlify dev`

## How to make a PR
1. Create a feature branch from `develop`.
2. Commit your changes and push.
3. Open a draft PR at [https://github.com/ElLuchoMan/restaurante-frontend/compare](https://github.com/ElLuchoMan/restaurante-frontend/compare).
4. Mark the PR as **Ready for review** once complete.

## Convenciones
- Commits: Conventional Commits (por ejemplo, `feat/ui: ...`, `fix/ui: ...`, `chore/deps: ...`).
- Estilo de código: ESLint + Prettier; imports ordenados; SCSS con Stylelint.

## CI/CD

- CI (`.github/workflows/ci.yml`): lint + test + build en PR y `master`.
- Deploy (`.github/workflows/deploy.yml`): solo `master` → Netlify (secrets `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`, `APP_API_BASE`, opcional `GMAPS_API_KEY`).

## Mocks y pruebas
- Mocks reutilizables en `src/app/shared/mocks`. Úsalos en tests para evitar mocks ad‑hoc.
- Utiliza `HttpTestingController` para pruebas de servicios HTTP.

## API Documentation
See [docs/pedidos-contract.md](docs/pedidos-contract.md) for the current contract of the pedidos endpoint, including the `delivery` boolean field.

## Additional Documentation
Placeholder

## License
© 2024 ElLuchoman
