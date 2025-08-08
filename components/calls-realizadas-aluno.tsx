"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Video,
  Calendar,
  Clock,
  User,
  Mail,
  MessageSquare,
  Search,
  CheckCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Download,
  Star,
} from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/contexts/auth-context"

interface CallRealizada {
  id: string
  mentorNome: string
  mentorEmail: string
  data: Date
  horario: string
  assunto: string
  telefone?: string
  status: "finalizado"
  observacoes_mentor?: string
  finalizado_em: string
  link_gravacao?: string
  senha_gravacao?: string
  observacoes_gravacao?: string
  gravacao_adicionada_em?: string
  gravacao_adicionada_em?: string
}

export function CallsRealizadasAluno() {
  const { user } = useAuth()
  const [callsRealizadas, setCallsRealizadas] = useState<CallRealizada[]>([])
  const [callsFiltradas, setCallsFiltradas] = useState<CallRealizada[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [senhasVisiveis, setSenhasVisiveis] = useState<{ [key: string]: boolean }>({})

  // Carregar calls realizadas do aluno
  const carregarCallsRealizadas = () => {
    console.log("🎯 [CALLS ALUNO] Carregando calls realizadas...")

    if (!user) {
      console.log("❌ [CALLS ALUNO] Usuário não encontrado")
      return
    }

    try {
      const agendamentosSupabase = localStorage.getItem("agendamentos_supabase")
      const agendamentosLocal = localStorage.getItem("agendamentos")

      let todosAgendamentos: any[] = []

      if (agendamentosSupabase) {
        try {
          const supabaseData = JSON.parse(agendamentosSupabase)
          todosAgendamentos = supabaseData
        } catch (error) {
          console.error("Erro ao parsear Supabase:", error)
        }
      }

      if (todosAgendamentos.length === 0 && agendamentosLocal) {
        try {
          const localData = JSON.parse(agendamentosLocal)
          todosAgendamentos = localData
        } catch (error) {
          console.error("Erro ao parsear localStorage:", error)
        }
      }

      const callsProcessadas = todosAgendamentos
        .map((ag: any) => {
          let dataAgendamento: Date
          if (ag.data_agendamento) {
            dataAgendamento = new Date(ag.data_agendamento)
          } else if (ag.data) {
            dataAgendamento = new Date(ag.data)
          } else {
            dataAgendamento = new Date()
          }

          let mentorNome = "Mentor Desconhecido"
          let mentorEmail = "mentor@email.com"

          if (ag.mentor?.nome) {
            mentorNome = ag.mentor.nome
            mentorEmail = ag.mentor.email
          } else if (ag.mentorNome) {
            mentorNome = ag.mentorNome
            mentorEmail = ag.mentorEmail || "mentor@email.com"
          } else {
            mentorNome = "João Mentor Silva"
            mentorEmail = "mentor@email.com"
          }

          return {
            ...ag,
            data: dataAgendamento,
            mentorNome,
            mentorEmail,
          }
        })
        .filter((ag: any) => {
          // Filtrar apenas do aluno atual
          const isMyCall = (ag.aluno_id === user.id || ag.alunoId === user.id) && ag.status === "finalizado"
          console.log(
            `🔍 [CALLS ALUNO] Call ${ag.id}: alunoId=${ag.aluno_id || ag.alunoId}, user.id=${user.id}, isMine=${isMyCall}`,
          )
          return isMyCall
        })
        .sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())

      console.log("✅ [CALLS ALUNO] Calls encontradas:", callsProcessadas.length)
      setCallsRealizadas(callsProcessadas)
    } catch (error) {
      console.error("❌ [CALLS ALUNO] Erro ao carregar:", error)
      setCallsRealizadas([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      carregarCallsRealizadas()
    }
  }, [user])

  // Escutar eventos de atualizações
  useEffect(() => {
    const handleAgendamentosAtualizados = () => {
      console.log("🔔 [CALLS ALUNO] Evento de agendamentos atualizados recebido")
      setTimeout(() => carregarCallsRealizadas(), 500)
    }

    window.addEventListener("agendamentosCriados", handleAgendamentosAtualizados)
    return () => window.removeEventListener("agendamentosCriados", handleAgendamentosAtualizados)
  }, [user])

  // Filtrar por busca
  useEffect(() => {
    let filtradas = callsRealizadas

    if (busca) {
      filtradas = filtradas.filter(
        (call) =>
          call.mentorNome?.toLowerCase().includes(busca.toLowerCase()) ||
          call.mentorEmail?.toLowerCase().includes(busca.toLowerCase()) ||
          call.assunto?.toLowerCase().includes(busca.toLowerCase()),
      )
    }

    setCallsFiltradas(filtradas)
  }, [callsRealizadas, busca])

  const toggleSenhaVisivel = (callId: string) => {
    setSenhasVisiveis((prev) => ({
      ...prev,
      [callId]: !prev[callId],
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-gray-600 mt-2">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-purple-700">Minhas Calls Realizadas</h1>
        <p className="text-gray-600 mt-2">Histórico das suas mentorias concluídas com gravações disponíveis</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
              <CheckCircle className="h-5 w-5" />
              Total de Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{callsRealizadas.length}</div>
            <p className="text-sm text-gray-600">mentorias concluídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Com Gravação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {callsRealizadas.filter((call) => call.link_gravacao).length}
            </div>
            <p className="text-sm text-gray-600">gravações disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {
                callsRealizadas.filter(
                  (call) =>
                    call.data.getMonth() === new Date().getMonth() &&
                    call.data.getFullYear() === new Date().getFullYear(),
                ).length
              }
            </div>
            <p className="text-sm text-gray-600">calls este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filtradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{callsFiltradas.length}</div>
            <p className="text-sm text-gray-600">na busca atual</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por mentor, email ou assunto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Calls Realizadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {callsFiltradas.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {busca ? "Nenhuma call encontrada na busca" : "Nenhuma call realizada ainda"}
            </p>
            {!busca && <p className="text-sm text-gray-400">Suas mentorias concluídas aparecerão aqui</p>}
          </div>
        ) : (
          callsFiltradas.map((call) => (
            <Card key={call.id} className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    {call.mentorNome}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-purple-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Concluída
                    </Badge>
                    {call.link_gravacao && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <Video className="h-3 w-3 mr-1" />
                        Gravação
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{call.mentorEmail}</span>
                </div>

                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span>{format(call.data, "dd/MM/yyyy")}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span>{call.horario}</span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MessageSquare className="h-4 w-4 mt-0.5" />
                  <span className="line-clamp-2">{call.assunto}</span>
                </div>

                {call.finalizado_em && (
                  <div className="bg-purple-100 p-2 rounded border-l-4 border-purple-400">
                    <p className="text-xs text-purple-700">
                      <strong>Concluída em:</strong> {format(new Date(call.finalizado_em), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                  </div>
                )}

                {call.observacoes_mentor && (
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs text-blue-700">
                      <strong>Observações do Mentor:</strong> {call.observacoes_mentor}
                    </p>
                  </div>
                )}

                {/* Gravação Disponível */}
                {call.link_gravacao && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Video className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Gravação da Mentoria</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700 ml-auto">
                        <Star className="h-3 w-3 mr-1" />
                        Disponível
                      </Badge>
                    </div>

                    {call.observacoes_gravacao && (
                      <div className="mb-3 p-2 bg-green-100 rounded text-sm text-green-800">
                        <strong>Instruções:</strong> {call.observacoes_gravacao}
                      </div>
                    )}

                    {call.senha_gravacao && (
                      <div className="mb-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-yellow-800">Senha de Acesso:</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleSenhaVisivel(call.id)}
                            className="h-6 w-6 p-0"
                          >
                            {senhasVisiveis[call.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                        <code className="text-sm font-mono bg-yellow-100 px-2 py-1 rounded">
                          {senhasVisiveis[call.id] ? call.senha_gravacao : "••••••••"}
                        </code>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.open(call.link_gravacao, "_blank")}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Assistir Gravação
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(call.link_gravacao!)
                          alert("✅ Link copiado!")
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>

                    {call.gravacao_adicionada_em && (
                      <p className="text-xs text-green-600 mt-2">
                        Gravação disponibilizada em: {format(new Date(call.gravacao_adicionada_em), "dd/MM 'às' HH:mm")}
                      </p>
                    )}
                  </div>
                )}

                {/* Sem Gravação */}
                {!call.link_gravacao && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Video className="h-4 w-4" />
                      <span className="text-sm">Gravação não disponibilizada</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      O mentor ainda não adicionou o link da gravação desta call
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
