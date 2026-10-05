# Reglas del proyecto (restaurante-frontend)

## Tests y cobertura
- **Todo cambio debe incluir sus tests** en el mismo PR (código nuevo o modificado → tests nuevos o actualizados).
- El umbral global de Jest (`jest.config.cjs`) es **100 %** en statements, branches, functions y lines; por debajo, `npm test` y el CI fallan. Si 100 % deja de ser sostenible, el mínimo aceptado es 99 %, pero siempre se documentan y entregan tests.
- Guardas de SSR (`typeof window`/`document`): specs `*.ssr.spec.ts` con `/** @jest-environment node */`.
- Código inalcanzable: eliminarlo; no usar `istanbul ignore` salvo último recurso y justificado.
- En specs no se usa `jest.fn` directo: usar helpers de `src/app/shared/mocks/test-doubles.ts` (p. ej. `createFnMock`).
- Verifica antes de subir: `npm test`, `npm run lint`, `npx stylelint "src/**/*.scss"`.

## Estilos
- Sin degradados (`linear/radial/conic-gradient`).
- Los colores viven solo en `src/assets/_variables.scss` (variables `$nombre` y custom properties `var(--nombre)`); no escribir hex/rgb/rgba en otros archivos (stylelint lo bloquea).

## Flujo
- Trabajar en `develop`; `master` solo vía PR (un push a `master` despliega a producción en Netlify).
