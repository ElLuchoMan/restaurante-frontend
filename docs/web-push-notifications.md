# 🔔 Web Push Notifications - Documentación

## Resumen

Se ha implementado soporte completo para **notificaciones push en el navegador web** utilizando la API estándar de Web Push y el Service Worker de Angular.

## 📋 Archivos Creados

### 1. **WebPushService** (`src/app/core/services/web-push.service.ts`)
Servicio principal que maneja:
- Solicitud de permisos de notificación
- Registro de dispositivos en el backend
- Suscripción a notificaciones push (Web Push API)
- Escucha de mensajes entrantes
- Mostrar notificaciones en el navegador

### 2. **NotificationPromptComponent** (`src/app/shared/components/notification-prompt/notification-prompt.component.ts`)
Componente UI que:
- Se muestra automáticamente 3 segundos después de cargar la página
- Solicita al usuario activar las notificaciones
- Solo aparece si el navegador las soporta y aún no tiene permisos
- Se puede cerrar y no vuelve a aparecer

### 3. **Tests**
- `web-push.service.spec.ts`: Tests unitarios del servicio
- `notification-prompt.component.spec.ts`: Tests del componente
- `app.component.spec.ts`: Actualizado con mocks necesarios

## 🚀 Características Implementadas

### ✅ Detección Automática de Entorno
El sistema detecta automáticamente si está en:
- **WebView** (Capacitor): Usa `NativePushService` para FCM
- **Navegador Web**: Usa `WebPushService` para Web Push API

### ✅ Gestión de Permisos
- Verifica si el navegador soporta notificaciones
- Solicita permisos al usuario mediante UI amigable
- Respeta la decisión del usuario (granted/denied/default)
- No vuelve a preguntar si fue denegado o cerrado

### ✅ Registro Automático
Cuando el usuario activa las notificaciones:
1. Se suscribe al Service Worker
2. Obtiene las credenciales (endpoint, p256dh, auth)
3. Registra el dispositivo en el backend (`POST /push/dispositivos`)
4. Asocia el dispositivo con el usuario autenticado (Cliente o Trabajador)

### ✅ Recepción de Notificaciones
- Escucha mensajes push del Service Worker
- Muestra notificaciones nativas del navegador
- Maneja clics en notificaciones para navegar a URLs específicas

## 📱 Cómo Funciona

### Flujo para el Usuario

1. **Primera Visita**
   - Usuario abre la app en su navegador
   - A los 3 segundos aparece el prompt de notificaciones
   - Usuario puede:
     - ✅ **Activar**: Se registra su dispositivo y empieza a recibir notificaciones
     - ❌ **Ahora no**: Se cierra el prompt y no vuelve a aparecer

2. **Recibiendo Notificaciones**
   - El backend envía notificaciones mediante `POST /push/enviar`
   - El navegador muestra la notificación
   - Usuario puede hacer clic para abrir la URL especificada

3. **Re-registro Automático**
   - Cuando el usuario inicia sesión, se re-registra con su documento
   - Si ya tiene permisos, el proceso es automático

### Flujo Técnico

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVEGADOR WEB                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. AppComponent detecta entorno → !isWebView              │
│                                                             │
│  2. Muestra NotificationPromptComponent                     │
│     └─ Usuario hace clic en "Activar"                      │
│                                                             │
│  3. WebPushService.requestPermissionAndSubscribe()          │
│     ├─ Notification.requestPermission() → 'granted'        │
│     ├─ SwPush.requestSubscription(VAPID_KEY)               │
│     └─ Obtiene {endpoint, p256dh, auth}                    │
│                                                             │
│  4. POST /push/dispositivos                                 │
│     {                                                       │
│       plataforma: 'WEB',                                    │
│       endpoint: '...',                                      │
│       p256dh: '...',                                        │
│       auth: '...',                                          │
│       documentoCliente: 123                                 │
│     }                                                       │
│                                                             │
│  5. Service Worker escucha mensajes                         │
│     └─ SwPush.messages.subscribe()                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       BACKEND                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  6. Admin envía notificación                                │
│     POST /push/enviar                                       │
│     {                                                       │
│       destinatarios: {tipo: 'CLIENTES'},                    │
│       notificacion: {                                       │
│         titulo: '🎁 Oferta especial',                       │
│         mensaje: '25% de descuento...',                     │
│         datos: {url: '/menu'}                               │
│       }                                                     │
│     }                                                       │
│                                                             │
│  7. Backend envía push a todos los dispositivos WEB         │
│     usando las credenciales (endpoint, p256dh, auth)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVICE WORKER                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  8. Recibe el mensaje push                                  │
│  9. Muestra notificación nativa del navegador               │
│ 10. Usuario hace clic → navega a la URL                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Configuración Requerida

### ⚠️ IMPORTANTE: Clave VAPID

El código actualmente incluye una clave VAPID de ejemplo. **DEBES reemplazarla** con tu propia clave:

