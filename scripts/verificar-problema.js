// 🔍 VERIFICAÇÃO BÁSICA - Vamos ver o que está acontecendo

console.log("🔍 VERIFICANDO PROBLEMAS...")
console.log("=".repeat(40))

// 1. Verificar Node.js
console.log("1. 📋 Informações do sistema:")
console.log("   Node.js:", process.version)
console.log("   Plataforma:", process.platform)

// 2. Tentar importar Supabase
console.log("\n2. 🔍 Testando Supabase...")
try {
  // Tentar importação básica
  console.log("   Tentando importar @supabase/supabase-js...")
  const supabaseModule = await import("@supabase/supabase-js")
  console.log("   ✅ Supabase importado com sucesso!")
  console.log("   Funções disponíveis:", Object.keys(supabaseModule))
} catch (error) {
  console.log("   ❌ ERRO ao importar Supabase:")
  console.log("   Erro:", error.message)
  console.log("   Código:", error.code)

  console.log("\n📦 SOLUÇÃO:")
  console.log("   O Supabase não está instalado ou há problema na instalação")
  console.log("   Você precisa instalar manualmente:")
  console.log("   npm install @supabase/supabase-js")
}

// 3. Verificar variáveis de ambiente
console.log("\n3. 🔍 Verificando variáveis de ambiente...")
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("   NEXT_PUBLIC_SUPABASE_URL:", url ? "✅ Configurada" : "❌ Não encontrada")
console.log("   NEXT_PUBLIC_SUPABASE_ANON_KEY:", key ? "✅ Configurada" : "❌ Não encontrada")

if (url) {
  console.log("   URL:", url.substring(0, 30) + "...")
}
if (key) {
  console.log("   Key:", key.substring(0, 30) + "...")
}

console.log("\n📋 DIAGNÓSTICO:")
if (!url || !key) {
  console.log("❌ Variáveis de ambiente não configuradas")
  console.log("✅ Mas isso não é problema - vamos usar as chaves diretas")
} else {
  console.log("✅ Variáveis de ambiente OK")
}
