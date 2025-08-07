// Vamos verificar se tudo está configurado corretamente

console.log("🔍 VERIFICANDO CONFIGURAÇÃO DO SUPABASE")
console.log("=".repeat(50))

// Suas informações do Supabase
const SUPABASE_URL = "https://gxnrytchaznueqrrjsph.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bnJ5dGNoYXpudWVxcnJqc3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjc2MjgsImV4cCI6MjA2NTg0MzYyOH0.XRgx9Ie8Qbu2x_u0w8M6oH3LiYX_DJwd9T2IecfvZXY"

console.log("✅ URL do Projeto:", SUPABASE_URL)
console.log("✅ Chave Anon:", SUPABASE_ANON_KEY.substring(0, 50) + "...")

// Verificar variáveis de ambiente do Vercel
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("\n🔍 VARIÁVEIS DE AMBIENTE:")
console.log("NEXT_PUBLIC_SUPABASE_URL:", envUrl ? "✅ Configurada" : "❌ Não configurada")
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", envKey ? "✅ Configurada" : "❌ Não configurada")

if (envUrl && envKey) {
  console.log("\n🎉 PERFEITO! Tudo configurado corretamente!")
  console.log("Agora você pode executar o script para criar as tabelas.")
} else {
  console.log("\n⚠️ As variáveis de ambiente já estão configuradas no Vercel")
  console.log("Vamos usar as suas chaves diretamente no código")
}

console.log("\n📋 PRÓXIMOS PASSOS:")
console.log("1. ✅ Chaves copiadas - FEITO!")
console.log("2. 🗄️ Criar tabelas no banco - PRÓXIMO PASSO")
console.log("3. 🧪 Testar conexão - DEPOIS")
console.log("4. 🔄 Integrar com o app - FINAL")
