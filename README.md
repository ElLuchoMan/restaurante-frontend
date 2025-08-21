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

## Installation
1. `npm install`
2. Configuration files are located at the repository root (`angular.json`, `jest.config.ts`, `netlify.toml`, `.stylelintrc.json`, etc.).

## Development
- `npm run start` – start local dev server on http://localhost:4200
- `npm run watch` – rebuilds on file changes
- `npm run lint` / `npm run lint:scss` – code and style linting

## Styling
Color tokens are defined once in `src/assets/_base.scss` as CSS custom properties.
Use them in components with the `var(--token)` syntax (e.g., `var(--primary)`).
Sass variables remain only for build‑time values such as breakpoints.

## Testing
- `npm test` – run Jest unit tests with coverage
- `npm run e2e` – execute Angular end-to-end tests
- `npm run lint` – static analysis

## Production
- `npm run build` – generate production build in `dist/`
- `npm run serve:ssr:restaurante-frontend` – run the server-side rendered build

## How to make a PR
1. Create a feature branch from `develop`.
2. Commit your changes and push.
3. Open a draft PR at [https://github.com/ElLuchoMan/restaurante-frontend/compare](https://github.com/ORG/REPO/compare).
4. Mark the PR as **Ready for review** once complete.

## API Documentation
See [docs/pedidos-contract.md](docs/pedidos-contract.md) for the current contract of the pedidos endpoint, including the `delivery` boolean field.

## Additional Documentation
Placeholder

## License
© 2024 ElLuchoman
