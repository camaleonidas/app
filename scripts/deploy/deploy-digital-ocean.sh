#!/bin/bash

echo "🚀 Iniciando deploy para DigitalOcean..."

# Verificar se doctl está instalado
if ! command -v doctl &> /dev/null; then
    echo "❌ doctl não encontrado. Instale com:"
    echo "brew install doctl # Mac"
    echo "snap install doctl # Linux"
    exit 1
fi

# Verificar autenticação
doctl account get > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Não autenticado no DigitalOcean. Execute:"
    echo "doctl auth init"
    exit 1
fi

# Variáveis
APP_NAME="mentoria-app"
REGION="nyc1"

# Criar app
echo "📦 Criando aplicação no App Platform..."
doctl apps create \
    --spec app-spec.yaml \
    --wait

echo "✅ Deploy concluído!"
echo "🌍 Acesse o painel do DigitalOcean para ver a URL da sua aplicação"
