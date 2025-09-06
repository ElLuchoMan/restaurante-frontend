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
- Netlify Angular Runtime 2.4.0

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
├── jest.config.ts           # Jest configuration
├── netlify.toml             # Netlify deployment config
└── tsconfig*.json           # TypeScript configs
```

## Requisitos
- Node.js 20 LTS recomendado (18+ compatible)
- npm 9+ recomendado

## Installation
1. `npm install`
2. Archivos de configuración en la raíz (`angular.json`, `jest.config.ts`, `netlify.toml`, `.stylelintrc.json`, etc.).

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
- `npm run e2e` – pruebas end‑to‑end con Cypress
- `npm run cypress:open` / `npm run cypress:run` – UI/CLI de Cypress
- `npm run lint` – análisis estático (ESLint)
- `npm run lint:scss` – lint de estilos (Stylelint)
- `npm run format` / `npm run format:check` – formateo con Prettier

### Cobertura (Coverage)
- Umbral global configurado en `jest.config.ts`:
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
| `npm run e2e` | Ejecuta E2E con Cypress (según config del proyecto) |
| `npm run cypress:open` | Abre la UI de Cypress |
| `npm run cypress:run` | Corre Cypress en modo headless |
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

## Production
- `npm run build` – generate production build in `dist/`
- `npm run serve:ssr:restaurante-frontend` – run the server-side rendered build

## How to make a PR
1. Create a feature branch from `develop`.
2. Commit your changes and push.
3. Open a draft PR at [https://github.com/ElLuchoMan/restaurante-frontend/compare](https://github.com/ElLuchoMan/restaurante-frontend/compare).
4. Mark the PR as **Ready for review** once complete.

## Convenciones
- Commits: Conventional Commits (por ejemplo, `feat/ui: ...`, `fix/ui: ...`, `chore/deps: ...`).
- Commitlint: configuración en `commitlint.config.cjs` para validar mensajes.
- Estilo de código: ESLint + Prettier; imports ordenados; SCSS con Stylelint.

## Mocks y pruebas
- Mocks reutilizables en `src/app/shared/mocks`. Úsalos en tests para evitar mocks ad‑hoc.
- Utiliza `HttpTestingController` para pruebas de servicios HTTP.

## API Documentation
See [docs/pedidos-contract.md](docs/pedidos-contract.md) for the current contract of the pedidos endpoint, including the `delivery` boolean field.

## Additional Documentation
Placeholder

## License
© 2024 ElLuchoman
