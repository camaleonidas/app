/**
 * Verifica se um agendamento já passou considerando data + horário
 */
export function agendamentoJaPassou(data: Date, horario: string): boolean {
  try {
    console.log(`🕐 [DATE-UTILS] Verificando: ${data.toDateString()} ${horario}`)

    // Criar uma nova instância da data para não modificar a original
    const dataCompleta = new Date(data.getTime())

    // Parsear o horário (formato "HH:mm")
    const [horas, minutos] = horario.split(":").map(Number)

    // Validar horário
    if (isNaN(horas) || isNaN(minutos) || horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
      console.error(`❌ [DATE-UTILS] Horário inválido: ${horario}`)
      return false
    }

    // Definir o horário na data
    dataCompleta.setHours(horas, minutos, 0, 0)

    // Data atual
    const agora = new Date()

    // Verificar se já passou
    const jaPassou = dataCompleta.getTime() < agora.getTime()

    console.log(`🕐 [DATE-UTILS] Data completa: ${dataCompleta.toLocaleString()}`)
    console.log(`🕐 [DATE-UTILS] Agora: ${agora.toLocaleString()}`)
    console.log(`🕐 [DATE-UTILS] Já passou: ${jaPassou}`)
    console.log(
      `🕐 [DATE-UTILS] Diferença (min): ${Math.round((agora.getTime() - dataCompleta.getTime()) / (1000 * 60))}`,
    )

    return jaPassou
  } catch (error) {
    console.error("❌ [DATE-UTILS] Erro ao verificar horário:", error)
    // Em caso de erro, considerar como não passou para ser mais seguro
    return false
  }
}

/**
 * Verifica se um agendamento é para hoje considerando data + horário
 */
export function agendamentoEHoje(data: Date, horario: string): boolean {
  try {
    const hoje = new Date()
    const dataCompleta = new Date(data.getTime())
    const [horas, minutos] = horario.split(":").map(Number)

    if (isNaN(horas) || isNaN(minutos)) {
      return false
    }

    dataCompleta.setHours(horas, minutos, 0, 0)

    return (
      dataCompleta.getDate() === hoje.getDate() &&
      dataCompleta.getMonth() === hoje.getMonth() &&
      dataCompleta.getFullYear() === hoje.getFullYear()
    )
  } catch (error) {
    console.error("❌ [DATE-UTILS] Erro ao verificar se é hoje:", error)
    return false
  }
}

/**
 * Função de debug para mostrar informações detalhadas
 */
export function debugAgendamento(ag: any): void {
  console.log(`\n🔍 [DEBUG] Agendamento ${ag.id}:`)
  console.log(`   Status: ${ag.status}`)
  console.log(`   Data: ${ag.data}`)
  console.log(`   Horário: ${ag.horario}`)

  const jaPassou = agendamentoJaPassou(new Date(ag.data), ag.horario)
  console.log(`   Já passou: ${jaPassou}`)

  let categoria = "❓ Indefinido"
  if (ag.status === "finalizado") {
    categoria = "🟣 Calls Feitas (finalizado)"
  } else if (ag.status === "confirmado" && jaPassou) {
    categoria = "🟣 Calls Feitas (confirmado + passou)"
  } else if (ag.status === "confirmado" && !jaPassou) {
    categoria = "🟢 Aprovados (confirmado + futuro)"
  } else if (ag.status === "pendente") {
    categoria = "🟡 Pendentes"
  } else if (ag.status === "recusado") {
    categoria = "🔴 Recusados"
  }

  console.log(`   Categoria: ${categoria}`)
}
