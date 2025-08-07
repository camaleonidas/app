// 🧪 TESTE FINAL DO SUPABASE

console.log("🧪 TESTE FINAL DO SUPABASE")
console.log("=".repeat(40))

try {
  // Importar o cliente que criamos
  const { supabase, testarConexaoSupabase } = await import("../lib/supabase.js")

  console.log("1. ✅ Cliente Supabase importado!")

  // Testar a função de conexão
  console.log("2. 🔍 Testando conexão...")
  const sucesso = await testarConexaoSupabase()

  if (sucesso) {
    console.log("\n🎉 SUCESSO TOTAL!")
    console.log("✅ Supabase funcionando")
    console.log("✅ Banco de dados acessível")
    console.log("✅ Dados sendo retornados")

    console.log("\n🚀 PRÓXIMO PASSO:")
    console.log("Agora podemos usar o app com Supabase real!")
  } else {
    console.log("\n⚠️ Problema na conexão")
    console.log("Vamos usar dados mock por enquanto")
  }
} catch (error) {
  console.log("❌ Erro ao importar:", error.message)
  console.log("Vamos verificar o arquivo lib/supabase.ts")
}
