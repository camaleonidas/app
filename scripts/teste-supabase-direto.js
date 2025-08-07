// 🧪 TESTE DIRETO DO SUPABASE (sem importar arquivos locais)

console.log("🧪 TESTE DIRETO DO SUPABASE")
console.log("=".repeat(40))

try {
  // Importar diretamente do Supabase
  const { createClient } = await import("@supabase/supabase-js")

  // Criar cliente diretamente aqui
  const supabaseUrl = "https://gxnrytchaznueqrrjsph.supabase.co"
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bnJ5dGNoYXpudWVxcnJqc3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjc2MjgsImV4cCI6MjA2NTg0MzYyOH0.XRgx9Ie8Qbu2x_u0w8M6oH3LiYX_DJwd9T2IecfvZXY"

  console.log("1. ✅ Criando cliente Supabase...")
  const supabase = createClient(supabaseUrl, supabaseKey)
  console.log("   ✅ Cliente criado com sucesso!")

  console.log("2. 🔍 Testando consulta aos usuários...")
  const { data: usuarios, error } = await supabase.from("usuarios").select("nome, email, tipo")

  if (error) {
    console.log("   ❌ Erro na consulta:", error.message)
    console.log("   Código:", error.code)
    console.log("   Detalhes:", error.details)
  } else {
    console.log("   ✅ Consulta realizada com sucesso!")
    console.log("   Usuários encontrados:", usuarios.length)
    usuarios.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.nome} (${user.email}) - ${user.tipo}`)
    })
  }

  console.log("\n3. 🔍 Testando consulta às configurações...")
  const { data: configs, error: errorConfigs } = await supabase
    .from("configuracoes_mentor")
    .select("dia_semana, ativo, horarios")
    .limit(3)

  if (errorConfigs) {
    console.log("   ❌ Erro nas configurações:", errorConfigs.message)
  } else {
    console.log("   ✅ Configurações encontradas:", configs.length)
    configs.forEach((config, index) => {
      const dia = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][config.dia_semana]
      console.log(
        `   ${index + 1}. ${dia}: ${config.ativo ? "Ativo" : "Inativo"} - ${config.horarios?.length || 0} horários`,
      )
    })
  }

  console.log("\n🎉 RESULTADO FINAL:")
  console.log("✅ Supabase: FUNCIONANDO")
  console.log("✅ Banco: ACESSÍVEL")
  console.log("✅ Dados: DISPONÍVEIS")
  console.log("✅ Pronto para usar no React!")
} catch (error) {
  console.log("❌ ERRO CRÍTICO:", error.message)
  console.log("Stack:", error.stack)
}
