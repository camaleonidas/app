console.log("🔍 TESTANDO ESTRUTURA COMPLETA DO BANCO")
console.log("=".repeat(60))

// Importar funções do Supabase
import {
  buscarAgendamentosMentor,
  reativarAgendamento,
  testarConexaoSupabase,
  sincronizarComLocalStorage,
} from "../lib/supabase-agendamentos.js"

async function testarTudo() {
  try {
    // 1. Testar conexão
    console.log("1️⃣ Testando conexão com Supabase...")
    const conexao = await testarConexaoSupabase()
    console.log(conexao.success ? "✅" : "❌", conexao.message)

    if (!conexao.success) {
      console.log("❌ Não é possível continuar sem conexão")
      return
    }

    // 2. Buscar agendamentos do mentor
    console.log("\n2️⃣ Buscando agendamentos do mentor...")
    const mentorId = "ID_DO_MENTOR" // Será substituído pelo ID real
    const agendamentos = await buscarAgendamentosMentor(mentorId)

    if (agendamentos.success) {
      console.log("✅ Agendamentos encontrados:", agendamentos.data?.length)

      // Mostrar estatísticas
      const stats = {
        total: agendamentos.data?.length || 0,
        pendentes: agendamentos.data?.filter((a) => a.status === "pendente").length || 0,
        confirmados: agendamentos.data?.filter((a) => a.status === "confirmado").length || 0,
        recusados: agendamentos.data?.filter((a) => a.status === "recusado").length || 0,
      }

      console.log("📊 Estatísticas:", stats)

      // 3. Testar reativação se houver agendamentos recusados
      const recusados = agendamentos.data?.filter((a) => a.status === "recusado") || []

      if (recusados.length > 0) {
        console.log("\n3️⃣ Testando reativação...")
        const primeiro = recusados[0]
        console.log("🎯 Reativando agendamento:", primeiro.id)

        const resultado = await reativarAgendamento(primeiro.id, mentorId)

        if (resultado.success) {
          console.log("🎉 SUCESSO! Agendamento reativado:", resultado.message)

          // Verificar se realmente foi reativado
          const verificacao = await buscarAgendamentosMentor(mentorId)
          const agendamentoVerificado = verificacao.data?.find((a) => a.id === primeiro.id)

          console.log("🔍 Verificação - Novo status:", agendamentoVerificado?.status)
        } else {
          console.log("❌ FALHA na reativação:", resultado.error)
        }
      } else {
        console.log("\n3️⃣ Nenhum agendamento recusado para testar reativação")
      }

      // 4. Sincronizar com localStorage
      console.log("\n4️⃣ Sincronizando com localStorage...")
      await sincronizarComLocalStorage(mentorId)
      console.log("✅ Sincronização concluída")
    } else {
      console.log("❌ Erro ao buscar agendamentos:", agendamentos.error)
    }
  } catch (error) {
    console.error("💥 Erro crítico no teste:", error)
  }
}

// Executar teste
testarTudo()

console.log("\n" + "=".repeat(60))
console.log("✅ TESTE COMPLETO FINALIZADO")
