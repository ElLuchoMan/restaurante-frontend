# 🔐 Configuración de GitHub Secrets

## Variables VAPID para Notificaciones Push

### 📦 Claves Generadas

Se han generado las siguientes claves VAPID para notificaciones web:

**✅ Clave Pública (Frontend):**
```
BCFXrcyYwESaGDguqj1kidjzHw1QzAx47thsynar5jA2TdDF9fc9nXNCi11ugeAip_UNAFBzcqKt6GG157uK-Pg
```

**🔒 Clave Privada (Backend):**
```
6ACdjLgL8qw8s2RGvnkRyARS56T0NSC4NxWCxeC69Ew
```

---

## 🛠️ Configuración en GitHub

### Para el Repositorio Frontend

1. **Ir a tu repositorio en GitHub**
   ```
   https://github.com/TU_USUARIO/restaurante-frontend
   ```

2. **Navegar a Settings → Secrets and variables → Actions**

3. **Crear un nuevo Repository Secret:**
   - Click en **"New repository secret"**
   - Name: `VAPID_PUBLIC_KEY`
   - Value: `BCFXrcyYwESaGDguqj1kidjzHw1QzAx47thsynar5jA2TdDF9fc9nXNCi11ugeAip_UNAFBzcqKt6GG157uK-Pg`
   - Click en **"Add secret"**

### Para el Repositorio Backend

1. **Ir a tu repositorio backend en GitHub**
   ```
   https://github.com/TU_USUARIO/restaurante-backend
   ```

2. **Navegar a Settings → Secrets and variables → Actions**

3. **Crear un nuevo Repository Secret:**
   - Click en **"New repository secret"**
   - Name: `VAPID_PRIVATE_KEY`
   - Value: `6ACdjLgL8qw8s2RGvnkRyARS56T0NSC4NxWCxeC69Ew`
   - Click en **"Add secret"**

---

## 🚀 Uso en CI/CD

### En GitHub Actions (Frontend)

```yaml
# .github/workflows/deploy.yml
steps:
  - name: Build
    run: npm run build
    env:
      VAPID_PUBLIC_KEY: ${{ secrets.VAPID_PUBLIC_KEY }}
```

### En Railway/Render (Backend)

**Variables de Entorno:**
```bash
VAPID_PUBLIC_KEY=BCFXrcyYwESaGDguqj1kidjzHw1QzAx47thsynar5jA2TdDF9fc9nXNCi11ugeAip_UNAFBzcqKt6GG157uK-Pg
VAPID_PRIVATE_KEY=6ACdjLgL8qw8s2RGvnkRyARS56T0NSC4NxWCxeC69Ew
VAPID_SUBJECT=mailto:admin@elfogondemaria.com
```

---

## 📝 Uso en el Código

### Frontend (Angular)

**Ya configurado en:**
- `src/environments/environment.ts` (desarrollo)
- `src/environments/environment.prod.ts` (producción)

```typescript
export const environment = {
  // ...
  vapidPublicKey: 'BCFXrcyYwESaGDguqj1kidjzHw1QzAx47thsynar5jA2TdDF9fc9nXNCi11ugeAip_UNAFBzcqKt6GG157uK-Pg',
};
```

### Backend (Go)

**Agregar en tu código Go:**

```go
package main

import (
    "os"
    "github.com/SherClockHolmes/webpush-go"
)

var vapidKeys = &webpush.Keys{
    Public:  os.Getenv("VAPID_PUBLIC_KEY"),
    Private: os.Getenv("VAPID_PRIVATE_KEY"),
}

// Enviar notificación Web Push
func sendWebPushNotification(subscription *PushSubscription, payload string) error {
    resp, err := webpush.SendNotification(
        []byte(payload),
        &webpush.Subscription{
            Endpoint: subscription.Endpoint,
            Keys: webpush.Keys{
                Auth:   subscription.Auth,
                P256dh: subscription.P256dh,
            },
        },
        &webpush.Options{
            Subscriber:      os.Getenv("VAPID_SUBJECT"), // mailto:tu@email.com
            VAPIDPublicKey:  vapidKeys.Public,
            VAPIDPrivateKey: vapidKeys.Private,
            TTL:             30,
        },
    )

    if err != nil {
        return err
    }

    defer resp.Body.Close()
    return nil
}
```

**Dependencias necesarias:**
```bash
go get github.com/SherClockHolmes/webpush-go
```

---

## 🔒 Seguridad

### ⚠️ IMPORTANTE: Nunca Hagas Esto

❌ **NO** subas las claves directamente al código:
```typescript
// ❌ MAL
const vapidKey = '6ACdjLgL8qw8s2RGvnkRyARS56T0NSC4NxWCxeC69Ew';
```

❌ **NO** las incluyas en archivos de configuración versionados:
```json
// ❌ MAL - config.json
{
  "vapidPrivateKey": "6ACdjLgL8qw8s2RGvnkRyARS56T0NSC4NxWCxeC69Ew"
}
```

### ✅ Buenas Prácticas

✅ **SÍ** usa variables de entorno:
```typescript
// ✅ BIEN
const vapidKey = process.env.VAPID_PRIVATE_KEY;
```

✅ **SÍ** usa GitHub Secrets para CI/CD

✅ **SÍ** usa servicios de gestión de secretos en producción:
- AWS Secrets Manager
- HashiCorp Vault
- Railway/Render Environment Variables

---

## 🧪 Verificar la Configuración

### Frontend

```bash
# 1. Build de producción
npm run build

# 2. Servir y abrir en navegador
npx http-server dist/restaurante-frontend/browser -p 8080

# 3. Abrir DevTools (F12) y verificar en consola:
# Debe mostrar logs de [WebPush] exitosos
```

### Backend

```bash
# Test rápido en Go
go run main.go

# Verificar que las variables estén cargadas
curl -X POST http://localhost:8080/restaurante/v1/push/enviar \
  -H "Content-Type: application/json" \
  -d '{
    "remitente": {"tipo": "SISTEMA"},
    "destinatarios": {"tipo": "TODOS"},
    "notificacion": {
      "titulo": "Test",
      "mensaje": "Prueba de notificación"
    }
  }'
```

---

## 📚 Referencias

- [Web Push Protocol (RFC 8030)](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID (RFC 8292)](https://datatracker.ietf.org/doc/html/rfc8292)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [webpush-go Library](https://github.com/SherClockHolmes/webpush-go)

---

## 🆘 Troubleshooting

### Error: "VAPID authentication error"

**Causa:** La clave pública y privada no coinciden

**Solución:** Verifica que ambas claves sean del mismo par generado por `web-push generate-vapid-keys`

---

### Error: "Unauthorized (401)"

**Causa:** La clave privada no está configurada correctamente en el backend

**Solución:**
1. Verifica que `VAPID_PRIVATE_KEY` esté en las variables de entorno
2. Reinicia el servidor backend
3. Verifica con: `echo $VAPID_PRIVATE_KEY`

---

### Las notificaciones no llegan

**Checklist:**
- [ ] ¿La clave pública está en `environment.ts`?
- [ ] ¿La clave privada está en las variables de entorno del backend?
- [ ] ¿El usuario aceptó los permisos de notificación?
- [ ] ¿El dispositivo está registrado en la base de datos?
- [ ] ¿El backend está usando la biblioteca de Web Push correctamente?

---

✨ **Última actualización:** Octubre 2025
