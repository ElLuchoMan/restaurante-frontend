# 🔧 Troubleshooting - Notificaciones Web Push

## ❌ "No se activan" / El botón se queda en "Activando..."

### Causa Principal
El **Service Worker no está compilado o registrado** correctamente en modo desarrollo.

### ✅ Solución

#### Opción 1: Reiniciar el servidor (Más rápido)

```bash
# 1. Detener el servidor actual (Ctrl+C)
# 2. Iniciar de nuevo
npm start

# 3. Recargar la página en el navegador (F5)
# 4. Hacer clic en "Activar" nuevamente
```

#### Opción 2: Build de producción (Más confiable)

```bash
# 1. Compilar la aplicación
npm run build

# 2. Servir los archivos estáticos
npx http-server dist/restaurante-frontend/browser -p 8080

# 3. Abrir en el navegador
# http://localhost:8080
```

---

## 🔍 Diagnóstico de Problemas

Cuando hagas clic en "Activar", la consola del navegador te mostrará **mensajes detallados** que te dirán exactamente qué está pasando:

### ✅ Caso 1: Service Worker no habilitado

**Mensaje en consola:**
```
[WebPush] Service Worker no está habilitado
```

**Solución:**
Usa la Opción 2 (Build de producción) mencionada arriba.

---

### ✅ Caso 2: Navegador no soportado

**Mensaje en alert:**
```
❌ Tu navegador no soporta notificaciones push.
Por favor usa Chrome, Firefox o Edge actualizados.
```

**Solución:**
- Usa Chrome 50+, Firefox 44+, o Edge 17+
- Actualiza tu navegador a la última versión

---

### ✅ Caso 3: Permisos denegados

**Mensaje en alert:**
```
❌ Permisos denegados.

Si quieres activar las notificaciones:
1. Haz clic en el icono 🔒 en la barra de direcciones
2. Cambia "Notificaciones" a "Permitir"
```

**Solución:**
1. Haz clic en el ícono de candado (🔒) o información (ⓘ) en la barra de direcciones
2. Busca "Notificaciones"
3. Cámbialo a "Permitir"
4. Recarga la página
5. Vuelve a hacer clic en "Activar"

**Resetear permisos completamente:**
```javascript
// En la consola del navegador:
localStorage.removeItem('notification-prompt-dismissed');
// Luego: Configuración del navegador > Notificaciones > Eliminar el sitio
// Recargar la página
```

---

### ✅ Caso 4: Error de clave VAPID

**Mensaje en alert:**
```
❌ Error de configuración VAPID.

La clave pública VAPID no es válida.
Contacta al administrador del sistema.
```

**Causa:**
La clave VAPID en el código es de ejemplo y no es válida.

**Solución:**

1. **Generar claves VAPID reales:**

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Esto te dará algo como:
```
Public Key: BK3dT7p...
Private Key: 5J8DgN...
```

2. **Actualizar en el frontend:**

```typescript
// src/app/core/services/web-push.service.ts (línea ~240)
private getVAPIDPublicKey(): string {
  return 'TU_CLAVE_PUBLICA_AQUI'; // Reemplazar con la Public Key generada
}
```

3. **Configurar en el backend:**

Guarda la **Private Key** en tu backend de forma segura (variable de entorno) para enviar las notificaciones.

---

### ✅ Caso 5: Error al registrar en el backend

**Mensaje en alert:**
```
❌ Error al registrar en el servidor.
Intenta nuevamente más tarde.
```

**Causas posibles:**
1. El backend no está corriendo
2. El endpoint `/restaurante/v1/push/dispositivos` no existe
3. Problemas de CORS
4. Error de autenticación (token JWT inválido)

**Solución:**

1. **Verifica que el backend esté corriendo:**
```bash
# En otra terminal
curl http://localhost:8080/restaurante/v1/push/dispositivos
```

2. **Revisa los logs del backend** para ver el error específico

3. **Verifica en Network tab del navegador:**
   - Abre DevTools (F12)
   - Ve a la pestaña "Network"
   - Intenta activar notificaciones
   - Busca la petición `dispositivos`
   - Ve si hay error 401, 403, 500, etc.

---

## 🧪 Verificar que Todo Funciona

### Paso 1: Verificar el Service Worker

```javascript
// En la consola del navegador:
navigator.serviceWorker.ready.then(reg => {
  console.log('Service Worker listo:', reg);
});
```

**Debería mostrar:** `Service Worker listo: [ServiceWorkerRegistration]`

---

### Paso 2: Verificar permisos

```javascript
// En la consola del navegador:
console.log('Estado de permisos:', Notification.permission);
```

**Valores posibles:**
- `"default"` → No ha decidido aún ✅ (bien)
- `"granted"` → Aceptó ✅ (bien)
- `"denied"` → Rechazó ❌ (necesitas resetear permisos)

---

### Paso 3: Verificar la suscripción

```javascript
// En la consola del navegador (después de activar):
navigator.serviceWorker.ready.then(async reg => {
  const sub = await reg.pushManager.getSubscription();
  console.log('Suscripción activa:', sub);
});
```

**Debería mostrar:** Un objeto con `endpoint`, `keys`, etc. Si es `null`, no está suscrito.

---

## 📝 Logs Detallados

Cuando activas las notificaciones, verás una secuencia de logs en la consola:

```
✅ Flujo exitoso:
[WebPush] Solicitando permisos...
[WebPush] Permiso otorgado: granted
[WebPush] Solicitando suscripción al Service Worker...
[WebPush] Suscripción obtenida del SW
[WebPush] Credenciales obtenidas, registrando en backend...
[WebPush] Payload a enviar: {...}
[WebPush] ✅ Dispositivo registrado exitosamente en el backend
[NotificationPrompt] Notificaciones activadas exitosamente
```

```
❌ Si falla:
[WebPush] Service Worker no está habilitado
```
o
```
[WebPush] Error al suscribirse: Error: ...
```

---

## 🎯 Checklist Rápido

Antes de pedir ayuda, verifica:

- [ ] ¿Estás usando Chrome/Firefox/Edge actualizado?
- [ ] ¿El sitio está en `localhost` o HTTPS? (HTTP no funciona)
- [ ] ¿Reiniciaste el servidor después de los cambios?
- [ ] ¿Recargaste la página después de reiniciar?
- [ ] ¿Revisaste los logs en la consola del navegador?
- [ ] ¿El backend está corriendo en `http://localhost:8080`?
- [ ] ¿Generaste claves VAPID reales?
- [ ] ¿Los permisos no están en "denied"?

---

## 🆘 Si Nada Funciona

1. **Limpia todo:**
```bash
# Terminal
rm -rf node_modules .angular dist
npm install
npm start
```

2. **Limpia el navegador:**
   - Abre DevTools (F12)
   - Application tab
   - Clear storage > Clear site data
   - Recarga con Ctrl+Shift+R

3. **Prueba en Incógnito:**
   - Abre una ventana de incógnito (Ctrl+Shift+N en Chrome)
   - Navega a tu app
   - Intenta activar notificaciones
   - Si funciona en incógnito, el problema es caché/permisos del navegador

4. **Revisa la configuración:**
   - `src/app/core/app.config.ts` → `provideServiceWorker` debe tener `enabled: true`
   - `angular.json` → Verifica que `ngsw-config.json` esté en `assets`

---

## 📞 Contacto

Si después de seguir estos pasos aún no funciona, reporta:
1. Mensaje de error exacto (screenshot o texto)
2. Navegador y versión
3. Logs completos de la consola
4. Si es desarrollo (`npm start`) o producción (`npm run build`)

---

✨ **Última actualización:** Octubre 2025
