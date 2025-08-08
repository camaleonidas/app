"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  CalendarIcon,
  CheckCircle,
  Mail,
  Phone,
  MessageSquare,
  AlertTriangle,
  User,
  Video,
  ExternalLink,
  Bell,
  ArrowLeft,
} from "lucide-react"
import { format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useAuth } from "@/contexts/auth-context"
import { useSupabaseSync } from "@/hooks/use-supabase-sync"
import { StatusConexao } from "@/components/status-conexao"
import { CallsRealizadasAluno } from "./calls-realizadas-aluno"

interface Agendamento {
  id: string
  mentorNome: string
  mentorEmail: string
  alunoId: string
  aluno_id?: string
  data: Date
  data_agendamento?: string
  horario: string
  assunto: string
  telefone?: string
  status: "confirmado" | "pendente" | "recusado"
  motivoRecusa?: string
  motivo_recusa?: string
  createdAt?: string
  created_at?: string
  link_call?: string
  call_adicionada_em?: string
}

interface HorarioConfig {
  dia: string
  diaSemana: number
  ativo: boolean
  horarios: string[]
}

export function AgendamentoAlunoCorrigido() {
  const { user } = useAuth()
  const { criarAgendamento, isOnline } = useSupabaseSync()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [showForm, setShowForm] = useState(false)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [configuracoesMentor, setConfiguracoesMentor] = useState<HorarioConfig[]>([])
  const [formData, setFormData] = useState({
    telefone: "",
    assunto: "",
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mostrarCallsRealizadas, setMostrarCallsRealizadas] = useState(false)

  // Carregar agendamentos do localStorage e Supabase
  const carregarAgendamentos = () => {
    console.log("🔍 [ALUNO] ==================== CARREGANDO AGENDAMENTOS ====================")
    console.log("🔍 [ALUNO] Usuário atual:", user)

    if (!user) {
      console.log("❌ [ALUNO] Usuário não encontrado")
      return
    }

    let todosAgendamentos: any[] = []

    // Carregar do Supabase primeiro
    const agendamentosSupabase = localStorage.getItem("agendamentos_supabase")
    if (agendamentosSupabase && isOnline) {
      try {
        const dadosSupabase = JSON.parse(agendamentosSupabase)
        console.log("📊 [ALUNO] Dados Supabase carregados:", dadosSupabase.length)
        todosAgendamentos = [...todosAgendamentos, ...dadosSupabase]
      } catch (error) {
        console.error("❌ [ALUNO] Erro ao parsear Supabase:", error)
      }
    }

    // Carregar do localStorage como backup
    const agendamentosLocal = localStorage.getItem("agendamentos")
    if (agendamentosLocal) {
      try {
        const dadosLocal = JSON.parse(agendamentosLocal)
        console.log("📊 [ALUNO] Dados localStorage carregados:", dadosLocal.length)

        // Adicionar apenas os que não existem no Supabase
        dadosLocal.forEach((agLocal: any) => {
          const existeNoSupabase = todosAgendamentos.find((ag) => ag.id === agLocal.id)
          if (!existeNoSupabase) {
            todosAgendamentos.push(agLocal)
          }
        })
      } catch (error) {
        console.error("❌ [ALUNO] Erro ao parsear localStorage:", error)
      }
    }

    console.log("📊 [ALUNO] Total de agendamentos carregados:", todosAgendamentos.length)

    // Processar e filtrar agendamentos
    const agendamentosProcessados = todosAgendamentos
      .map((ag: any) => {
        // Normalizar estrutura de dados
        const agProcessado = {
          id: ag.id,
          mentorNome: ag.mentorNome || ag.mentor_nome || "Mentor",
          mentorEmail: ag.mentorEmail || ag.mentor_email || "mentor@email.com",
          alunoId: ag.alunoId || ag.aluno_id,
          data: new Date(ag.data_agendamento || ag.data),
          horario: ag.horario,
          assunto: ag.assunto,
          telefone: ag.telefone || ag.aluno_telefone,
          status: ag.status,
          motivoRecusa: ag.motivoRecusa || ag.motivo_recusa,
          createdAt: ag.createdAt || ag.created_at,
          link_call: ag.link_call,
          call_adicionada_em: ag.call_adicionada_em,
        }

        console.log("🔄 [ALUNO] Processando agendamento:", {
          id: agProcessado.id,
          alunoId: agProcessado.alunoId,
          userId: user.id,
          status: agProcessado.status,
          data: agProcessado.data,
          hasCall: !!agProcessado.link_call,
        })

        return agProcessado
      })
      .filter((ag: any) => {
        // Filtrar apenas os agendamentos do usuário atual
        const isMyAgendamento = ag.alunoId === user.id || ag.alunoId === user.id.toString()
        console.log(
          `🔍 [ALUNO] Agendamento ${ag.id}: alunoId=${ag.alunoId}, user.id=${user.id}, isMine=${isMyAgendamento}`,
        )
        return isMyAgendamento
      })
      .sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())

    console.log("📊 [ALUNO] Meus agendamentos filtrados:", agendamentosProcessados.length)
    console.log("📋 [ALUNO] Detalhes dos meus agendamentos:", agendamentosProcessados)

    setAgendamentos(agendamentosProcessados)
    console.log("🔍 [ALUNO] ==================== FIM CARREGAMENTO ====================")
  }

  useEffect(() => {
    if (user) {
      carregarAgendamentos()
    }
  }, [user, isOnline])

  // Escutar eventos de novos agendamentos
  useEffect(() => {
    const handleAgendamentosCriados = () => {
      console.log("🔔 [ALUNO] Evento de agendamentos criados recebido")
      setTimeout(() => carregarAgendamentos(), 500)
    }

    window.addEventListener("agendamentosCriados", handleAgendamentosCriados)
    return () => window.removeEventListener("agendamentosCriados", handleAgendamentosCriados)
  }, [user])

  // Carregar configurações do mentor
  useEffect(() => {
    const configPadrao = [
      { dia: "Domingo", diaSemana: 0, ativo: false, horarios: [] },
      {
        dia: "Segunda-feira",
        diaSemana: 1,
        ativo: true,
        horarios: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30"],
      },
      {
        dia: "Terça-feira",
        diaSemana: 2,
        ativo: true,
        horarios: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30"],
      },
      {
        dia: "Quarta-feira",
        diaSemana: 3,
        ativo: true,
        horarios: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30"],
      },
      {
        dia: "Quinta-feira",
        diaSemana: 4,
        ativo: true,
        horarios: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30"],
      },
      {
        dia: "Sexta-feira",
        diaSemana: 5,
        ativo: true,
        horarios: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30"],
      },
      { dia: "Sábado", diaSemana: 6, ativo: false, horarios: [] },
    ]

    setConfiguracoesMentor(configPadrao)
  }, [])

  const verificarDisponibilidadeHorario = (horario: string) => {
    if (!selectedDate) return { disponivel: false, motivo: "Data não selecionada" }

    const agendamentosConfirmados = agendamentos.filter(
      (ag) => isSameDay(ag.data, selectedDate) && ag.status === "confirmado",
    )

    if (agendamentosConfirmados.length === 0) {
      const agendamentoPendente = agendamentos.find(
        (ag) =>
          isSameDay(ag.data, selectedDate) &&
          ag.horario === horario &&
          ag.alunoId === user?.id &&
          ag.status === "pendente",
      )

      if (agendamentoPendente) {
        return {
          disponivel: false,
          motivo: "Você já tem uma solicitação pendente neste horário",
        }
      }

      return { disponivel: true }
    }

    const conflitoExato = agendamentosConfirmados.find((ag) => ag.horario === horario)
    if (conflitoExato) {
      return {
        disponivel: false,
        motivo: "Horário já ocupado",
      }
    }

    return { disponivel: true }
  }

  const getHorariosDisponiveis = () => {
    if (!selectedDate) return []

    const diaSemana = selectedDate.getDay()
    const configDia = configuracoesMentor.find((config) => config.diaSemana === diaSemana)

    if (!configDia || !configDia.ativo) {
      return []
    }

    return configDia.horarios || []
  }

  const handleTimeSelect = (horario: string) => {
    const status = verificarDisponibilidadeHorario(horario)
    if (!status.disponivel) {
      alert(`❌ ${status.motivo}`)
      return
    }

    setSelectedTime(horario)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime || !user) return

    console.log("🚀 [ALUNO] Iniciando criação de agendamento...")
    console.log("📝 [ALUNO] Dados:", {
      user: user.id,
      data: selectedDate,
      horario: selectedTime,
      assunto: formData.assunto,
      telefone: formData.telefone,
    })

    const status = verificarDisponibilidadeHorario(selectedTime)
    if (!status.disponivel) {
      alert(`❌ ${status.motivo}`)
      return
    }

    setIsLoading(true)

    try {
      const sucesso = await criarAgendamento({
        alunoId: user.id,
        data: selectedDate,
        horario: selectedTime,
        assunto: formData.assunto,
        telefone: formData.telefone,
      })

      if (sucesso) {
        console.log("🎉 [ALUNO] Agendamento criado com sucesso!")

        setFormData({ telefone: "", assunto: "" })
        setShowForm(false)
        setSelectedTime("")
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)

        // Recarregar agendamentos imediatamente
        setTimeout(() => {
          carregarAgendamentos()
        }, 500)
      } else {
        alert("❌ Erro ao criar agendamento. Tente novamente.")
      }
    } catch (err) {
      console.error("❌ [ALUNO] Erro ao criar agendamento:", err)
      alert("❌ Erro ao criar agendamento. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const horarios = getHorariosDisponiveis()

  // Função para recarregar dados
  const recarregarDados = () => {
    console.log("🔄 [ALUNO] Recarregando dados manualmente...")
    carregarAgendamentos()
  }

  // Agendamentos com call disponível
  const agendamentosComCall = agendamentos.filter((ag) => ag.link_call && ag.status === "confirmado")

  if (mostrarCallsRealizadas) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-700">Minhas Calls Realizadas</h1>
            <p className="text-gray-600 mt-2">Histórico das suas mentorias concluídas</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setMostrarCallsRealizadas(false)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Agendamento
          </Button>
        </div>
        <CallsRealizadasAluno />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Botão Calls Realizadas - Destaque */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-purple-600 p-3 rounded-full">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-900">Minhas Calls Realizadas</h3>
                <p className="text-purple-700">Acesse o histórico das suas mentorias concluídas e gravações</p>
              </div>
            </div>
            <Button
              onClick={() => setMostrarCallsRealizadas(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-lg"
              size="lg"
            >
              <Video className="h-5 w-5 mr-2" />
              Acessar Calls
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Agendamento de Mentoria</h1>
        <p className="text-lg text-gray-600">
          Agende sua sessão de mentoria de forma rápida e fácil
          {!isOnline && " (Modo Offline - dados serão sincronizados quando conectar)"}
        </p>
      </div>

      {showSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                Agendamento realizado com sucesso!
                {isOnline ? " (Salvo no banco de dados)" : " (Salvo localmente - será sincronizado)"}
              </span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              {isOnline
                ? "O mentor já pode ver sua solicitação!"
                : "Será enviado ao mentor quando a conexão for restaurada."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Agendamentos com Call Disponível */}
      {agendamentosComCall.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Video className="h-5 w-5" />
              Calls Disponíveis ({agendamentosComCall.length})
            </CardTitle>
            <CardDescription className="text-blue-700">
              Seus agendamentos confirmados com link de videochamada disponível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agendamentosComCall
                .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
                .map((ag) => (
                  <Card key={ag.id} className="bg-white border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-blue-900">{ag.mentorNome}</p>
                          <p className="text-sm text-blue-700">
                            {format(ag.data, "dd/MM/yyyy")} às {ag.horario}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">
                          <Video className="h-3 w-3 mr-1" />
                          Call Pronta
                        </Badge>
                      </div>

                      <div className="bg-blue-100 p-3 rounded-lg mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Bell className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            O mentor estará online na data e horário marcados
                          </span>
                        </div>
                        <p className="text-xs text-blue-700">
                          Clique no botão abaixo para acessar a videochamada no horário agendado
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => window.open(ag.link_call, "_blank")}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Acessar Call
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-2 text-xs text-blue-600">
                        <strong>Assunto:</strong> {ag.assunto}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <Card className="xl:col-span-2 xl:col-start-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Selecione uma Data
            </CardTitle>
            <CardDescription>Escolha o dia para sua mentoria</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return date < today
              }}
              locale={ptBR}
              className="rounded-md border"
              formatters={{
                formatWeekdayName: (date) => {
                  const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
                  return weekdays[date.getDay()]
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Horários e Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {selectedDate ? format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
          </CardTitle>
          <CardDescription>Horários disponíveis para mentoria (1 hora cada sessão)</CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <p className="text-center text-gray-500 py-8">
              Selecione uma data no calendário para ver os horários disponíveis
            </p>
          ) : !showForm ? (
            <div className="space-y-4">
              {horarios.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">Mentor não disponível neste dia</p>
                  <p className="text-sm text-gray-400">Tente selecionar outro dia da semana</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {horarios.map((horario) => {
                    const status = verificarDisponibilidadeHorario(horario)
                    const isDisponivel = status.disponivel

                    return (
                      <div key={horario} className="relative group">
                        <Button
                          variant={isDisponivel ? "outline" : "secondary"}
                          disabled={!isDisponivel}
                          onClick={() => handleTimeSelect(horario)}
                          className={`h-12 w-full ${!isDisponivel ? "opacity-50" : "hover:bg-blue-50"}`}
                        >
                          {horario}
                          {!isDisponivel && <AlertTriangle className="h-3 w-3 text-red-500 ml-1" />}
                        </Button>
                        {!isDisponivel && status.motivo && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                            {status.motivo}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-medium text-blue-900">
                  Agendamento para {format(selectedDate, "dd/MM/yyyy")} às {selectedTime}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {isOnline ? "✅ Será salvo no banco de dados" : "⚠️ Será salvo localmente"}
                </p>
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="assunto">Assunto da mentoria *</Label>
                <Textarea
                  id="assunto"
                  required
                  value={formData.assunto}
                  onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                  placeholder="Descreva brevemente o que gostaria de discutir na mentoria..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Agendando..." : "Confirmar Agendamento"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setSelectedTime("")
                  }}
                >
                  Voltar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Meus Agendamentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Meus Agendamentos ({agendamentos.length})
              </CardTitle>
              <CardDescription>Histórico completo dos seus agendamentos de mentoria</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={recarregarDados}>
              🔄 Recarregar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {agendamentos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">Nenhum agendamento encontrado</p>
              <p className="text-sm text-gray-400">Seus agendamentos aparecerão aqui após serem criados</p>
              <Button variant="outline" size="sm" onClick={recarregarDados} className="mt-4">
                🔄 Verificar novamente
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agendamentos
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .map((ag) => (
                  <Card
                    key={ag.id}
                    className={`${
                      ag.status === "recusado"
                        ? "border-red-200 bg-red-50"
                        : ag.status === "confirmado"
                          ? "border-green-200 bg-green-50"
                          : "border-yellow-200 bg-yellow-50"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{ag.mentorNome}</CardTitle>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant={
                              ag.status === "confirmado"
                                ? "default"
                                : ag.status === "recusado"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {ag.status === "recusado"
                              ? "Recusado"
                              : ag.status === "confirmado"
                                ? "Confirmado"
                                : "Pendente"}
                          </Badge>
                          {ag.link_call && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              <Video className="h-3 w-3 mr-1" />
                              Call
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{ag.mentorEmail}</span>
                      </div>
                      {ag.telefone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{ag.telefone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(ag.data, "dd/MM/yyyy")} às {ag.horario}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MessageSquare className="h-4 w-4 mt-0.5" />
                        <span className="line-clamp-2">{ag.assunto}</span>
                      </div>

                      {/* Link da Call para Aluno */}
                      {ag.link_call && ag.status === "confirmado" && (
                        <div className="bg-blue-100 p-3 rounded-lg border border-blue-200 mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Video className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Call Disponível</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Bell className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-blue-700">O mentor estará online no horário marcado</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => window.open(ag.link_call, "_blank")}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            <ExternalLink className="h-3 w-3 mr-2" />
                            Acessar Videochamada
                          </Button>
                          {ag.call_adicionada_em && (
                            <p className="text-xs text-blue-600 mt-1">
                              Link adicionado em: {format(new Date(ag.call_adicionada_em), "dd/MM 'às' HH:mm")}
                            </p>
                          )}
                        </div>
                      )}

                      {ag.status === "recusado" && (ag.motivoRecusa || ag.motivo_recusa) && (
                        <div className="mt-2 p-2 bg-red-100 rounded border-l-4 border-red-400">
                          <p className="text-sm font-medium text-red-800">Motivo da recusa:</p>
                          <p className="text-sm text-red-700">{ag.motivoRecusa || ag.motivo_recusa}</p>
                        </div>
                      )}
                      {ag.createdAt && (
                        <div className="text-xs text-gray-400 mt-2">
                          Criado em: {format(new Date(ag.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
