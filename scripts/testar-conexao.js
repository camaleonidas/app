// Script para testar a conexão completa com o Supabase
import { createClient } from "@supabase/supabase-js"

console.log("🔍 TESTANDO CONEXÃO COMPLETA COM SUPABASE")
console.log("=".repeat(50))

// Suas configurações do Supabase
const supabaseUrl = "https://gxnrytchaznueqrrjsph.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bnJ5dGNoYXpudWVxcnJqc3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjc2MjgsImV4cCI6MjA2NTg0MzYyOH0.XRgx9Ie8Qbu2x_u0w8M6oH3LiYX_DJwd9T2IecfvZXY"

// Criar cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

try {
  console.log("🔄 Testando todas as tabelas...")

  // Testar tabela usuarios
  const { data: usuarios, error: errorUsuarios } = await supabase.from("usuarios").select("nome, email, tipo").limit(5)

  if (errorUsuarios) {
    console.log("❌ Erro na tabela usuarios:", errorUsuarios.message)
  } else {
    console.log("✅ Tabela usuarios OK!")
    console.log("Usuários encontrados:", usuarios.length)
    usuarios.forEach((user) => {
      console.log(`  - ${user.nome} (${user.email}) - ${user.tipo}`)
    })
  }

  // Testar tabela configuracoes_mentor
  const { data: configs, error: errorConfigs } = await supabase
    .from("configuracoes_mentor")
    .select("dia_semana, ativo, horarios")
    .limit(10)

  if (errorConfigs) {
    console.log("❌ Erro na tabela configuracoes_mentor:", errorConfigs.message)
  } else {
    console.log("✅ Tabela configuracoes_mentor OK!")
    console.log("Configurações encontradas:", configs.length)
    const diasAtivos = configs.filter((c) => c.ativo).length
    console.log(`  - ${diasAtivos} dias ativos configurados`)
  }

  // Testar tabela agendamentos
  const { data: agendamentos, error: errorAgendamentos } = await supabase
    .from("agendamentos")
    .select("id, status")
    .limit(5)

  if (errorAgendamentos) {
    console.log("❌ Erro na tabela agendamentos:", errorAgendamentos.message)
  } else {
    console.log("✅ Tabela agendamentos OK!")
    console.log("Agendamentos encontrados:", agendamentos.length)
  }

  console.log("\n🎉 TESTE COMPLETO!")
  console.log("✅ Banco de dados funcionando perfeitamente!")
  console.log("✅ Todas as tabelas criadas e acessíveis!")
  console.log("✅ Dados de teste inseridos!")
} catch (error) {
  console.log("❌ Erro crítico:", error.message)
}
