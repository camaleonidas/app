// Teste final da funcionalidade de reativação

console.log("🔧 TESTE FINAL - Reativação de Agendamentos")
console.log("=".repeat(50))

// 1. Verificar dados existentes
const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]")
console.log("📊 Total de agendamentos:", agendamentos.length)

const recusados = agendamentos.filter((ag) => ag.status === "recusado")
console.log("🔴 Agendamentos recusados:", recusados.length)

// 2. Criar agendamento recusado se não existir
if (recusados.length === 0) {
  console.log("➕ Criando agendamento recusado para teste...")

  const novoRecusado = {
    id: "teste-final-" + Date.now(),
    mentorId: "1",
    mentorNome: "João Mentor Silva",
    mentorEmail: "mentor@email.com",
    alunoId: "2",
    alunoNome: "Maria Aluna Santos",
    alunoEmail: "aluno@email.com",
    data: new Date(Date.now() + 86400000).toISOString(), // Amanhã
    horario: "15:00",
    assunto: "Teste final de reativação",
    status: "recusado",
    motivoRecusa: "Teste para verificar se a reativação funciona",
    createdAt: new Date().toISOString(),
  }

  agendamentos.push(novoRecusado)
  localStorage.setItem("agendamentos", JSON.stringify(agendamentos))
  console.log("✅ Agendamento recusado criado:", novoRecusado.id)
}

// 3. Função de reativação simplificada
function reativarSimples(agendamentoId) {
  console.log("\n🔄 Testando reativação simples para:", agendamentoId)

  try {
    // Carregar dados
    const dados = JSON.parse(localStorage.getItem("agendamentos") || "[]")
    console.log("📊 Dados carregados:", dados.length)

    // Encontrar agendamento
    const index = dados.findIndex((ag) => ag.id === agendamentoId)
    if (index === -1) {
      console.error("❌ Agendamento não encontrado")
      return false
    }

    console.log("✅ Agendamento encontrado no índice:", index)
    console.log("📋 Status atual:", dados[index].status)

    // Atualizar status
    dados[index].status = "pendente"
    dados[index].motivoRecusa = undefined

    // Salvar
    localStorage.setItem("agendamentos", JSON.stringify(dados))
    console.log("💾 Dados salvos")

    // Verificar se salvou
    const verificacao = JSON.parse(localStorage.getItem("agendamentos") || "[]")
    const agendamentoVerificacao = verificacao.find((ag) => ag.id === agendamentoId)

    if (agendamentoVerificacao && agendamentoVerificacao.status === "pendente") {
      console.log("✅ REATIVAÇÃO FUNCIONOU!")
      console.log("📋 Novo status:", agendamentoVerificacao.status)

      // Disparar evento
      window.dispatchEvent(new CustomEvent("agendamentosCriados"))
      console.log("📡 Evento disparado")

      return true
    } else {
      console.error("❌ REATIVAÇÃO FALHOU")
      return false
    }
  } catch (error) {
    console.error("❌ Erro na reativação:", error)
    return false
  }
}

// 4. Testar com agendamento recusado
const agendamentosAtuais = JSON.parse(localStorage.getItem("agendamentos") || "[]")
const recusadoParaTeste = agendamentosAtuais.find((ag) => ag.status === "recusado")

if (recusadoParaTeste) {
  console.log("\n🎯 Testando com agendamento:", recusadoParaTeste.id)
  const resultado = reativarSimples(recusadoParaTeste.id)

  if (resultado) {
    console.log("\n🎉 TESTE PASSOU! A reativação está funcionando.")
  } else {
    console.log("\n💥 TESTE FALHOU! A reativação não está funcionando.")
  }
} else {
  console.log("\n❌ Nenhum agendamento recusado encontrado para teste")
}

// 5. Função para testar no console
window.testarReativacao = (id) => reativarSimples(id)

console.log("\n📝 Para testar manualmente:")
console.log("1. Execute: testarReativacao('ID_DO_AGENDAMENTO')")
console.log("2. Ou use o ID do teste:", recusadoParaTeste?.id)

console.log("\n✅ TESTE CONCLUÍDO!")
