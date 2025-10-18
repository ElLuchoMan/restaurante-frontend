# 🔥 Firebase Setup - Configuración de Credenciales

## ⚠️ IMPORTANTE: Credenciales Comprometidas

Las credenciales anteriores fueron expuestas públicamente. **DEBES rotarlas inmediatamente**.

## 🔄 Pasos para Rotar Credenciales

### 1. Accede a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto

### 2. Regenerar API Keys para Android
1. Ve a **Project Settings** (⚙️)
2. En la pestaña **General**, busca tu app Android
3. Descarga el nuevo `google-services.json`
4. Colócalo en: `android/app/google-services.json`

### 3. Regenerar API Keys para iOS
1. En **Project Settings**, busca tu app iOS
2. Descarga el nuevo `GoogleService-Info.plist`
3. Colócalo en: `ios/App/App/GoogleService-Info.plist`

### 4. Revocar API Keys Antiguas
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Navega a **APIs & Services > Credentials**
3. Busca las API Keys expuestas:
   - `AIzaSyB2XZa5FL0LLCkg0b6p...` (iOS)
   - `AIzaSyDPlIqGm0U-Qsl0Ioqj...` (Android)
4. **Elimínalas o restringe su uso**

## 🔒 Restricciones Recomendadas para las Nuevas API Keys

### Para Android:
- **Tipo**: Android apps
- **Restricción**: Solo tu package name `com.elfogondemaria.app`
- **SHA-1**: Agrega las firmas de tus certificados

### Para iOS:
- **Tipo**: iOS apps
- **Restricción**: Solo tu Bundle ID `com.elfogondemaria.app`

## 📦 Compartir Credenciales de Forma Segura

### Opción 1: Gestor de Contraseñas (Recomendado)
- Usa **1Password**, **LastPass** o **Bitwarden** para compartir los archivos entre el equipo
- Cada desarrollador descarga localmente

### Opción 2: Repositorio Privado Separado
- Crea un repo privado solo para configuraciones sensibles
- Agrega solo a los miembros del equipo

### Opción 3: Variables de Entorno en CI/CD
- Guarda las credenciales en **GitHub Secrets**
- En el pipeline de CI/CD, inyecta los archivos antes de compilar

## 🚀 Setup en Nueva Máquina

Cuando cambies de Mac a PC:

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/ElLuchoMan/restaurante-frontend.git
   cd restaurante-frontend
   ```

2. **Obtén las credenciales**
   - Descárgalas del gestor de contraseñas compartido
   - O pídelas al administrador del proyecto

3. **Coloca los archivos**
   ```bash
   # Android
   cp /ruta/descarga/google-services.json android/app/

   # iOS
   cp /ruta/descarga/GoogleService-Info.plist ios/App/App/
   ```

4. **Verifica que están en .gitignore**
   ```bash
   git status
   # NO deben aparecer los archivos .json y .plist
   ```

## ✅ Checklist Post-Rotación

- [ ] Nuevas credenciales descargadas de Firebase
- [ ] API Keys antiguas revocadas en Google Cloud Console
- [ ] Restricciones aplicadas a las nuevas API Keys
- [ ] Archivos colocados localmente en el proyecto
- [ ] `.gitignore` actualizado (no commitear estos archivos)
- [ ] Archivos compartidos de forma segura con el equipo
- [ ] Compilación Android funciona con nuevas credenciales
- [ ] Compilación iOS funciona con nuevas credenciales
- [ ] Notificaciones push funcionan correctamente

## 🔍 Monitoreo

Después de rotar:
1. Monitorea el uso de las API Keys en Google Cloud Console
2. Configura alertas para uso anómalo
3. Revisa logs de Firebase para actividad sospechosa

## 📞 Soporte

Si tienes problemas con la rotación, contacta a:
- Firebase Support
- Administrador del proyecto

