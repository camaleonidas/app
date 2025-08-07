// Script para diagnosticar problemas na reativação de agendamentos

console.log("🔍 DIAGNÓSTICO: Reativação de Agendamentos Recusados")
console.log("=".repeat(60))

// 1. Verificar estrutura dos dados no localStorage
console.log("\n1. VERIFICANDO DADOS NO LOCALSTORAGE:")
const agendamentosLocal = localStorage.getItem("agendamentos")
const agendamentosSupabase = localStorage.getItem("agendamentos_supabase")

if (agendamentosLocal) {
  try {
    const dados = JSON.parse(agendamentosLocal)
    console.log("✅ localStorage 'agendamentos' encontrado:", dados.length, "registros")

    // Verificar agendamentos recusados
    const recusados = dados.filter((ag) => ag.status === "recusado")
    console.log("🔴 Agendamentos recusados:", recusados.length)

    if (recusados.length > 0) {
      console.log("\n📋 ESTRUTURA DOS AGENDAMENTOS RECUSADOS:")
      recusados.forEach((ag, index) => {
        console.log(`\nAgendamento ${index + 1}:`)
        console.log("  - ID:", ag.id)
        console.log("  - Status:", ag.status)
        console.log("  - Data:", ag.data)
        console.log("  - Aluno:", ag.alunoNome || ag.aluno?.nome || "Nome não encontrado")
        console.log("  - Motivo recusa:", ag.motivoRecusa || "Não informado")
        console.log("  - Estrutura completa:", Object.keys(ag))
      })
    }
  } catch (error) {
    console.error("❌ Erro ao parsear localStorage:", error)
  }
} else {
  console.log("❌ localStorage 'agendamentos' não encontrado")
}

if (agendamentosSupabase) {
  try {
    const dados = JSON.parse(agendamentosSupabase)
    console.log("✅ localStorage 'agendamentos_supabase' encontrado:", dados.length, "registros")

    const recusados = dados.filter((ag) => ag.status === "recusado")
    console.log("🔴 Agendamentos recusados no Supabase:", recusados.length)
  } catch (error) {
    console.error("❌ Erro ao parsear Supabase localStorage:", error)
  }
} else {
  console.log("❌ localStorage 'agendamentos_supabase' não encontrado")
}

// 2. Criar agendamento recusado para teste se não existir
console.log("\n2. CRIANDO AGENDAMENTO RECUSADO PARA TESTE:")

const agendamentoTeste = {
  id: "teste-recusado-" + Date.now(),
  mentorId: "1",
  mentorNome: "João Mentor Silva",
  mentorEmail: "mentor@email.com",
  alunoId: "2",
  alunoNome: "Maria Aluna Santos",
  alunoEmail: "aluno@email.com",
  data: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
  horario: "14:00",
  assunto: "Teste de reativação de agendamento recusado",
  telefone: "(11) 99999-9999",
  status: "recusado",
  motivoRecusa: "Teste para verificar reativação",
  createdAt: new Date().toISOString(),
  editHistory: [],
}

// Adicionar ao localStorage
let agendamentosAtuais = []
if (agendamentosLocal) {
  try {
    agendamentosAtuais = JSON.parse(agendamentosLocal)
  } catch (error) {
    console.error("Erro ao parsear agendamentos existentes:", error)
  }
}

// Verificar se já existe um agendamento de teste
const jaExisteTeste = agendamentosAtuais.some((ag) => ag.id.includes("teste-recusado"))

if (!jaExisteTeste) {
  agendamentosAtuais.push(agendamentoTeste)
  localStorage.setItem("agendamentos", JSON.stringify(agendamentosAtuais))
  console.log("✅ Agendamento de teste criado:", agendamentoTeste.id)
} else {
  console.log("ℹ️ Agendamento de teste já existe")
}

// 3. Testar função de reativação
console.log("\n3. TESTANDO FUNÇÃO DE REATIVAÇÃO:")

