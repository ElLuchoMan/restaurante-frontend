# Seguridad

## Reporte de vulnerabilidades
- Abre un Issue con etiqueta `security` o escribe al mantenedor.

## Dependencias
- Ejecuta periódicamente: `npm audit` y revisa manualmente.
- Evita introducir dependencias nuevas sin revisión.

## Secrets
- No subir `.env*` al repo.
- Usa secrets en GitHub (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`, `APP_API_BASE`, `GMAPS_API_KEY`).
- En Netlify, configura variables de entorno si procede.

## Navegador
- CSP, HSTS, Referrer-Policy y X-Frame-Options configurados en `netlify.toml`.
- Sanitiza HTML; no loguear PII.
