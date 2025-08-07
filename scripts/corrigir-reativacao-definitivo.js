// Correção definitiva da reativação

console.log("🔧 CORREÇÃO DEFINITIVA - Reativação")
console.log("=".repeat(50))

// 1. Verificar dados atuais
const dados = JSON.parse(localStorage.getItem("agendamentos") || "[]")
console.log("📊 Total agendamentos:", dados.length)

dados.forEach((ag, index) => {
  console.log(`${index + 1}. ID: ${ag.id} | Status: ${ag.status} | Aluno: ${ag.alunoNome || ag.alunoId}`)
})

// 2. Encontrar agendamentos recusados
const recusados = dados.filter((ag) => ag.status === "recusado")
console.log("\n🔴 Agendamentos recusados:", recusados.length)

if (recusados.length > 0) {
  console.log("📋 Detalhes dos recusados:")
  recusados.forEach((ag, index) => {
    console.log(`  ${index + 1}. ID: ${ag.id}`)
    console.log(`     Status: ${ag.status}`)
    console.log(`     Motivo: ${ag.motivoRecusa || "Não informado"}`)
    console.log(`     Data: ${ag.data}`)
  })
}

// 3. Função de reativação corrigida
function reativarAgendamentoCorreto(agendamentoId) {
  console.log(`\n🔄 REATIVANDO: ${agendamentoId}`)

  try {
    // Carregar dados frescos
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]")
    console.log("📊 Dados carregados:", agendamentos.length)

    // Encontrar índice do agendamento
    const index = agendamentos.findIndex((ag) => ag.id === agendamentoId)

    if (index === -1) {
      console.error("❌ Agendamento não encontrado!")
      return false
    }

    console.log(`✅ Agendamento encontrado no índice: ${index}`)
    console.log(`📋 Status ANTES: ${agendamentos[index].status}`)

    // ATUALIZAR DIRETAMENTE
    agendamentos[index] = {
      ...agendamentos[index],
      status: "pendente",
      motivoRecusa: undefined,
      editHistory: [
        ...(agendamentos[index].editHistory || []),
        {
          data: new Date().toISOString(),
          acao: "Agendamento reativado",
          detalhes: `Reativado pelo mentor. Status alterado de 'recusado' para 'pendente'`,
          timestamp: new Date().toLocaleString(),
        },
      ],
    }

    console.log(`📋 Status DEPOIS: ${agendamentos[index].status}`)

    // Salvar no localStorage
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos))
    console.log("💾 Dados salvos no localStorage")

    // VERIFICAÇÃO IMEDIATA
    const verificacao = JSON.parse(localStorage.getItem("agendamentos") || "[]")
    const agendamentoVerificado = verificacao.find((ag) => ag.id === agendamentoId)

    console.log("🔍 VERIFICAÇÃO:")
    console.log(`   Status salvo: ${agendamentoVerificado?.status}`)
    console.log(`   Motivo removido: ${agendamentoVerificado?.motivoRecusa === undefined ? "✅" : "❌"}`)

    if (agendamentoVerificado?.status === "pendente") {
      console.log("🎉 REATIVAÇÃO CONFIRMADA!")

      // Disparar evento personalizado
      const evento = new CustomEvent("agendamentoReativado", {
        detail: { agendamentoId, novoStatus: "pendente" },
      })
      window.dispatchEvent(evento)

      // Disparar evento genérico também
      window.dispatchEvent(new CustomEvent("agendamentosCriados"))

      console.log("📡 Eventos disparados")
      return true
    } else {
      console.error("❌ FALHA NA VERIFICAÇÃO!")
      return false
    }
  } catch (error) {
    console.error("💥 ERRO:", error)
    return false
  }
}

// 4. Testar com agendamento existente
if (recusados.length > 0) {
  const primeiroRecusado = recusados[0]
  console.log(`\n🎯 TESTANDO com: ${primeiroRecusado.id}`)

  const resultado = reativarAgendamentoCorreto(primeiroRecusado.id)

  if (resultado) {
    console.log("\n✅ SUCESSO! Reativação funcionou!")

    // Verificar estatísticas após reativação
    const dadosAtualizados = JSON.parse(localStorage.getItem("agendamentos") || "[]")
    const novosRecusados = dadosAtualizados.filter((ag) => ag.status === "recusado")
    const novosPendentes = dadosAtualizados.filter((ag) => ag.status === "pendente")

    console.log("\n📊 ESTATÍSTICAS ATUALIZADAS:")
    console.log(`   Recusados: ${novosRecusados.length}`)
    console.log(`   Pendentes: ${novosPendentes.length}`)
  } else {
    console.log("\n❌ FALHA! Reativação não funcionou!")
  }
}

// 5. Disponibilizar função globalmente
window.reativarTeste = reativarAgendamentoCorreto

console.log("\n📝 COMANDOS DISPONÍVEIS:")
console.log("• reativarTeste('ID_DO_AGENDAMENTO') - Testar reativação")
console.log("\n✅ SCRIPT CONCLUÍDO!")
