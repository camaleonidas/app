#!/bin/bash

echo "📊 Monitoramento da Aplicação"
echo "=============================="

# Verificar status do Docker
echo "🐳 Status do Docker:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Uso de recursos
echo -e "\n💻 Uso de Recursos:"
docker stats --no-stream $(docker ps --format "{{.Names}}")

# Verificar logs recentes
echo -e "\n📜 Logs Recentes:"
docker-compose -f scripts/deploy/docker-compose.yml logs --tail=20

# Verificar status do Nginx
echo -e "\n🌐 Status do Nginx:"
sudo systemctl status nginx | grep "Active:"

# Verificar certificado SSL
echo -e "\n🔒 Status do SSL:"
sudo certbot certificates

# Verificar uso de disco
echo -e "\n💾 Uso de Disco:"
df -h /

# Verificar memória
echo -e "\n🧠 Uso de Memória:"
free -h

# Verificar carga do sistema
echo -e "\n⚡ Carga do Sistema:"
uptime
