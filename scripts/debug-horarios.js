console.log("🔍 [DEBUG HORÁRIOS] Iniciando análise detalhada...")

// Função para verificar se agendamento já passou (cópia da lógica)
function agendamentoJaPassou(data, horario) {
  try {
    console.log(`\n📅 Analisando: ${data} às ${horario}`)

    // Criar uma data completa combinando data + horário
    const dataCompleta = new Date(data)
    console.log(`   Data original: ${dataCompleta.toString()}`)

    // Parsear o horário (formato "HH:mm")
    const [horas, minutos] = horario.split(":").map(Number)
    console.log(`   Horas: ${horas}, Minutos: ${minutos}`)

    // Definir o horário na data
    dataCompleta.setHours(horas, minutos, 0, 0)
    console.log(`   Data completa: ${dataCompleta.toString()}`)

    // Data atual
    const agora = new Date()
    console.log(`   Agora: ${agora.toString()}`)

    // Verificar se já passou
    const jaPassou = dataCompleta < agora
    console.log(`   Já passou: ${jaPassou}`)
    console.log(`   Diferença em minutos: ${(agora - dataCompleta) / (1000 * 60)}`)

    return jaPassou
  } catch (error) {
    console.error("❌ Erro ao verificar horário:", error)
    return false
  }
}

// Carregar agendamentos
const agendamentosLocal = localStorage.getItem("agendamentos")
const agendamentosSupabase = localStorage.getItem("agendamentos_supabase")

console.log("\n📊 DADOS DISPONÍVEIS:")
console.log("localStorage:", !!agendamentosLocal)
console.log("Supabase backup:", !!agendamentosSupabase)

let todosAgendamentos = []

if (agendamentosSupabase) {
  try {
    todosAgendamentos = JSON.parse(agendamentosSupabase)
    console.log("✅ Usando dados do Supabase:", todosAgendamentos.length)
  } catch (error) {
    console.error("❌ Erro ao parsear Supabase:", error)
  }
}

if (todosAgendamentos.length === 0 && agendamentosLocal) {
  try {
    todosAgendamentos = JSON.parse(agendamentosLocal)
    console.log("✅ Usando dados do localStorage:", todosAgendamentos.length)
  } catch (error) {
    console.error("❌ Erro ao parsear localStorage:", error)
  }
}

console.log("\n🔍 ANÁLISE DETALHADA DOS AGENDAMENTOS:")

todosAgendamentos.forEach((ag, index) => {
  console.log(`\n--- AGENDAMENTO ${index + 1} ---`)
  console.log(`ID: ${ag.id}`)
  console.log(`Status: ${ag.status}`)
  console.log(`Data original: ${ag.data || ag.data_agendamento}`)
  console.log(`Horário: ${ag.horario}`)

  // Processar data
  let dataAgendamento
  if (ag.data_agendamento) {
    dataAgendamento = new Date(ag.data_agendamento)
  } else if (ag.data) {
    dataAgendamento = new Date(ag.data)
  } else {
    dataAgendamento = new Date()
  }

  console.log(`Data processada: ${dataAgendamento.toString()}`)

  // Verificar se já passou
  const jaPassou = agendamentoJaPassou(dataAgendamento, ag.horario)

  // Classificação
  let classificacao = "❓ Indefinido"
  if (ag.status === "finalizado") {
    classificacao = "🟣 Calls Feitas (finalizado)"
  } else if (ag.status === "confirmado" && jaPassou) {
    classificacao = "🟣 Calls Feitas (confirmado + passou)"
  } else if (ag.status === "confirmado" && !jaPassou) {
    classificacao = "🟢 Aprovados (confirmado + futuro)"
  } else if (ag.status === "pendente") {
    classificacao = "🟡 Pendentes"
  } else if (ag.status === "recusado") {
    classificacao = "🔴 Recusados"
  }

  console.log(`CLASSIFICAÇÃO: ${classificacao}`)
})

console.log("\n⏰ HORA ATUAL:")
console.log(new Date().toString())

console.log("\n🔍 [DEBUG HORÁRIOS] Análise concluída!")
