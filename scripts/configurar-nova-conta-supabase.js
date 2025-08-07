// Script para configurar sua nova conta do Supabase

console.log("🚀 CONFIGURAÇÃO DA SUA CONTA SUPABASE")
console.log("=".repeat(60))

console.log("\n📋 PASSO A PASSO:")

console.log("\n1. 🌐 ACESSE SEU SUPABASE:")
console.log("   - Vá para: https://supabase.com")
console.log("   - Faça login na sua conta")
console.log("   - Selecione seu projeto ou crie um novo")

console.log("\n2. 🔗 COPIAR URL DO PROJETO:")
console.log("   - No painel do Supabase, vá em Settings > General")
console.log("   - Copie a 'Project URL'")
console.log("   - Deve ser algo como: https://xxxxxxxxx.supabase.co")

console.log("\n3. 🔑 COPIAR CHAVE ANON:")
console.log("   - Vá em Settings > API")
console.log("   - Copie a chave 'anon public'")
console.log("   - É uma chave longa que começa com 'eyJ...'")

console.log("\n4. ⚙️ CONFIGURAR NO VERCEL:")
console.log("   - No v0, clique em 'Add Integration' > Supabase")
console.log("   - Cole a URL e a chave anon")
console.log("   - Ou configure manualmente as variáveis:")
console.log("     * NEXT_PUBLIC_SUPABASE_URL")
console.log("     * NEXT_PUBLIC_SUPABASE_ANON_KEY")

console.log("\n5. 🗄️ CRIAR TABELAS:")
console.log("   - Execute o script SQL que vou criar")
console.log("   - Isso vai criar todas as tabelas necessárias")

console.log("\n⚠️ IMPORTANTE:")
console.log("- Use apenas a chave 'anon/public', nunca a 'service_role'")
console.log("- A URL deve terminar com '.supabase.co'")
console.log("- Não compartilhe suas credenciais")

console.log("\n🎯 PRÓXIMOS PASSOS:")
console.log("1. Configure as credenciais")
console.log("2. Execute o script de criação das tabelas")
console.log("3. Teste a conexão")

// Verificar se as variáveis estão disponíveis
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("\n🔍 STATUS ATUAL:")
console.log("URL configurada:", url ? "✅ SIM" : "❌ NÃO")
console.log("Key configurada:", key ? "✅ SIM" : "❌ NÃO")

if (url && key) {
  console.log("\n🎉 CREDENCIAIS CONFIGURADAS!")
  console.log("Agora execute o script de criação das tabelas.")
} else {
  console.log("\n⚠️ CONFIGURE AS CREDENCIAIS PRIMEIRO")
  console.log("Use a integração do Supabase no v0 ou configure manualmente.")
}
