// Script para testar a conexão com sua nova conta Supabase

import { supabase, testarConexaoSupabase } from "../lib/supabase.js"

console.log("🧪 TESTANDO NOVA CONEXÃO SUPABASE")
console.log("=".repeat(50))

async function executarTestes() {
  console.log("\n1. 🔍 Verificando credenciais...")

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.log("❌ Credenciais não configuradas!")
    console.log("Configure as variáveis de ambiente primeiro.")
    return
  }

  console.log("✅ URL:", url.substring(0, 30) + "...")
  console.log("✅ Key:", key.substring(0, 20) + "...")

  console.log("\n2. 🔗 Testando conexão...")
  const conexaoOk = await testarConexaoSupabase()

  if (!conexaoOk) {
    console.log("❌ Falha na conexão!")
    console.log("Verifique se:")
    console.log("- As credenciais estão corretas")
    console.log("- As tabelas foram criadas")
    console.log("- O projeto Supabase está ativo")
    return
  }

  console.log("\n3. 📊 Verificando dados...")

  try {
    // Testar usuários
    const { data: usuarios, error: errorUsuarios } = await supabase
      .from("usuarios")
      .select("nome, email, tipo")
      .limit(5)

    if (errorUsuarios) {
      console.log("❌ Erro ao buscar usuários:", errorUsuarios.message)
    } else {
      console.log("✅ Usuários encontrados:", usuarios?.length || 0)
      usuarios?.forEach((u) => console.log(`   - ${u.nome} (${u.tipo})`))
    }

    // Testar agendamentos
    const { data: agendamentos, error: errorAgendamentos } = await supabase
      .from("agendamentos")
      .select("assunto, status")
      .limit(3)

    if (errorAgendamentos) {
      console.log("❌ Erro ao buscar agendamentos:", errorAgendamentos.message)
    } else {
      console.log("✅ Agendamentos encontrados:", agendamentos?.length || 0)
    }

    // Testar configurações
    const { data: configs, error: errorConfigs } = await supabase
      .from("configuracoes_mentores")
      .select("dia_semana, ativo")
      .limit(3)

    if (errorConfigs) {
      console.log("❌ Erro ao buscar configurações:", errorConfigs.message)
    } else {
      console.log("✅ Configurações encontradas:", configs?.length || 0)
    }
  } catch (error) {
    console.log("❌ Erro nos testes:", error.message)
  }

  console.log("\n🎉 TESTE CONCLUÍDO!")
  console.log("Se tudo está ✅, sua aplicação está pronta para usar!")
}

// Executar os testes
executarTestes().catch(console.error)
