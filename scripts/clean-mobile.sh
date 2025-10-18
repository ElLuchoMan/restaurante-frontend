#!/bin/bash

# Script de limpieza completa para desarrollo móvil
# Resuelve problemas de puerto ocupado, metadatos de macOS y builds corruptos

echo "🧹 Iniciando limpieza completa del entorno móvil..."

# 1. Limpiar procesos de Angular/Node
echo "📱 Matando procesos de Angular y Node..."
pkill -f "ng serve" 2>/dev/null
pkill -f "node.*4200" 2>/dev/null
lsof -ti:4200 | xargs kill -9 2>/dev/null
echo "✅ Procesos limpiados"

# 2. Limpiar iOS
echo "🍎 Limpiando iOS..."
rm -rf ios/DerivedData
rm -rf ios/App/Pods
rm -rf ios/App/Podfile.lock
echo "✅ iOS limpiado"

# 3. Limpiar Android
echo "🤖 Limpiando Android..."
cd android
./gradlew clean 2>/dev/null || echo "Gradle clean omitido"
cd ..
echo "✅ Android limpiado"

# 4. Reinstalar Pods de iOS
echo "🍎 Reinstalando Pods de iOS..."
cd ios/App
pod install --repo-update
cd ../..
echo "✅ Pods reinstalados"

# 5. Configurar Android SDK
echo "🤖 Configurando Android SDK..."
if [ -d "$HOME/Library/Android/sdk" ]; then
    echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
    echo "✅ Android SDK configurado"
else
    echo "⚠️  Android SDK no encontrado en $HOME/Library/Android/sdk"
fi

# 6. Sync Capacitor
echo "⚡ Sincronizando Capacitor..."
npx cap sync
echo "✅ Capacitor sincronizado"

echo ""
echo "✨ ¡Limpieza completa! Ahora puedes ejecutar: npm run mobile:live"
echo ""

