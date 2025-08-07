// 🔍 SCRIPT DE DEBUG - Vamos descobrir o que está acontecendo

console.log("🔍 DEBUGANDO O APP...")
console.log("=".repeat(50))

// 1. Verificar se o Supabase está funcionando
try {
  console.log("1. ✅ Testando importação do Supabase...")
  const { createClient } = await import("@supabase/supabase-js")
  console.log("   ✅ Supabase importado com sucesso!")

  // 2. Testar conexão
  const supabaseUrl = "https://gxnrytchaznueqrrjsph.supabase.co"
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bnJ5dGNoYXpudWVxcnJqc3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjc2MjgsImV4cCI6MjA2NTg0MzYyOH0.XRgx9Ie8Qbu2x_u0w8M6oH3LiYX_DJwd9T2IecfvZXY"

  const supabase = createClient(supabaseUrl, supabaseKey)
  console.log("   ✅ Cliente Supabase criado!")

  // 3. Testar consulta simples
  console.log("2. 🔍 Testando consulta ao banco...")
  const { data, error } = await supabase.from("usuarios").select("nome, email").limit(2)

  if (error) {
    console.log("   ❌ Erro na consulta:", error.message)
  } else {
    console.log("   ✅ Consulta funcionando!")
    console.log("   📊 Usuários encontrados:", data.length)
    data.forEach((user) => {
      console.log(`      - ${user.nome} (${user.email})`)
    })
  }
} catch (error) {
  console.log("❌ ERRO CRÍTICO:", error.message)
  console.log("📋 POSSÍVEIS CAUSAS:")
  console.log("   1. Supabase não instalado")
  console.log("   2. Problema de rede")
  console.log("   3. Configuração incorreta")
}

console.log("\n🔧 PRÓXIMOS PASSOS:")
console.log("1. Execute este script primeiro")
console.log("2. Me diga qual erro apareceu")
console.log("3. Vamos corrigir passo a passo")
