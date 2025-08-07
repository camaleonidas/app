console.log("🔍 VERIFICANDO CONFIGURAÇÃO SUPABASE COMPLETA...")

// Verificar variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("\n📋 CREDENCIAIS:")
console.log("URL:", supabaseUrl || "❌ NÃO DEFINIDA")
console.log("ANON KEY:", supabaseAnonKey ? "✅ DEFINIDA" : "❌ NÃO DEFINIDA")

// Verificar se as credenciais fornecidas estão corretas
const expectedUrl = "https://bmakppbboypkggrtxlkn.supabase.co"
const expectedKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYWtwcGJib3lwa2dncnR4bGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjcwNjcsImV4cCI6MjA2NTg0MzA2N30.o9yvioEiGrLuGk239lG_lXIWGU6s_vzKPK0lPfV08vU"

console.log("\n🎯 CREDENCIAIS ESPERADAS:")
console.log("URL esperada:", expectedUrl)
console.log("Key esperada:", expectedKey.substring(0, 50) + "...")

console.log("\n✅ CREDENCIAIS CORRETAS:")
console.log("URL correta:", supabaseUrl === expectedUrl ? "✅ SIM" : "❌ NÃO")
console.log("Key correta:", supabaseAnonKey === expectedKey ? "✅ SIM" : "❌ NÃO")

// Testar conexão se as credenciais estiverem definidas
if (supabaseUrl && supabaseAnonKey) {
  console.log("\n🔄 TESTANDO CONEXÃO...")

  try {
    // Importar e testar
    const { createClient } = require("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Testar consulta simples
    supabase
      .from("usuarios")
      .select("*")
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.log("❌ ERRO NA CONSULTA:", error.message)
        } else {
          console.log("✅ CONEXÃO FUNCIONANDO!")
          console.log("📊 Dados encontrados:", data?.length || 0, "registros")
        }
      })
      .catch((err) => {
        console.log("❌ ERRO CRÍTICO:", err.message)
      })
  } catch (err) {
    console.log("❌ ERRO AO CRIAR CLIENTE:", err.message)
  }
} else {
  console.log("\n⚠️ DEFINA AS VARIÁVEIS DE AMBIENTE PRIMEIRO!")
  console.log("NEXT_PUBLIC_SUPABASE_URL =", expectedUrl)
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY =", expectedKey)
}
