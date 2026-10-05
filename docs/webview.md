## Guía: Ejecutar la app en WebView (Android/iOS)

Esta guía explica cómo envolver la app Angular dentro de un contenedor nativo (WebView/WKWebView) y qué ajustes aplicar mientras tu backend sigue en `http://localhost:8080`.

### Opción 1 — Capacitor (recomendada)

Capacitor permite crear proyectos Android/iOS que renderizan tu app web.

1) Instalar y configurar

```bash
npm i -D @capacitor/cli @capacitor/core
npx cap init cocina.maria.app "El Fogón de María"
```

2) Elegir origen de la web en el contenedor

- Opción A (recomendada mientras el backend es HTTP): empaquetar assets locales
  - Construye Angular y apunta `webDir` a `dist/restaurante-frontend/browser`.
  - Evita mixed content, simplifica permisos.
  - Ejemplo `capacitor.config.ts`:
    ```ts
    import { CapacitorConfig } from '@capacitor/cli';

    const config: CapacitorConfig = {
      appId: 'cocina.maria.app',
      appName: 'El Fogón de María',
      webDir: 'dist/restaurante-frontend/browser'
    };
    export default config;
    ```

- Opción B (cuando backend sea HTTPS): servir desde Netlify
  - Úsala si toda la cadena es HTTPS (evitas mixed content). Si tu backend es HTTP, Android WebView bloqueará contenido mixto salvo que habilites mixed content en el WebView nativo.
  - Ejemplo `capacitor.config.ts`:
    ```ts
    import { CapacitorConfig } from '@capacitor/cli';

    const config: CapacitorConfig = {
      appId: 'cocina.maria.app',
      appName: 'El Fogón de María',
      webDir: 'dist/restaurante-frontend/browser',
      server: {
        url: 'https://TU-SITIO.netlify.app',
        cleartext: true // permite HTTP en llamadas salientes si el WebView lo permite
      }
    };
    export default config;
    ```

3) Construir y añadir plataformas

```bash
npm run build
npx cap add android
npx cap add ios
npx cap copy
npx cap open android
npx cap open ios
```

4) Ajustes por plataforma (mientras el backend es HTTP)

- Android: habilitar cleartext y `networkSecurityConfig` (ejemplos listos):
  - Ver `docs/webview-examples/android/AndroidManifest.xml`
  - Ver `docs/webview-examples/android/network_security_config.xml`
  - Si usas `server.url` (HTTPS) y backend HTTP, habilita Mixed Content en el WebView nativo (configuración a nivel nativo en `WebSettings`). Con assets locales (Opción A), no suele ser necesario.

- iOS: excepciones ATS para `localhost`/`127.0.0.1`:
  - Ver `docs/webview-examples/ios/Info.plist`

5) Enlaces externos

- Ya están con `target="_blank" rel="noopener"` en la app.
- Opcional en nativo: intercepta y abre enlaces externos en el navegador del sistema.
  - Ejemplos en `docs/webview-examples/README.md` (Android WebViewClient y WKNavigationAction).

6) Safe‑areas y overscroll

- Aplicados en estilos globales: `:root` con `env(safe-area-inset-*)` y `overscroll-behavior: none`.

7) Service Worker y cache

- WebViews antiguos pueden comportarse distinto. Si observas problemas de cache, considera desactivar SW para el contenedor o servir una variante sin SW.

### Opción 2 — Shell nativo “a mano”

Crear un proyecto Android/iOS con un `WebView/WKWebView` que apunte a tu sitio de Netlify o a assets locales.

- Aplica los mismos ajustes: cleartext (Android), ATS (iOS), interceptar enlaces externos, back button en Android, etc.
- Útil si ya tienes una app nativa o necesitas control total.

### Opción 3 — TWA para Android (más adelante)

Trusted Web Activity integra tu PWA en Play Store. Requisitos: PWA 100% HTTPS y validación de dominio (assetlinks). No apto si el backend permanece en HTTP.

### Consideraciones de seguridad/CSP ya incorporadas

- `netlify.toml` incorpora `connect-src` con `http://localhost:8080` y se quitaron temporalmente `upgrade-insecure-requests` y `block-all-mixed-content` en producción para pruebas.
- Cuando migres el backend a HTTPS, vuelve a activar dichas directivas.

### Comandos útiles

```bash
# Build Angular (SSR y prerender habilitados en prod)
npm run build

# Capacitor: sincronizar cambios web → nativo
npx cap copy
npx cap sync

# Abrir proyectos nativos
npx cap open android
npx cap open ios
```

### Checklist de validación en dispositivo

- Navegación, login, carrito y reservas funcionan dentro del WebView.
- Llamadas a `http://localhost:8080` responden (CORS y CSP correctos).
- Enlaces externos abren fuera del WebView.
- Safe‑areas correctas y sin “rebote” en iOS.
- Offline: la vista `/offline` responde si el WebView soporta Service Worker.
