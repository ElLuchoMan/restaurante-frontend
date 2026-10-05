## Ejemplos para ejecutar en WebView (Android/iOS)

Esta carpeta contiene ejemplos mínimos para permitir llamadas al backend local (`http://localhost:8080`) desde un contenedor WebView mientras pruebas la app en producción (Netlify) o en dev.

- Android: habilita tráfico en claro (cleartext) y permite dominios `localhost`, `127.0.0.1` y `10.0.2.2` vía `networkSecurityConfig`.
- iOS: agrega excepciones ATS para esos dominios dentro de `WKWebView`.

### Android (WebView)

1) `AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <application
    android:usesCleartextTraffic="true"
    android:networkSecurityConfig="@xml/network_security_config">
    <!-- ... -->
  </application>
</manifest>
```

2) `res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

3) Enlaces externos fuera del WebView (opcional recomendado)

```kotlin
webView.webViewClient = object : WebViewClient() {
  override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
    val url = request?.url?.toString() ?: return false
    val isExternal = url.startsWith("http") && !url.contains("tudominio.com")
    return if (isExternal) {
      startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
      true
    } else {
      false
    }
  }
}
```

### iOS (WKWebView)

1) `Info.plist` (ATS exceptions)

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoadsInWebContent</key><true/>
  <key>NSExceptionDomains</key>
  <dict>
    <key>localhost</key>
    <dict>
      <key>NSIncludesSubdomains</key><true/>
      <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key><true/>
    </dict>
    <key>127.0.0.1</key>
    <dict>
      <key>NSIncludesSubdomains</key><true/>
      <key>NSTemporaryExceptionAllowsInsecureHTTPLoads</key><true/>
    </dict>
  </dict>
</dict>
```

2) Enlaces externos fuera del WKWebView (opcional recomendado)

```swift
func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
    if let url = navigationAction.request.url,
       ["http", "https"].contains(url.scheme?.lowercased() ?? ""),
       !url.host!.contains("tudominio.com") {
        UIApplication.shared.open(url)
        decisionHandler(.cancel)
        return
    }
    decisionHandler(.allow)
}
```

### Notas de seguridad y CSP

- En `netlify.toml` se añadió `connect-src 'self' https: http://localhost:8080` para permitir llamadas al backend local durante pruebas.
- En producción se retiraron temporalmente `upgrade-insecure-requests` y `block-all-mixed-content` mientras se usa backend HTTP local.
- Cuando migres el backend a HTTPS, vuelve a activar esas directivas para máxima seguridad.

### Estilos/UX (ya aplicados en el proyecto)

- Safe areas con `env(safe-area-inset-*)` en `:root` y paddings en `html, body`.
- `overscroll-behavior: none` para evitar el "rubber-band" en iOS dentro del WebView.
- Enlaces externos con `target="_blank" rel="noopener"` para salir del WebView.
