# Política de Seguridad

## Versiones Soportadas

Las siguientes versiones de **Restaurante Frontend (El Fogón de María)** están recibiendo actualizaciones de seguridad:

| Versión | Estado | Actualizaciones de Seguridad |
| ------- | ------ | ---------------------------- |
| develop | 🟢 Activa | ✅ Actualizaciones continuas |
| master  | 🟢 Activa | ✅ Actualizaciones de producción |

> **Nota**: El proyecto se encuentra en fase de desarrollo activo. La versión en `master` representa el código en producción y recibe parches de seguridad prioritarios. La rama `develop` contiene las últimas características y correcciones.

## Reportar una Vulnerabilidad

La seguridad de nuestros usuarios es una prioridad. Si descubres una vulnerabilidad de seguridad, por favor ayúdanos siguiendo estos pasos:

### 🔴 Vulnerabilidades Críticas

Para vulnerabilidades **críticas** que podrían comprometer datos de usuarios, sistemas o disponibilidad:

1. **NO** abras un issue público
2. Contacta directamente al mantenedor del proyecto: [@ElLuchoMan](https://github.com/ElLuchoMan)
3. Proporciona una descripción detallada:
   - Naturaleza de la vulnerabilidad
   - Pasos para reproducirla
   - Impacto potencial
   - Versión/commit afectado
   - Prueba de concepto (si es posible)

### 🟡 Vulnerabilidades Menores

Para vulnerabilidades de **menor impacto** (problemas de configuración, dependencias desactualizadas, etc.):

1. Abre un [Issue en GitHub](https://github.com/ElLuchoMan/restaurante-frontend/issues/new) con la etiqueta `security`
2. Incluye toda la información relevante
3. Si tienes una solución propuesta, envía un Pull Request

### 📋 Proceso de Respuesta

Una vez reportada una vulnerabilidad:

| Plazo | Acción |
|-------|--------|
| **24-48 horas** | Confirmación de recepción y evaluación inicial |
| **3-5 días** | Evaluación completa y clasificación de severidad |
| **7-14 días** | Desarrollo y prueba de parche (según criticidad) |
| **Inmediato** | Despliegue de parche crítico en producción |
| **Post-parche** | Notificación pública y actualización de changelog |

## Medidas de Seguridad Implementadas

### 🔐 Autenticación y Autorización

- **JWT (JSON Web Tokens)** para autenticación
- Guards de Angular para protección de rutas por rol
- Interceptores HTTP para gestión automática de tokens
- Expiración y renovación automática de sesiones
- Separación de roles: Admin, Cliente, Trabajador

### 🛡️ Protección de Datos

- **Sanitización de HTML** con `DomSanitizer` de Angular
- **No almacenamiento de PII** (Información Personal Identificable) en logs
- Validación estricta de inputs de formularios (Angular Forms)
- TypeScript strict mode habilitado
- Sin datos sensibles en localStorage/sessionStorage sin cifrado

### 🌐 Seguridad del Navegador

Cabeceras de seguridad configuradas en `netlify.toml`:

```
Content-Security-Policy (CSP)
├── default-src 'self'
├── script-src limitado
├── style-src con CSP nonces
├── connect-src definido (API + localhost para dev)
└── frame-ancestors 'none'

HTTP Strict Transport Security (HSTS)
├── max-age: 31536000 (1 año)
└── includeSubDomains

X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: restrictiva
```

### 📦 Gestión de Dependencias

#### Auditoría Automática

```bash
# Auditoría manual de seguridad
npm audit

# Auditoría con el script personalizado
npm run security:audit

# Corrección automática de vulnerabilidades
npm audit fix
```

#### Proceso de Actualización

- Revisión semanal de dependencias con `npm outdated`
- Evaluación de vulnerabilidades con `npm audit`
- Testing exhaustivo antes de actualizar dependencias críticas
- CI/CD integrado con verificación de dependencias
- Dependabot/Renovate para PRs automáticos de actualizaciones

#### Dependencias Críticas Monitoreadas

- Angular y Angular CLI (actualizaciones mayores evaluadas)
- TypeScript (compatibilidad con Angular)
- Firebase y Capacitor (seguridad móvil)
- Express (servidor SSR)
- Bootstrap y FontAwesome (CDN vs local)

### 🔑 Gestión de Secrets y Variables de Entorno

#### ❌ Prohibido en el Repositorio

- Archivos `.env`, `.env.local`, `.env.*`
- Claves API hardcodeadas en código fuente
- Tokens de autenticación
- Credenciales de bases de datos
- Certificados privados

#### ✅ Configuración Segura

**GitHub Secrets** (necesarios para CI/CD):

| Secret | Uso | Criticidad |
|--------|-----|------------|
| `CODECOV_TOKEN` | Upload de reportes de cobertura | Media |
| `NETLIFY_AUTH_TOKEN` | Deploy automático | Alta |
| `NETLIFY_SITE_ID` | Identificación del sitio | Media |
| `APP_API_BASE` | URL base de la API backend | Alta |
| `GMAPS_API_KEY` | Google Maps API (opcional) | Media |

**Variables de Entorno en Netlify**:

Configuradas en el dashboard de Netlify para runtime:
- `APP_API_BASE`: URL del backend de producción
- `GMAPS_API_KEY`: Clave de Google Maps (si aplica)

**Configuración Runtime** (`public/app-config.json`):

- Generado dinámicamente en CI/CD con secrets
- Permite cambiar configuración sin rebuild
- No commitear versiones con datos sensibles reales

### 📱 Seguridad en WebView (Capacitor)

#### Android

- **Cleartext Traffic**: Solo habilitado para `localhost` en desarrollo
- **Network Security Config**: Whitelist explícita de dominios
- **Certificados SSL**: Validación estricta en producción
- **Permisos**: Solo los estrictamente necesarios

#### iOS

- **App Transport Security (ATS)**: Configurado con excepciones mínimas
- **NSAppTransportSecurity**: Permite `localhost` solo en debug
- **Certificados**: Pinning recomendado para producción

### 🚀 Service Worker y PWA

- **Caché segura**: Solo recursos propios y CDN confiables
- **HTTPS obligatorio**: Service Worker solo funciona en HTTPS
- **Actualización controlada**: Skip waiting bajo control
- **Fallback offline**: Sin exposición de datos sensibles

### 🧪 Testing y Calidad

- **Cobertura de código**: 98% mínimo (jest.config.cjs)
- **Tests de seguridad**: Validación de sanitización y guards
- **Linting**: ESLint con reglas de seguridad
- **Smoke tests**: Validación de producción antes de deploy

## Mejores Prácticas para Desarrolladores

### ✅ Antes de Commitear

```bash
# Lint y formateo
npm run lint
npm run lint:scss
npm run format:check

# Tests con cobertura
npm test

# Auditoría de seguridad
npm audit
npm run security:audit
```

### ✅ Antes de Crear un PR

1. Revisar que no hay secrets expuestos
2. Verificar que los tests pasan al 100%
3. Validar que no introduces vulnerabilidades nuevas
4. Documentar cambios relacionados con seguridad
5. Usar Conventional Commits (ej: `fix/security: XSS en componente X`)

### ✅ Nuevas Dependencias

Antes de añadir una nueva dependencia:

1. Verificar su reputación y mantenimiento
2. Revisar issues de seguridad conocidas
3. Comprobar licencia compatible
4. Evaluar tamaño del bundle
5. Justificar necesidad en el PR

### ❌ Nunca Hacer

- Commitear archivos `.env*`
- Hardcodear URLs, claves o tokens
- Deshabilitar sanitización de HTML sin justificación
- Usar `dangerouslySetInnerHTML` o equivalentes sin revisión
- Saltarse validaciones de formularios
- Ignorar warnings de seguridad de npm audit
- Hacer `npm audit fix --force` sin revisar cambios

## Configuración Específica del Proyecto

### CORS y API

El backend debe estar configurado para aceptar peticiones solo desde:
- Dominio de producción (Netlify)
- `localhost:4200` (desarrollo local)
- IP local (desarrollo móvil)

### Firebase y Notificaciones Push

- Claves VAPID no expuestas en el código
- `firebase-messaging-sw.js` con configuración de entorno
- Tokens FCM cifrados y con expiración
- Permisos solicitados con consentimiento explícito

### WebView y Deep Links

- Validación de URLs antes de abrir
- Whitelist de dominios permitidos
- Protección contra phishing y open redirects

## Recursos Adicionales

### Documentación Relacionada

- [Configuración de Secrets en GitHub](docs/GITHUB-SECRETS-SETUP.md)
- [Testing de Web Push](docs/TESTING-WEB-PUSH.md)
- [Troubleshooting Web Push](docs/TROUBLESHOOTING-WEB-PUSH.md)
- [Configuración WebView](docs/webview.md)

### Enlaces Útiles

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Angular Security Guide](https://angular.io/guide/security)
- [Capacitor Security Best Practices](https://capacitorjs.com/docs/guides/security)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

## Divulgación Responsable

Agradecemos a los investigadores de seguridad que reportan vulnerabilidades de manera responsable. Si deseas ser mencionado públicamente tras la resolución de una vulnerabilidad, indícalo en tu reporte inicial.

## Contacto

- **Mantenedor**: [@ElLuchoMan](https://github.com/ElLuchoMan)
- **Repositorio**: [restaurante-frontend](https://github.com/ElLuchoMan/restaurante-frontend)
- **Issues**: [GitHub Issues](https://github.com/ElLuchoMan/restaurante-frontend/issues)

---

**Última actualización**: Octubre 2025
**Versión del documento**: 2.0
