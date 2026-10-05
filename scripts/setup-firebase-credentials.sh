#!/bin/bash

# Script para configurar credenciales de Firebase desde variables de entorno
# Se usa en CI/CD (GitHub Actions) y desarrollo local

set -e

echo "🔧 Configurando credenciales de Firebase..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para verificar si una variable está definida
check_var() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}❌ Error: Variable $1 no está definida${NC}"
        return 1
    fi
}

# Android: google-services.json
if [ ! -z "$GOOGLE_SERVICES_JSON" ]; then
    echo -e "${YELLOW}📱 Configurando google-services.json para Android...${NC}"
    echo "$GOOGLE_SERVICES_JSON" > android/app/google-services.json
    echo -e "${GREEN}✅ google-services.json creado${NC}"
else
    if [ -f "android/app/google-services.json" ]; then
        echo -e "${GREEN}✅ google-services.json ya existe localmente${NC}"
    else
        echo -e "${YELLOW}⚠️  Variable GOOGLE_SERVICES_JSON no definida y archivo no existe${NC}"
        echo -e "${YELLOW}   Para desarrollo local, coloca el archivo manualmente en android/app/${NC}"
    fi
fi

# iOS: GoogleService-Info.plist
if [ ! -z "$GOOGLE_SERVICE_INFO_PLIST" ]; then
    echo -e "${YELLOW}🍎 Configurando GoogleService-Info.plist para iOS...${NC}"
    echo "$GOOGLE_SERVICE_INFO_PLIST" > ios/App/App/GoogleService-Info.plist
    echo -e "${GREEN}✅ GoogleService-Info.plist creado${NC}"
else
    if [ -f "ios/App/App/GoogleService-Info.plist" ]; then
        echo -e "${GREEN}✅ GoogleService-Info.plist ya existe localmente${NC}"
    else
        echo -e "${YELLOW}⚠️  Variable GOOGLE_SERVICE_INFO_PLIST no definida y archivo no existe${NC}"
        echo -e "${YELLOW}   Para desarrollo local, coloca el archivo manualmente en ios/App/App/${NC}"
    fi
fi

echo -e "${GREEN}🎉 Configuración completada${NC}"