function testarReativacao(agendamentoId) {
  console.log(`\n🔄 Testando reativação do agendamento: ${agendamentoId}`)

  try {
    // Carregar dados atuais
    const dadosAtuais = JSON.parse(localStorage.getItem("agendamentos") || "[]")
    console.log("📊 Total de agendamentos:", dadosAtuais.length)

    // Encontrar agendamento
    const agendamento = dadosAtuais.find((ag) => ag.id === agendamentoId)
    if (!agendamento) {
      console.error("❌ Agendamento não encontrado:", agendamentoId)
      return false
    }

    console.log("✅ Agendamento encontrado:")
    console.log("  - Status atual:", agendamento.status)
    console.log("  - Motivo recusa:", agendamento.motivoRecusa)

    // Reativar
    const agendamentosAtualizados = dadosAtuais.map((ag) => {
      if (ag.id === agendamentoId) {
        return {
          ...ag,
          status: "pendente",
          motivoRecusa: undefined,
          editHistory: [
            ...(ag.editHistory || []),
            {
              data: new Date().toISOString(),
              acao: "Agendamento reativado via diagnóstico",
              detalhes: `Reativado pelo sistema. Motivo anterior: ${ag.motivoRecusa || "Não informado"}`,
              timestamp: new Date().toLocaleString(),
            },
          ],
        }
      }
      return ag
    })

    // Salvar
    localStorage.setItem("agendamentos", JSON.stringify(agendamentosAtualizados))

    // Verificar se salvou
    const dadosVerificacao = JSON.parse(localStorage.getItem("agendamentos") || "[]")
    const agendamentoVerificacao = dadosVerificacao.find((ag) => ag.id === agendamentoId)

    if (agendamentoVerificacao && agendamentoVerificacao.status === "pendente") {
      console.log("✅ REATIVAÇÃO FUNCIONOU!")
      console.log("  - Novo status:", agendamentoVerificacao.status)
      console.log("  - Histórico adicionado:", agendamentoVerificacao.editHistory?.length || 0, "entradas")

      // Disparar evento
      window.dispatchEvent(new CustomEvent("agendamentosCriados"))
      console.log("✅ Evento 'agendamentosCriados' disparado")

      return true
    } else {
      console.error("❌ REATIVAÇÃO FALHOU - Status não mudou")
      return false
    }
  } catch (error) {
    console.error("❌ ERRO NA REATIVAÇÃO:", error)
    return false
  }
}

// Testar com agendamento de teste
const agendamentosParaTeste = JSON.parse(localStorage.getItem("agendamentos") || "[]")
const agendamentoRecusado = agendamentosParaTeste.find((ag) => ag.status === "recusado")

if (agendamentoRecusado) {
  console.log("🎯 Testando com agendamento recusado encontrado:", agendamentoRecusado.id)
  testarReativacao(agendamentoRecusado.id)
} else {
  console.log("❌ Nenhum agendamento recusado encontrado para teste")
}

// 4. Verificar eventos
console.log("\n4. VERIFICANDO EVENTOS:")
console.log("Adicionando listener para 'agendamentosCriados'...")

window.addEventListener("agendamentosCriados", (event) => {
  console.log("🔔 EVENTO RECEBIDO: agendamentosCriados", event)
})

// 5. Resumo e recomendações
console.log("\n" + "=".repeat(60))
console.log("📋 RESUMO DO DIAGNÓSTICO:")
console.log("1. Dados no localStorage:", !!agendamentosLocal ? "✅ OK" : "❌ FALTANDO")
console.log("2. Agendamentos recusados:", agendamentosParaTeste.filter((ag) => ag.status === "recusado").length)
console.log("3. Função de reativação:", "Testada acima")
console.log("4. Eventos:", "Listener adicionado")

console.log("\n🔧 PRÓXIMOS PASSOS:")
console.log("1. Verifique se os botões estão chamando as funções corretas")
console.log("2. Verifique se há erros no console do navegador")
console.log("3. Teste manualmente a reativação usando a função testarReativacao()")
console.log("4. Verifique se os componentes estão re-renderizando após mudanças")

console.log("\n✅ DIAGNÓSTICO CONCLUÍDO!")
