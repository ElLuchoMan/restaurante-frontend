# 🔐 Configurar Firebase con GitHub Secrets

Esta guía explica cómo gestionar las credenciales de Firebase de forma segura usando **GitHub Secrets**.

## 📋 Tabla de Contenidos

- [¿Por qué GitHub Secrets?](#por-qué-github-secrets)
- [Configuración Inicial](#configuración-inicial)
- [Desarrollo Local](#desarrollo-local)
- [CI/CD con GitHub Actions](#cicd-con-github-actions)
- [Troubleshooting](#troubleshooting)

## ¿Por qué GitHub Secrets?

✅ **Ventajas:**
- Credenciales nunca se commitean al repositorio
- Gestionadas centralizadamente en GitHub
- Acceso controlado por permisos del repositorio
- Fácil rotación sin modificar código
- Funciona automáticamente en CI/CD

❌ **Evitamos:**
- Exponer API keys públicamente
- Compartir credenciales por email/chat
- Credenciales hardcodeadas en el código

## Configuración Inicial

### Paso 1: Obtener las Credenciales de Firebase

#### Para Android (`google-services.json`):
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Project Settings** (⚙️ icono de configuración)
4. En la sección **Your apps**, selecciona tu app Android
5. Descarga el archivo `google-services.json`

#### Para iOS (`GoogleService-Info.plist`):
1. En la misma pantalla de **Project Settings**
2. Selecciona tu app iOS
3. Descarga el archivo `GoogleService-Info.plist`

### Paso 2: Convertir Archivos a Base64 (Opcional pero Recomendado)

```bash
# Para Android
cat android/app/google-services.json | base64 > google-services-base64.txt

# Para iOS
cat ios/App/App/GoogleService-Info.plist | base64 > google-service-info-base64.txt
```

**Alternativa:** Puedes copiar el contenido completo del archivo directamente (formato JSON/XML).

### Paso 3: Agregar Secrets a GitHub

1. Ve a tu repositorio en GitHub
2. Click en **Settings** > **Secrets and variables** > **Actions**
3. Click en **New repository secret**
4. Crea los siguientes secrets:

#### Secret 1: `GOOGLE_SERVICES_JSON`
- **Name:** `GOOGLE_SERVICES_JSON`
- **Value:** Contenido completo del archivo `google-services.json` (o base64)

#### Secret 2: `GOOGLE_SERVICE_INFO_PLIST`
- **Name:** `GOOGLE_SERVICE_INFO_PLIST`
- **Value:** Contenido completo del archivo `GoogleService-Info.plist` (o base64)

![GitHub Secrets Setup](https://docs.github.com/assets/cb-28517/images/help/settings/actions-secret-button.png)

## Desarrollo Local

### Opción 1: Archivos Locales (Recomendado)

Coloca los archivos manualmente en tu máquina:

```bash
# Android
cp ~/Downloads/google-services.json android/app/

# iOS
cp ~/Downloads/GoogleService-Info.plist ios/App/App/

# Verifica que NO aparecen en git
git status  # No deben listarse
```

### Opción 2: Variables de Entorno Locales

1. Crea un archivo `.env.local` (ya está en `.gitignore`):

```bash
# .env.local
export GOOGLE_SERVICES_JSON='{"project_info": {...}}'  # Contenido completo
export GOOGLE_SERVICE_INFO_PLIST='<?xml version="1.0"...'  # Contenido completo
```

2. Carga las variables y ejecuta el script:

```bash
source .env.local
npm run firebase:setup
```

### Setup en Nueva Máquina (PC/Mac)

```bash
# 1. Clona el repositorio
git clone https://github.com/ElLuchoMan/restaurante-frontend.git
cd restaurante-frontend

# 2. Instala dependencias
npm install

# 3. Coloca las credenciales (Opción A - Manual)
cp ~/Downloads/google-services.json android/app/
cp ~/Downloads/GoogleService-Info.plist ios/App/App/

# O (Opción B - Con variables de entorno)
export GOOGLE_SERVICES_JSON='...'
export GOOGLE_SERVICE_INFO_PLIST='...'
npm run firebase:setup

# 4. Compila normalmente
npm run android  # o npm run ios
```

## CI/CD con GitHub Actions

Las credenciales se inyectan automáticamente en GitHub Actions usando los secrets.

### Ejemplo de Workflow para Android

```yaml
name: Build Android

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build-android:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Setup Firebase Credentials
        env:
          GOOGLE_SERVICES_JSON: ${{ secrets.GOOGLE_SERVICES_JSON }}
        run: |
          npm run firebase:setup

      - name: Build Android
        run: |
          npm run build
          npx cap sync android
          cd android && ./gradlew assembleRelease
```

### Ejemplo de Workflow para iOS

```yaml
name: Build iOS

on:
  push:
    branches: [main, develop]

jobs:
  build-ios:
    runs-on: macos-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Setup Firebase Credentials
        env:
          GOOGLE_SERVICE_INFO_PLIST: ${{ secrets.GOOGLE_SERVICE_INFO_PLIST }}
        run: |
          npm run firebase:setup

      - name: Build iOS
        run: |
          npm run build
          npx cap sync ios
          cd ios/App && xcodebuild -workspace App.xcworkspace -scheme App -configuration Release
```

## Rotar Credenciales

Si las credenciales fueron comprometidas:

1. **Regenera en Firebase Console:**
   - Descarga nuevos archivos `google-services.json` y `GoogleService-Info.plist`

2. **Actualiza GitHub Secrets:**
   - Ve a **Settings** > **Secrets and variables** > **Actions**
   - Edita `GOOGLE_SERVICES_JSON` y `GOOGLE_SERVICE_INFO_PLIST`
   - Pega los nuevos valores

3. **Revoca las Antiguas:**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - **APIs & Services** > **Credentials**
   - Elimina o restringe las API Keys antiguas

4. **Actualiza Localmente:**
   - Reemplaza los archivos locales en tu máquina
   - O actualiza las variables de entorno

## Troubleshooting

### Error: "google-services.json not found"

```bash
# Verifica que el archivo existe
ls -la android/app/google-services.json

# Si no existe, ejecútalo manualmente
export GOOGLE_SERVICES_JSON='...'
npm run firebase:setup
```

### Error: "GoogleService-Info.plist not found"

```bash
# Verifica que el archivo existe
ls -la ios/App/App/GoogleService-Info.plist

# Si no existe, colócalo manualmente o usa el script
npm run firebase:setup
```

### Los archivos aparecen en `git status`

```bash
# Verifica que están en .gitignore
grep "google-services.json" .gitignore
grep "GoogleService-Info.plist" .gitignore

# Si no están, agrégalos
echo "android/app/google-services.json" >> .gitignore
echo "ios/App/App/GoogleService-Info.plist" >> .gitignore
```

### Error en GitHub Actions

- Verifica que los secrets están configurados en **Settings** > **Secrets and variables** > **Actions**
- Los nombres deben coincidir exactamente: `GOOGLE_SERVICES_JSON` y `GOOGLE_SERVICE_INFO_PLIST`
- Asegúrate de que el contenido no tiene saltos de línea extra o espacios

## Restricciones Recomendadas para API Keys

### Android API Key:
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** > **Credentials**
3. Selecciona la API Key de Android
4. **Application restrictions:**
   - Tipo: **Android apps**
   - Package name: `com.elfogondemaria.app`
   - SHA-1: Agrega las firmas de tus certificados de debug y release

### iOS API Key:
1. En las mismas **Credentials**
2. Selecciona la API Key de iOS
3. **Application restrictions:**
   - Tipo: **iOS apps**
   - Bundle ID: `com.elfogondemaria.app`

## Monitoreo

- Revisa periódicamente el uso de las API Keys en [Google Cloud Console](https://console.cloud.google.com/)
- Configura alertas para uso anómalo
- Rota las credenciales cada 6-12 meses

## Recursos Adicionales

- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/api-keys)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Google Cloud API Key Restrictions](https://cloud.google.com/docs/authentication/api-keys#securing_an_api_key)

## Soporte

Si tienes problemas con la configuración:
1. Revisa los logs de GitHub Actions
2. Verifica que los secrets están correctamente configurados
3. Contacta al administrador del repositorio
