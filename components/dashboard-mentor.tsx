"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, AlertCircle, CheckCircle, XCircle, Video } from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useAuth } from "@/contexts/auth-context"
import { agendamentoJaPassou } from "@/lib/date-utils"

interface Agendamento {
  id: string
  mentorNome?: string
  mentorEmail?: string
  alunoId?: string
  aluno_id?: string
  alunoNome?: string
  alunoEmail?: string
  data: Date
  data_agendamento?: string
  horario: string
  assunto: string
  telefone?: string
  status: "confirmado" | "pendente" | "recusado" | "cancelado" | "finalizado"
  motivoRecusa?: string
  createdAt?: string
  mentor?: any
  aluno?: any
  link_call?: string
  call_adicionada_em?: string
  editHistory?: Array<{
    data: string
    acao: string
    detalhes: string
    timestamp: string
  }>
}

interface DashboardMentorProps {
  onNavigate: (page: string) => void
}

export function DashboardMentor({ onNavigate }: DashboardMentorProps) {
  const { user } = useAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [agendamentoEditando, setAgendamentoEditando] = useState<Agendamento | null>(null)
  const [modalAberto, setModalAberto] = useState(false)

  // Função para carregar agendamentos com prioridade para Supabase
  const carregarAgendamentos = () => {
    console.log("🔍 [DASHBOARD MENTOR] ==================== INÍCIO ====================")
    console.log("🔍 [DASHBOARD MENTOR] Usuário:", user)

    setIsLoading(true)

    try {
      // 1. Tentar carregar do Supabase primeiro
      const agendamentosSupabase = localStorage.getItem("agendamentos_supabase")
      const agendamentosLocal = localStorage.getItem("agendamentos")

      console.log("🔍 [DASHBOARD MENTOR] Supabase existe:", !!agendamentosSupabase)
      console.log("🔍 [DASHBOARD MENTOR] localStorage existe:", !!agendamentosLocal)

      let todosAgendamentos: any[] = []

      // Priorizar Supabase se disponível
      if (agendamentosSupabase) {
        try {
          const supabaseData = JSON.parse(agendamentosSupabase)
          console.log("✅ [DASHBOARD MENTOR] Dados do Supabase:", supabaseData.length)
          todosAgendamentos = supabaseData
        } catch (error) {
          console.error("❌ [DASHBOARD MENTOR] Erro ao parsear Supabase:", error)
        }
      }

      // Fallback para localStorage se Supabase não disponível
      if (todosAgendamentos.length === 0 && agendamentosLocal) {
        try {
          const localData = JSON.parse(agendamentosLocal)
          console.log("✅ [DASHBOARD MENTOR] Dados do localStorage:", localData.length)
          todosAgendamentos = localData
        } catch (error) {
          console.error("❌ [DASHBOARD MENTOR] Erro ao parsear localStorage:", error)
        }
      }

      // Processar agendamentos
      const agendamentosProcessados = todosAgendamentos.map((ag: any) => {
        // Determinar a data correta
        let dataAgendamento: Date
        if (ag.data_agendamento) {
          dataAgendamento = new Date(ag.data_agendamento)
        } else if (ag.data) {
          dataAgendamento = new Date(ag.data)
        } else {
          dataAgendamento = new Date()
        }

        // Determinar dados do aluno
        let alunoNome = "Aluno Desconhecido"
        let alunoEmail = "email@desconhecido.com"

        if (ag.aluno?.nome) {
          alunoNome = ag.aluno.nome
          alunoEmail = ag.aluno.email
        } else if (ag.alunoNome) {
          alunoNome = ag.alunoNome
          alunoEmail = ag.alunoEmail || "email@desconhecido.com"
        } else {
          // Mapear por ID conhecido
          const alunoId = ag.aluno_id || ag.alunoId
          if (alunoId === "4e8e22ac-fad1-4fcc-8b93-dfa3aead0ea8" || alunoId === "2") {
            alunoNome = "Maria Aluna Santos"
            alunoEmail = "aluno@email.com"
          } else if (alunoId === "3") {
            alunoNome = "Pedro Aluno Costa"
            alunoEmail = "pedro@email.com"
          }
        }

        const agendamentoProcessado = {
          ...ag,
          data: dataAgendamento,
          alunoNome,
          alunoEmail,
        }

        console.log(`🔄 [DASHBOARD MENTOR] Processado:`, {
          id: agendamentoProcessado.id,
          data: agendamentoProcessado.data,
          status: agendamentoProcessado.status,
          aluno: agendamentoProcessado.alunoNome,
        })

        return agendamentoProcessado
      })

      // Filtrar agendamentos do mentor atual
      const meusAgendamentos = agendamentosProcessados.filter((ag: any) => {
        // Para dados do Supabase, verificar mentor_id
        if (ag.mentor_id) {
          const isMeuAgendamento = ag.mentor_id === user?.id
          console.log(
            `🔍 [DASHBOARD MENTOR] Supabase - Agendamento ${ag.id}: mentor_id=${ag.mentor_id}, user.id=${user?.id}, isMine=${isMeuAgendamento}`,
          )
          return isMeuAgendamento
        }

        // Para dados do localStorage, verificar email do mentor
        if (ag.mentorEmail) {
          const isMeuAgendamento = ag.mentorEmail === user?.email
          console.log(
            `🔍 [DASHBOARD MENTOR] Local - Agendamento ${ag.id}: mentorEmail=${ag.mentorEmail}, user.email=${user?.email}, isMine=${isMeuAgendamento}`,
          )
          return isMeuAgendamento
        }

        // Se for mentor principal, mostrar todos (fallback)
        if (user?.email === "mentor@email.com") {
          console.log(`🔍 [DASHBOARD MENTOR] Mentor principal - incluindo agendamento ${ag.id}`)
          return true
        }

        return false
      })

      console.log("📊 [DASHBOARD MENTOR] Meus agendamentos filtrados:", meusAgendamentos.length)
      setAgendamentos(meusAgendamentos)
    } catch (error) {
      console.error("❌ [DASHBOARD MENTOR] Erro geral:", error)
      setAgendamentos([])
    } finally {
      setIsLoading(false)
    }

    console.log("🔍 [DASHBOARD MENTOR] ==================== FIM ====================")
  }

  // Carregar agendamentos quando o componente monta
  useEffect(() => {
    if (user) {
      carregarAgendamentos()
    }
  }, [user])

  // Escutar eventos de novos agendamentos
  useEffect(() => {
    const handleAgendamentosCriados = () => {
      console.log("🔔 [DASHBOARD MENTOR] Evento de agendamentos criados recebido")
      carregarAgendamentos()
    }

    window.addEventListener("agendamentosCriados", handleAgendamentosCriados)
    return () => window.removeEventListener("agendamentosCriados", handleAgendamentosCriados)
  }, [user])

  // Auto-refresh a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🔄 [DASHBOARD MENTOR] Auto-refresh...")
      carregarAgendamentos()
    }, 10000)

    return () => clearInterval(interval)
  }, [user])

  // FUNÇÃO DE REATIVAÇÃO CORRIGIDA - AGORA VAI PARA "CONFIRMADO"
  const reativarAgendamento = (agendamento: Agendamento) => {
    console.log("🚀 [REATIVAR] =".repeat(30))
    console.log("🚀 [REATIVAR] INICIANDO REATIVAÇÃO")
    console.log("🚀 [REATIVAR] ID:", agendamento.id)
    console.log("🚀 [REATIVAR] Status atual:", agendamento.status)

    // Função interna super simples
    const executarReativacao = () => {
      try {
        // 1. Carregar dados do localStorage
        const dadosString = localStorage.getItem("agendamentos")
        if (!dadosString) {
          throw new Error("Nenhum dado encontrado no localStorage")
        }

        const dados = JSON.parse(dadosString)
        console.log("✅ [REATIVAR] Dados carregados:", dados.length)

        // 2. Encontrar o agendamento
        const index = dados.findIndex((ag: any) => ag.id === agendamento.id)
        if (index === -1) {
          throw new Error("Agendamento não encontrado")
        }

        console.log("✅ [REATIVAR] Agendamento encontrado no índice:", index)
        console.log("📋 [REATIVAR] Status ANTES:", dados[index].status)

        // 3. Alterar o status para CONFIRMADO (não pendente)
        dados[index].status = "confirmado"
        dados[index].motivoRecusa = undefined

        console.log("📋 [REATIVAR] Status DEPOIS:", dados[index].status)

        // 4. Salvar de volta no localStorage
        localStorage.setItem("agendamentos", JSON.stringify(dados))
        console.log("💾 [REATIVAR] Dados salvos no localStorage")

        // 5. Verificação IMEDIATA
        const verificacao = JSON.parse(localStorage.getItem("agendamentos") || "[]")
        const agVerificado = verificacao.find((ag: any) => ag.id === agendamento.id)

        console.log("🔍 [REATIVAR] VERIFICAÇÃO IMEDIATA:")
        console.log("   Status verificado:", agVerificado?.status)
        console.log("   Motivo removido:", agVerificado?.motivoRecusa === undefined)

        if (agVerificado?.status !== "confirmado") {
          throw new Error("Falha na verificação - status não foi alterado")
        }

        console.log("🎉 [REATIVAR] SUCESSO CONFIRMADO!")

        // 6. Forçar atualização do estado React
        setTimeout(() => {
          console.log("🔄 [REATIVAR] Forçando reload dos dados...")
          carregarAgendamentos()
        }, 100)

        // 7. Disparar eventos
        window.dispatchEvent(new CustomEvent("agendamentosCriados"))
        console.log("📡 [REATIVAR] Evento disparado")

        // 8. Feedback para o usuário
        alert("✅ Agendamento reativado e confirmado com sucesso!")

        return true
      } catch (error) {
        console.error("💥 [REATIVAR] ERRO:", error)
        alert(`❌ Erro ao reativar: ${error.message}`)
        return false
      }
    }

    // Executar a reativação
    const resultado = executarReativacao()

    console.log("🚀 [REATIVAR] Resultado:", resultado ? "SUCESSO" : "FALHA")
    console.log("🚀 [REATIVAR] =".repeat(30))

    return resultado
  }

  // Função para editar agendamento recusado
  const editarAgendamentoRecusado = (agendamento: Agendamento) => {
    console.log("✏️ [EDITAR] Abrindo modal para:", agendamento.id)
    setAgendamentoEditando(agendamento)
    setModalAberto(true)
  }

  // Função para salvar edição do agendamento recusado
  const salvarEdicaoRecusado = (agendamentoAtualizado: Agendamento) => {
    console.log("💾 [SALVAR EDIÇÃO] Iniciando:", agendamentoAtualizado.id)

    try {
      // 1. Carregar dados atuais
      const dadosAtuais = JSON.parse(localStorage.getItem("agendamentos") || "[]")

      // 2. Atualizar agendamento específico
      const agendamentosAtualizados = dadosAtuais.map((ag: any) => {
        if (ag.id === agendamentoAtualizado.id) {
          return {
            ...agendamentoAtualizado,
            data: agendamentoAtualizado.data.toISOString(),
          }
        }
        return ag
      })

      // 3. Salvar
      localStorage.setItem("agendamentos", JSON.stringify(agendamentosAtualizados))

      // 4. Atualizar estado
      carregarAgendamentos()

      // 5. Disparar evento
      window.dispatchEvent(new CustomEvent("agendamentosCriados"))

      // 6. Fechar modal
      setModalAberto(false)
      setAgendamentoEditando(null)

      console.log("✅ [SALVAR EDIÇÃO] Concluído")
    } catch (error) {
      console.error("❌ [SALVAR EDIÇÃO] Erro:", error)
      alert("❌ Erro ao salvar alterações. Tente novamente.")
    }
  }

  const hoje = new Date()
  const agendamentosHoje = agendamentos.filter((ag) => isToday(ag.data))
  const agendamentosAmanha = agendamentos.filter((ag) => isTomorrow(ag.data))
  const agendamentosPendentes = agendamentos.filter((ag) => ag.status === "pendente")
  const agendamentosRecusados = agendamentos.filter((ag) => ag.status === "recusado")

  // CORRIGIR A LÓGICA DE SEPARAÇÃO USANDO A FUNÇÃO DE DATA+HORÁRIO
  const agendamentosAprovados = agendamentos.filter((ag) => {
    if (ag.status !== "confirmado") return false
    return !agendamentoJaPassou(ag.data, ag.horario)
  })

  const callsFeitas = agendamentos.filter((ag) => {
    if (ag.status === "finalizado") return true
    if (ag.status === "confirmado" && agendamentoJaPassou(ag.data, ag.horario)) return true
    return false
  })

  const proximosAgendamentos = agendamentosAprovados.sort((a, b) => a.data.getTime() - b.data.getTime()).slice(0, 5)

  const getDateLabel = (data: Date) => {
    if (isToday(data)) return "Hoje"
    if (isTomorrow(data)) return "Amanhã"
    return format(data, "dd/MM", { locale: ptBR })
  }

  console.log("📊 [DASHBOARD MENTOR] Estatísticas finais:")
  console.log(`   - Total: ${agendamentos.length}`)
  console.log(`   - Hoje: ${agendamentosHoje.length}`)
  console.log(`   - Amanhã: ${agendamentosAmanha.length}`)
  console.log(`   - Pendentes: ${agendamentosPendentes.length}`)
  console.log(`   - Recusados: ${agendamentosRecusados.length}`)
  console.log(`   - Aprovados: ${agendamentosAprovados.length}`)
  console.log(`   - Calls Feitas: ${callsFeitas.length}`)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Mentor</h1>
          <p className="text-gray-600 mt-2">Carregando agendamentos...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Mentor</h1>
          <p className="text-gray-600 mt-2">Gerencie seus agendamentos e configurações</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={carregarAgendamentos}>
            🔄 Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agendamentosHoje.length}</div>
            <p className="text-xs text-muted-foreground">agendamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amanhã</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agendamentosAmanha.length}</div>
            <p className="text-xs text-muted-foreground">agendamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{agendamentosPendentes.length}</div>
            <p className="text-xs text-muted-foreground">aguardando análise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{agendamentosAprovados.length}</div>
            <p className="text-xs text-muted-foreground">confirmados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls Feitas</CardTitle>
            <Video className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{callsFeitas.length}</div>
            <p className="text-xs text-muted-foreground">concluídas</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas - REORGANIZADAS */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gerencie seus agendamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Botão Analisar Solicitações - Azul no hover */}
            <Button
              onClick={() => onNavigate("solicitacoes")}
              variant="outline"
              className="h-20 flex flex-col gap-2 bg-white border-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
            >
              <AlertCircle className="h-6 w-6" />
              <span>Analisar Solicitações</span>
              {agendamentosPendentes.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {agendamentosPendentes.length} pendentes
                </Badge>
              )}
            </Button>

            {/* Botão Aprovados - Verde no hover */}
            <Button
              variant="outline"
              onClick={() => onNavigate("agendamentos-aprovados")}
              className="h-20 flex flex-col gap-2 bg-white border-gray-200 text-gray-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all duration-200"
            >
              <CheckCircle className="h-6 w-6" />
              <span>Aprovados</span>
              <span className="text-xs opacity-70">{agendamentosAprovados.length} confirmados</span>
            </Button>

            {/* Botão Calls Feitas - Roxo no hover */}
            <Button
              variant="outline"
              onClick={() => onNavigate("calls-feitas")}
              className="h-20 flex flex-col gap-2 bg-white border-gray-200 text-gray-700 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-200"
            >
              <Video className="h-6 w-6" />
              <span>Calls Feitas</span>
              <span className="text-xs opacity-70">{callsFeitas.length} concluídas</span>
            </Button>

            {/* Botão Recusados - Vermelho no hover */}
            <Button
              variant="outline"
              onClick={() => onNavigate("agendamentos-recusados")}
              className="h-20 flex flex-col gap-2 bg-white border-gray-200 text-gray-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
            >
              <XCircle className="h-6 w-6" />
              <span>Recusados</span>
              {agendamentosRecusados.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {agendamentosRecusados.length}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Próximos Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Agendamentos</CardTitle>
          <CardDescription>Suas próximas mentorias confirmadas</CardDescription>
        </CardHeader>
        <CardContent>
          {proximosAgendamentos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum agendamento confirmado próximo</p>
          ) : (
            <div className="space-y-4">
              {proximosAgendamentos.map((ag) => (
                <div key={ag.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <Badge variant="outline" className="mb-1">
                        {getDateLabel(ag.data)}
                      </Badge>
                      <span className="text-sm font-medium">{ag.horario}</span>
                    </div>
                    <div>
                      <p className="font-medium">{ag.alunoNome}</p>
                      <p className="text-sm text-gray-600">{ag.assunto}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ag.link_call && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        <Video className="h-3 w-3 mr-1" />
                        Call Pronta
                      </Badge>
                    )}
                    <Badge variant="default" className="bg-green-600">
                      Confirmado
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
