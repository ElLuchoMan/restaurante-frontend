# Contribuir

## Flujo
- Rama base: `develop`
- Crea feature branch desde `develop`
- Commits: Conventional Commits (ej. `feat/ui: ...`)
- Pull Request con lint/tests pasando

## Requisitos locales
- Node 20 LTS
- npm 9+

## Checks locales
```bash
npm ci
npm run lint && npm run lint:scss
npm test -- --ci
npm run build
```

## Estilo
- ESLint + Prettier, imports ordenados
- SCSS con Stylelint
- Angular: componentes pequeños, OnPush cuando aplique

## Pruebas
- Jest + Testing Library
- Reutiliza mocks de `src/app/shared/mocks`
- Usa `HttpTestingController` para servicios HTTP