```typescript
// src/app/core/services/web-push.service.ts (línea ~200)
private getVAPIDPublicKey(): string {
  // TODO: Obtener esta clave del backend o configuración
  return 'TU_CLAVE_VAPID_PUBLICA_AQUI';
}
```

#### Cómo Generar Claves VAPID

**Opción 1: Usando web-push CLI**
```bash
npm install -g web-push
web-push generate-vapid-keys
```

**Opción 2: Usando una biblioteca en tu backend**
```go
// En Go puedes usar github.com/SherClockHolmes/webpush-go
// O cualquier otra biblioteca de Web Push
```

Las claves VAPID son un par público/privado:
- **Pública**: Se usa en el frontend para suscribirse
- **Privada**: Se usa en el backend para enviar notificaciones

### Actualizar el Backend

Tu backend necesita implementar el envío de notificaciones Web Push usando:
1. La clave privada VAPID
2. El endpoint, p256dh y auth del dispositivo registrado
3. Una biblioteca como `github.com/SherClockHolmes/webpush-go`

## 🧪 Cómo Probar

### 1. En Desarrollo Local

```bash
# Iniciar el servidor de desarrollo
npm start

# Abrir en Chrome/Firefox/Edge
# http://localhost:4200
```

**⚠️ Limitación en Desarrollo**:
- El Service Worker solo funciona en HTTPS o `localhost`
- Las notificaciones pueden no funcionar hasta tener VAPID real

### 2. En Producción (HTTPS)

```bash
# Build de producción
npm run build

# Deploy a Netlify, Vercel, etc.
```

### 3. Probar con el Admin Panel

1. Inicia sesión como administrador
2. Ve a **Admin → Enviar Notificación**
3. Selecciona "Todos los clientes" o "Todos" como destinatarios
4. Escribe un título y mensaje
5. Haz clic en "Enviar Notificación"
6. Los dispositivos web registrados deberían recibir la notificación

## 📊 Estados de Permisos

| Estado | Descripción | Comportamiento |
|--------|-------------|----------------|
| `default` | Usuario aún no ha decidido | Se muestra el prompt |
| `granted` | Usuario aceptó | Se registra automáticamente |
| `denied` | Usuario rechazó | No se vuelve a preguntar |

## 🎨 Personalización

### Cambiar el Tiempo del Prompt

```typescript
// src/app/shared/components/notification-prompt/notification-prompt.component.ts (línea ~149)
setTimeout(() => {
  this.checkShouldShowPrompt();
}, 3000); // Cambia 3000 a los milisegundos deseados
```

### Cambiar el Estilo del Prompt

Edita los estilos en:
```typescript
// src/app/shared/components/notification-prompt/notification-prompt.component.ts
styles: [
  `
    .notification-prompt {
      // Tus estilos personalizados aquí
    }
  `
]
```

### Personalizar el Icono de las Notificaciones

```typescript
// src/app/core/services/web-push.service.ts (línea ~142)
const options: NotificationOptions = {
  body,
  icon: '/icons/web-app-manifest-192x192.png', // Cambia esta ruta
  badge: '/icons/web-app-manifest-192x192.png', // Icono pequeño en Android
  //...
};
```

## 🐛 Troubleshooting

### "Notificaciones no funcionan en desarrollo"
✅ **Solución**: Las notificaciones solo funcionan en HTTPS o `localhost`. Verifica que estés usando `http://localhost:4200`.

### "El prompt no aparece"
Verifica:
1. ¿Ya diste permisos antes? (Revisa en Configuración del navegador)
2. ¿Está en `denied`? (El usuario debe ir a Configuración del navegador para cambiar)
3. ¿Ya cerraste el prompt? (Se guarda en localStorage)

**Resetear el prompt**:
```javascript
// En la consola del navegador
localStorage.removeItem('notification-prompt-dismissed');
// Recargar la página
location.reload();
```

### "Error: VAPID public key must be a URL safe Base64 encoded string"
✅ **Solución**: Reemplaza la clave VAPID de ejemplo con una real generada correctamente.

### "Service Worker no se registra"
✅ **Solución**: El SW solo se registra en producción (`!isDevMode()`). Para probarlo:
```bash
npm run build
npx http-server dist/restaurante-frontend/browser -p 8080
```

## 📚 Referencias

- [Web Push API - MDN](https://developer.mozilla.org/es/docs/Web/API/Push_API)
- [Notification API - MDN](https://developer.mozilla.org/es/docs/Web/API/Notifications_API)
- [Angular Service Worker](https://angular.dev/ecosystem/service-workers)
- [VAPID Keys](https://datatracker.ietf.org/doc/html/rfc8292)

## ✨ Próximos Pasos

1. **Generar claves VAPID reales** y reemplazar la de ejemplo
2. **Implementar el envío de notificaciones Web Push en el backend**
3. **Probar en producción** con HTTPS
4. **Monitorear métricas** de suscripciones y entregas
5. **Considerar personalización** de sonidos y vibración
6. **Implementar analytics** para tracking de notificaciones

---

¿Tienes preguntas? Consulta la documentación completa en `/docs` o revisa los tests para ver ejemplos de uso.
