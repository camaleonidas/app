#!/bin/bash

echo "🚀 Iniciando deploy para AWS..."

# Verificar se AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI não encontrado. Instale com:"
    echo "pip install awscli"
    exit 1
fi

# Verificar se está logado na AWS
aws sts get-caller-identity > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Não autenticado na AWS. Execute:"
    echo "aws configure"
    exit 1
fi

# Variáveis
APP_NAME="mentoria-app"
REGION="us-east-1"
ECR_REPO="$APP_NAME"
CLUSTER_NAME="$APP_NAME-cluster"
SERVICE_NAME="$APP_NAME-service"

echo "📦 Criando repositório ECR..."
aws ecr create-repository --repository-name $ECR_REPO --region $REGION || true

# Login no ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$REGION.amazonaws.com

# Build e push da imagem
echo "🏗️ Building Docker image..."
docker build -t $APP_NAME ..
docker tag $APP_NAME:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest
docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest

echo "🚢 Criando cluster ECS..."
aws ecs create-cluster --cluster-name $CLUSTER_NAME || true

# Criar task definition
echo "📝 Criando task definition..."
cat > task-definition.json << EOF
{
    "family": "$APP_NAME",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
    "containerDefinitions": [{
        "name": "$APP_NAME",
        "image": "$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$REGION.amazonaws.com/$ECR_REPO:latest",
        "portMappings": [{
            "containerPort": 3000,
            "protocol": "tcp"
        }],
        "environment": [
            {
                "name": "NODE_ENV",
                "value": "production"
            }
        ],
        "logConfiguration": {
            "logDriver": "awslogs",
            "options": {
                "awslogs-group": "/ecs/$APP_NAME",
                "awslogs-region": "$REGION",
                "awslogs-stream-prefix": "ecs"
            }
        }
    }]
}
EOF

aws ecs register-task-definition --cli-input-json file://task-definition.json

# Criar ou atualizar serviço
echo "🔄 Atualizando serviço ECS..."
aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --task-definition $APP_NAME:$(aws ecs describe-task-definition --task-definition $APP_NAME --query 'taskDefinition.revision' --output text) \
    --desired-count 1 \
    --force-new-deployment || \
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name $SERVICE_NAME \
    --task-definition $APP_NAME \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxx],securityGroups=[sg-xxxxxx]}"

echo "✅ Deploy concluído!"
echo "🌍 Acesse a aplicação através do Load Balancer configurado no ECS"
