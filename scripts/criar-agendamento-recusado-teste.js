// Script para criar um agendamento recusado para teste

console.log("🔧 CRIANDO AGENDAMENTO RECUSADO PARA TESTE")
console.log("=".repeat(50))

// Criar agendamento de teste
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
  assunto: "Teste de reativação - Desenvolvimento Web",
  telefone: "(11) 99999-9999",
  status: "recusado",
  motivoRecusa: "Conflito de horário - teste para verificar reativação",
  createdAt: new Date().toISOString(),
  editHistory: [
    {
      data: new Date().toISOString(),
      acao: "Agendamento criado para teste",
      detalhes: "Agendamento criado automaticamente para testar funcionalidade de reativação",
      timestamp: new Date().toLocaleString(),
    },
  ],
}

// Carregar agendamentos existentes
let agendamentosAtuais = []
try {
  const dadosExistentes = localStorage.getItem("agendamentos")
  if (dadosExistentes) {
    agendamentosAtuais = JSON.parse(dadosExistentes)
  }
} catch (error) {
  console.error("Erro ao carregar agendamentos existentes:", error)
}

// Verificar se já existe um agendamento de teste
const jaExisteTeste = agendamentosAtuais.some((ag) => ag.id.includes("teste-recusado"))

if (!jaExisteTeste) {
  // Adicionar agendamento de teste
  agendamentosAtuais.push(agendamentoTeste)

  // Salvar no localStorage
  localStorage.setItem("agendamentos", JSON.stringify(agendamentosAtuais))

  console.log("✅ Agendamento de teste criado:")
  console.log("   - ID:", agendamentoTeste.id)
  console.log("   - Status:", agendamentoTeste.status)
  console.log("   - Aluno:", agendamentoTeste.alunoNome)
  console.log("   - Data:", new Date(agendamentoTeste.data).toLocaleDateString())
  console.log("   - Horário:", agendamentoTeste.horario)
  console.log("   - Motivo recusa:", agendamentoTeste.motivoRecusa)

  // Disparar evento para atualizar interface
  window.dispatchEvent(new CustomEvent("agendamentosCriados"))

  console.log("🔔 Evento disparado para atualizar interface")
  console.log("✅ Agendamento de teste pronto para reativação!")
} else {
  console.log("ℹ️ Agendamento de teste já existe")

  // Mostrar agendamentos recusados existentes
  const recusados = agendamentosAtuais.filter((ag) => ag.status === "recusado")
  console.log(`📊 Total de agendamentos recusados: ${recusados.length}`)

  recusados.forEach((ag, index) => {
    console.log(`\n${index + 1}. ${ag.alunoNome || "Aluno"}`)
    console.log(`   - ID: ${ag.id}`)
    console.log(`   - Data: ${new Date(ag.data).toLocaleDateString()}`)
    console.log(`   - Horário: ${ag.horario}`)
    console.log(`   - Motivo: ${ag.motivoRecusa || "Não informado"}`)
  })
}

console.log("\n" + "=".repeat(50))
console.log("🎯 PRÓXIMOS PASSOS:")
console.log("1. Vá para o Dashboard do Mentor")
console.log("2. Procure a seção 'Agendamentos Recusados'")
console.log("3. Clique em 'Reativar' ou 'Editar'")
console.log("4. Verifique se a função está funcionando")
console.log("✅ TESTE PRONTO!")
