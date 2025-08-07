// Script para te ajudar a configurar o Supabase

console.log("🚀 CONFIGURAÇÃO DO SUPABASE")
console.log("=".repeat(50))

console.log("\n📋 CHECKLIST - Faça na ordem:")

console.log("\n1. 🔗 COPIAR URL DO PROJETO:")
console.log("   - No Supabase, vá em Settings > General")
console.log("   - Copie a 'Reference ID' ou 'Project URL'")
console.log("   - Deve ser algo como: https://xxxxxxxxx.supabase.co")

console.log("\n2. 🔑 COPIAR CHAVE ANON:")
console.log("   - Na tela que você está (API Keys)")
console.log("   - Copie a chave 'anon public'")
console.log("   - É uma chave longa que começa com 'eyJ...'")

console.log("\n3. ⚙️ CONFIGURAR NO VERCEL:")
console.log("   - As variáveis já estão configuradas no seu projeto v0")
console.log("   - NEXT_PUBLIC_SUPABASE_URL")
console.log("   - NEXT_PUBLIC_SUPABASE_ANON_KEY")

console.log("\n4. 🗄️ CRIAR TABELAS:")
console.log("   - Execute o script SQL que criei")
console.log("   - Isso vai criar as tabelas para usuários e agendamentos")

console.log("\n📝 IMPORTANTE:")
console.log("- NÃO compartilhe a service_role key (a secreta)")
console.log("- Use apenas a anon/public key no frontend")
console.log("- As variáveis já estão configuradas no Vercel")

// Verificar se as variáveis estão disponíveis
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("\n🔍 STATUS ATUAL:")
console.log("URL configurada:", url ? "✅ SIM" : "❌ NÃO")
console.log("Key configurada:", key ? "✅ SIM" : "❌ NÃO")

if (url && key) {
  console.log("\n🎉 TUDO CONFIGURADO! Pode executar o próximo script.")
} else {
  console.log("\n⚠️  PRECISA CONFIGURAR as variáveis no Vercel")
}
