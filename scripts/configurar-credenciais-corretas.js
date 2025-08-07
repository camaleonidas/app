console.log("🔧 CONFIGURANDO CREDENCIAIS CORRETAS DO SUPABASE...")

// Suas credenciais corretas
const SUPABASE_URL = "https://bmakppbboypkggrtxlkn.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYWtwcGJib3lwa2dncnR4bGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjcwNjcsImV4cCI6MjA2NTg0MzA2N30.o9yvioEiGrLuGk239lG_lXIWGU6s_vzKPK0lPfV08vU"

console.log("✅ CREDENCIAIS DEFINIDAS:")
console.log("URL:", SUPABASE_URL)
console.log("KEY:", SUPABASE_ANON_KEY.substring(0, 50) + "...")

// Testar conexão
console.log("\n🔄 TESTANDO CONEXÃO...")

try {
  const { createClient } = require("@supabase/supabase-js")
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  console.log("✅ Cliente Supabase criado com sucesso!")

  // Testar consulta
  supabase
    .from("usuarios")
    .select("count", { count: "exact" })
    .then(({ data, error, count }) => {
      if (error) {
        console.log("❌ ERRO:", error.message)
        console.log("💡 DICA: Verifique se as tabelas existem no Supabase")
      } else {
        console.log("✅ CONEXÃO FUNCIONANDO!")
        console.log("📊 Total de usuários:", count)
        console.log("🎉 SUPABASE CONECTADO COM SUCESSO!")
      }
    })
    .catch((err) => {
      console.log("❌ ERRO NA CONSULTA:", err.message)
    })
} catch (err) {
  console.log("❌ ERRO AO CRIAR CLIENTE:", err.message)
}

console.log("\n📋 PARA USAR NO PROJETO:")
console.log("NEXT_PUBLIC_SUPABASE_URL=" + SUPABASE_URL)
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY=" + SUPABASE_ANON_KEY)
