console.log("🔍 DEBUG COMPLETO - REATIVAÇÃO")
console.log("=".repeat(60))

// 1. Verificar dados atuais
const dados = localStorage.getItem("agendamentos")
console.log("📊 localStorage 'agendamentos' existe:", !!dados)

if (dados) {
  const agendamentos = JSON.parse(dados)
  console.log("📊 Total de agendamentos:", agendamentos.length)

  agendamentos.forEach((ag, index) => {
    console.log(`${index + 1}. ID: ${ag.id}`)
    console.log(`   Status: ${ag.status}`)
    console.log(`   Aluno: ${ag.alunoNome || ag.alunoId}`)
    console.log(`   Data: ${ag.data}`)
    console.log("   ---")
  })

  // Encontrar recusados
  const recusados = agendamentos.filter((ag) => ag.status === "recusado")
  console.log("\n🔴 AGENDAMENTOS RECUSADOS:", recusados.length)

  if (recusados.length > 0) {
    console.log("📋 Detalhes dos recusados:")
    recusados.forEach((ag, index) => {
      console.log(`  ${index + 1}. ID: ${ag.id} | Motivo: ${ag.motivoRecusa || "Não informado"}`)
    })

    // Testar reativação no primeiro recusado
    const primeiro = recusados[0]
    console.log(`\n🎯 TESTANDO REATIVAÇÃO: ${primeiro.id}`)

    // Função de teste super simples
    function testarReativacao(agendamentoId) {
      console.log(`\n🔄 INICIANDO TESTE: ${agendamentoId}`)

      try {
        // Passo 1: Carregar dados
        const dadosAtuais = JSON.parse(localStorage.getItem("agendamentos") || "[]")
        console.log("✅ Dados carregados:", dadosAtuais.length)

        // Passo 2: Encontrar agendamento
        const index = dadosAtuais.findIndex((ag) => ag.id === agendamentoId)
        console.log("✅ Índice encontrado:", index)

        if (index === -1) {
          console.error("❌ Agendamento não encontrado!")
          return false
        }

        // Passo 3: Mostrar status atual
        console.log("📋 Status ANTES:", dadosAtuais[index].status)

        // Passo 4: Alterar status
        dadosAtuais[index].status = "pendente"
        dadosAtuais[index].motivoRecusa = undefined

        console.log("📋 Status DEPOIS:", dadosAtuais[index].status)

        // Passo 5: Salvar
        localStorage.setItem("agendamentos", JSON.stringify(dadosAtuais))
        console.log("💾 Dados salvos")

        // Passo 6: Verificar se salvou
        const verificacao = JSON.parse(localStorage.getItem("agendamentos") || "[]")
        const agVerificado = verificacao.find((ag) => ag.id === agendamentoId)

        console.log("🔍 VERIFICAÇÃO:")
        console.log("   Status salvo:", agVerificado?.status)
        console.log("   Motivo removido:", agVerificado?.motivoRecusa === undefined)

        if (agVerificado?.status === "pendente") {
          console.log("🎉 SUCESSO! Reativação funcionou!")

          // Disparar evento
          window.dispatchEvent(new CustomEvent("agendamentosCriados"))
          console.log("📡 Evento disparado")

          return true
        } else {
          console.error("❌ FALHA! Status não foi alterado")
          return false
        }
      } catch (error) {
        console.error("💥 ERRO:", error)
        return false
      }
    }

    // Executar teste
    const resultado = testarReativacao(primeiro.id)

    if (resultado) {
      console.log("\n✅ TESTE PASSOU! A função funciona!")

      // Mostrar estatísticas atualizadas
      const dadosFinais = JSON.parse(localStorage.getItem("agendamentos") || "[]")
      const novosRecusados = dadosFinais.filter((ag) => ag.status === "recusado")
      const novosPendentes = dadosFinais.filter((ag) => ag.status === "pendente")

      console.log("\n📊 ESTATÍSTICAS ATUALIZADAS:")
      console.log(`   Recusados: ${novosRecusados.length}`)
      console.log(`   Pendentes: ${novosPendentes.length}`)
    } else {
      console.log("\n❌ TESTE FALHOU! Há um problema na função")
    }

    // Disponibilizar função globalmente
    window.reativarTeste = testarReativacao
    console.log("\n📝 Função disponível: reativarTeste('ID')")
  } else {
    console.log("ℹ️ Nenhum agendamento recusado encontrado")

    // Criar um agendamento recusado para teste
    console.log("\n🔧 Criando agendamento recusado para teste...")

    const agendamentoTeste = {
      id: `teste_recusado_${Date.now()}`,
      mentorEmail: "mentor@email.com",
      alunoId: "2",
      alunoNome: "Maria Aluna Santos",
      alunoEmail: "aluno@email.com",
      data: new Date().toISOString(),
      horario: "14:00",
      assunto: "Teste de reativação",
      status: "recusado",
      motivoRecusa: "Teste para debug",
      createdAt: new Date().toISOString(),
    }

    agendamentos.push(agendamentoTeste)
    localStorage.setItem("agendamentos", JSON.stringify(agendamentos))

    console.log("✅ Agendamento de teste criado:", agendamentoTeste.id)
    console.log("🔄 Execute o script novamente para testar")
  }
} else {
  console.log("❌ Nenhum dado encontrado no localStorage")

  // Criar dados básicos
  const dadosBasicos = [
    {
      id: `teste_recusado_${Date.now()}`,
      mentorEmail: "mentor@email.com",
      alunoId: "2",
      alunoNome: "Maria Aluna Santos",
      alunoEmail: "aluno@email.com",
      data: new Date().toISOString(),
      horario: "14:00",
      assunto: "Teste de reativação",
      status: "recusado",
      motivoRecusa: "Criado para teste",
      createdAt: new Date().toISOString(),
    },
  ]

  localStorage.setItem("agendamentos", JSON.stringify(dadosBasicos))
  console.log("✅ Dados básicos criados")
  console.log("🔄 Execute o script novamente")
}

console.log("\n" + "=".repeat(60))
console.log("✅ DEBUG COMPLETO FINALIZADO")
