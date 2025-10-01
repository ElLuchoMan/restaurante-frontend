# 🧪 Guía de Testing - Notificaciones Web Push

## ✅ Checklist de Verificación

### Backend ✅
- [x] Librería `webpush-go` instalada
- [x] Variables VAPID configuradas
- [x] Función `enviarWebPush()` implementada
- [x] Manejo de errores HTTP
- [x] Desactivación automática de dispositivos inválidos
- [x] Tests unitarios pasando

### Frontend ✅
- [x] Claves VAPID en `environment.ts`
- [x] `WebPushService` implementado
- [x] `NotificationPromptComponent` creado
- [x] Tests unitarios pasando
- [x] Service Worker configurado

---

## 🧪 Proceso de Testing

### PASO 1: Verificar que el Backend está Corriendo

```bash
# En otra terminal (en el directorio del backend)
# Asegúrate de que el backend esté corriendo en localhost:8080
```

---

### PASO 2: Iniciar Frontend en Modo Producción

```bash
# Ya lo estás ejecutando:
npm run test:web-push
```

**Qué hace este comando:**
1. Compila el frontend (`npm run build`)
2. Levanta servidor en `http://localhost:4201`
3. Abre automáticamente el navegador

---

### PASO 3: Verificar Service Worker

1. **Abrir DevTools** (F12)
2. **Ir a la pestaña "Application"**
3. **Sección "Service Workers"** (panel izquierdo)
4. Deberías ver: `ngsw-worker.js` con estado **"activated and running"**

**✅ Si lo ves:** Service Worker funcionando
**❌ Si no lo ves:** Refresca con Ctrl+Shift+R

---

### PASO 4: Activar Notificaciones en el Banner

**Deberías ver un banner que dice:**
```
🔔 Recibe nuestras notificaciones
Entérate de promociones, ofertas y novedades al instante
[Activar] [Ahora no]
```

**Hacer clic en "Activar"**

---

### PASO 5: Verificar lo que Sucede

#### En la Consola del Navegador (DevTools → Console):

**✅ Flujo Exitoso:**
```
[WebPush] Solicitando permisos...
[WebPush] Permiso otorgado: granted
[WebPush] Solicitando suscripción al Service Worker...
[WebPush] Suscripción obtenida del SW
[WebPush] Credenciales obtenidas, registrando en backend...
[WebPush] Payload a enviar: {...}
[WebPush] ✅ Dispositivo registrado exitosamente en el backend
[NotificationPrompt] Notificaciones activadas exitosamente
```

**Deberías ver un alert:**
```
✅ ¡Notificaciones activadas correctamente!

Ahora recibirás promociones y ofertas.
```

#### En la Consola del Backend:

**✅ Deberías ver logs similares a:**
```
[INFO] POST /restaurante/v1/push/dispositivos
[INFO] Dispositivo WEB registrado: endpoint=https://fcm.googleapis.com/...
[INFO] p256dh=BJsj63kz..., auth=k8JV6sjd...
```

---

### PASO 6: Verificar el Registro en Base de Datos

```sql
-- Consulta en tu base de datos
SELECT
    push_dispositivo_id,
    plataforma,
    endpoint,
    enabled,
    documento_cliente,
    created_at
FROM push_dispositivos
WHERE plataforma = 'WEB'
ORDER BY created_at DESC
LIMIT 1;
```

**Deberías ver:**
- `plataforma = 'WEB'`
- `endpoint` que empieza con `https://`
- `enabled = true`
- `documento_cliente` con tu documento (si estás logueado)

---

### PASO 7: Enviar Notificación de Prueba

#### Opción A: Desde el Admin Panel

1. **Ir a:** `http://localhost:4201/admin/enviar-notificacion`
2. **Llenar el formulario:**
   - Destinatarios: **"Todos los dispositivos registrados"**
   - Título: `Test de Notificación Web`
   - Mensaje: `Si ves esto, ¡funciona! 🎉`
   - URL: `/menu`
3. **Hacer clic en "Enviar Notificación"**

#### Opción B: Con cURL (Obtén el token primero)

```bash
# En otra terminal
curl -X POST http://localhost:8080/restaurante/v1/push/enviar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "remitente": {"tipo": "SISTEMA"},
    "destinatarios": {"tipo": "TODOS"},
    "notificacion": {
      "titulo": "Test Web Push",
      "mensaje": "Si ves esto, funciona perfectamente!",
      "datos": {"url": "/menu", "tipo": "TEST"}
    }
  }'
```

---

### PASO 8: Verificar que Llega la Notificación

**✅ Deberías ver:**

1. **Notificación nativa del navegador:**
   - Aparece en la esquina superior derecha (Windows)
   - Aparece en el centro superior (macOS)
   - Con el título y mensaje que enviaste
   - Con el ícono de la app

2. **En la consola del navegador:**
   ```
   [WebPush] Mensaje recibido: {...}
   ```

3. **Al hacer clic en la notificación:**
   - El navegador debe navegar a la URL especificada (`/menu`)

---

## 🐛 Troubleshooting

### ❌ Problema 1: "Service Worker no está habilitado"

**Causa:** El Service Worker no se registró correctamente.

**Solución:**
```bash
# Detener el servidor (Ctrl+C)
# Limpiar y reconstruir
rm -rf dist .angular
npm run test:web-push
```

---

### ❌ Problema 2: "Error 401 al registrar dispositivo"

**Causa:** No estás autenticado o el token JWT expiró.

**Solución:**
1. Hacer login en la aplicación
2. Intentar activar notificaciones de nuevo

---

### ❌ Problema 3: "Error de configuración VAPID"

**Mensaje:** `❌ Error de configuración VAPID`

