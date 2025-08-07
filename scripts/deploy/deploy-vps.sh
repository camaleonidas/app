#!/bin/bash

echo "🚀 Iniciando deploy na VPS..."

# Variáveis
APP_NAME="mentoria-app"
APP_DIR="/home/$USER/apps/$APP_NAME"

# Atualizar código
echo "📦 Atualizando código..."
cd $APP_DIR
git pull

# Construir e reiniciar containers
echo "🏗️ Reconstruindo containers..."
docker-compose -f scripts/deploy/docker-compose.yml down
docker-compose -f scripts/deploy/docker-compose.yml up -d --build

# Limpar imagens antigas
echo "🧹 Limpando imagens não utilizadas..."
docker image prune -f

# Verificar status
echo "🔍 Verificando status da aplicação..."
sleep 5
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Aplicação está rodando!"
else
    echo "❌ Erro: Aplicação não está respondendo!"
    echo "📋 Logs do container:"
    docker-compose -f scripts/deploy/docker-compose.yml logs --tail=50
fi

# Verificar uso de disco
echo -e "\n💾 Uso de disco:"
df -h /

echo -e "\n✨ Deploy finalizado!"
