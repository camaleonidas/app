#!/bin/bash

echo "🚀 Monitoramento Mentoria App (DigitalOcean)"
echo "=========================================="

# Verificar status dos serviços
echo "📊 Status dos Serviços:"
services=("docker" "nginx")
for service in "${services[@]}"; do
    status=$(systemctl is-active $service)
    if [ "$status" = "active" ]; then
        echo "✅ $service: Rodando"
    else
        echo "❌ $service: Parado"
    fi
done

# Verificar uso de recursos
echo -e "\n💻 Uso de Recursos:"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}')%"
echo "RAM: $(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2}')"
echo "Disco: $(df -h / | awk 'NR==2{print $5}')"

# Verificar containers Docker
echo -e "\n🐳 Containers Docker:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Verificar logs da aplicação
echo -e "\n📜 Últimos Logs:"
docker-compose -f scripts/deploy/docker-compose.yml logs --tail=10

# Verificar certificado SSL
echo -e "\n🔒 Status SSL:"
certbot certificates | grep "Expiry Date"

# Verificar conexões
echo -e "\n🌐 Conexões Ativas:"
netstat -an | grep :80 | wc -l

# Verificar backups
echo -e "\n💾 Status dos Backups:"
if [ -d "/backup" ]; then
    ls -lh /backup | tail -n 5
else
    echo "❌ Diretório de backup não encontrado"
fi

# Verificar updates pendentes
echo -e "\n🔄 Updates Pendentes:"
apt list --upgradable | wc -l

echo -e "\n✨ Monitoramento Concluído!"