**Causa:** Las claves VAPID en frontend y backend no coinciden.

**Verificar:**

**Frontend:**
```typescript
// src/environments/environment.ts
vapidPublicKey: 'BCFXrcyYwESaGDguqj1kidjzHw1QzAx47thsynar5jA2TdDF9fc9nXNCi11ugeAip_UNAFBzcqKt6GG157uK-Pg'
```

**Backend:**
```bash
# Variables de entorno o conf/app.conf
VAPID_PUBLIC_KEY=BCFXrcyYwESaGDguqj1kidjzHw1QzAx47thsynar5jA2TdDF9fc9nXNCi11ugeAip_UNAFBzcqKt6GG157uK-Pg
VAPID_PRIVATE_KEY=6ACdjLgL8qw8s2RGvnkRyARS56T0NSC4NxWCxeC69Ew
```

---

### ❌ Problema 4: "La notificación no llega"

**Verificar:**

1. **¿El dispositivo está registrado?**
   ```sql
   SELECT * FROM push_dispositivos WHERE plataforma = 'WEB' AND enabled = true;
   ```

2. **¿El backend intentó enviar?**
   ```sql
   SELECT * FROM push_envios WHERE push_dispositivo_id = [TU_ID] ORDER BY sent_at DESC LIMIT 5;
   ```

3. **¿Hay errores en la consola del backend?**
   ```
   [ERROR] [Web Push] Error de autenticación VAPID (401)
   [ERROR] [Web Push] Bad Request (400): Invalid subscription
   ```

4. **¿El navegador bloqueó las notificaciones?**
   - Ir a Configuración del navegador
   - Buscar "Notificaciones"
   - Verificar que `localhost:4201` tenga permisos

---

## 📊 Verificación Completa

### Checklist Final

- [ ] Service Worker activado en DevTools
- [ ] Banner de notificaciones apareció
- [ ] Permisos otorgados (alert de éxito)
- [ ] Dispositivo registrado en base de datos
- [ ] Notificación de prueba enviada
- [ ] Notificación recibida en el navegador
- [ ] Click en notificación navega correctamente
- [ ] Logs del backend sin errores

---

## 🎯 Escenarios de Prueba Adicionales

### Test 1: Enviar a un Cliente Específico

```bash
curl -X POST http://localhost:8080/restaurante/v1/push/enviar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "remitente": {"tipo": "SISTEMA"},
    "destinatarios": {
      "tipo": "CLIENTE",
      "documentoCliente": 1015466495
    },
    "notificacion": {
      "titulo": "Mensaje Personal",
      "mensaje": "Solo tú recibes esto",
      "datos": {"url": "/perfil"}
    }
  }'
```

**✅ Esperado:** Solo tu dispositivo recibe la notificación.

---

### Test 2: Enviar a Todos los Clientes

```bash
curl -X POST http://localhost:8080/restaurante/v1/push/enviar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "remitente": {"tipo": "SISTEMA"},
    "destinatarios": {"tipo": "CLIENTES"},
    "notificacion": {
      "titulo": "Oferta Especial Clientes",
      "mensaje": "25% de descuento solo para clientes",
      "datos": {"url": "/ofertas"}
    }
  }'
```

**✅ Esperado:** Todos los dispositivos de clientes reciben la notificación.

---

### Test 3: Cerrar el Navegador y Volver

1. Cerrar completamente el navegador
2. Abrir de nuevo: `http://localhost:4201`
3. Enviar otra notificación

**✅ Esperado:** La notificación debe llegar aunque el navegador estaba cerrado (si el sistema operativo lo permite).

---

### Test 4: Múltiples Dispositivos

1. Abrir `http://localhost:4201` en Chrome
2. Activar notificaciones
3. Abrir `http://localhost:4201` en Firefox
4. Activar notificaciones
5. Enviar una notificación

**✅ Esperado:** Ambos navegadores reciben la notificación.

---

## 📈 Monitoreo en Producción

### Queries Útiles

**Dispositivos activos por plataforma:**
```sql
SELECT plataforma, COUNT(*) as total
FROM push_dispositivos
WHERE enabled = true
GROUP BY plataforma;
```

**Tasa de éxito de envíos:**
```sql
SELECT
    proveedor,
    COUNT(*) as total,
    SUM(CASE WHEN exito = true THEN 1 ELSE 0 END) as exitosos,
    ROUND(100.0 * SUM(CASE WHEN exito = true THEN 1 ELSE 0 END) / COUNT(*), 2) as tasa_exito
FROM push_envios
WHERE sent_at >= NOW() - INTERVAL '24 hours'
GROUP BY proveedor;
```

**Errores comunes:**
```sql
SELECT error_code, COUNT(*) as total
FROM push_envios
WHERE exito = false AND sent_at >= NOW() - INTERVAL '7 days'
GROUP BY error_code
ORDER BY total DESC
LIMIT 10;
```

---

## 🚀 Despliegue a Producción

### Checklist Pre-Deploy

- [ ] Variables VAPID configuradas en Railway/Render
- [ ] Frontend compilado: `npm run build`
- [ ] Backend con las claves VAPID correctas
- [ ] HTTPS habilitado (obligatorio para Web Push)
- [ ] Service Worker incluido en el deploy
- [ ] Tests E2E ejecutados localmente

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs del backend
2. Revisa la consola del navegador (DevTools)
3. Verifica la base de datos (`push_dispositivos`, `push_envios`)
4. Consulta `docs/TROUBLESHOOTING-WEB-PUSH.md`
5. Consulta `docs/GITHUB-SECRETS-SETUP.md`

---

✨ **¡Éxito! Si todo funciona, tu sistema de notificaciones está completo.**
