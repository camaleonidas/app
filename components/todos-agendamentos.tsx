"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Search, Filter, Eye, Video, ExternalLink, MessageSquare, Phone, Mail } from "lucide-react"
import { format, isToday, isTomorrow, isPast } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useAuth } from "@/contexts/auth-context"
import { ModalAdicionarLinkCall } from "./modal-adicionar-link-call"

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
  status: "confirmado" | "pendente" | "recusado" | "cancelado"
  motivoRecusa?: string
  createdAt?: string
  mentor?: any
  aluno?: any
  link_call?: string
  call_adicionada_em?: string
}

interface TodosAgendamentosProps {
  onNavigate: (page: string) => void
}

export function TodosAgendamentos({ onNavigate }: TodosAgendamentosProps) {
  const { user } = useAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState<Agendamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null)
  const [modalLinkCallAberto, setModalLinkCallAberto] = useState(false)

  // Carregar agendamentos
  const carregarAgendamentos = () => {
    console.log("🔍 [TODOS AGENDAMENTOS] Carregando agendamentos...")

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

      const agendamentosProcessados = todosAgendamentos
        .map((ag: any) => {
          let dataAgendamento: Date
          if (ag.data_agendamento) {
            dataAgendamento = new Date(ag.data_agendamento)
          } else if (ag.data) {
            dataAgendamento = new Date(ag.data)
          } else {
            dataAgendamento = new Date()
          }

          let alunoNome = "Aluno Desconhecido"
          let alunoEmail = "email@desconhecido.com"

          if (ag.aluno?.nome) {
            alunoNome = ag.aluno.nome
            alunoEmail = ag.aluno.email
          } else if (ag.alunoNome) {
            alunoNome = ag.alunoNome
            alunoEmail = ag.alunoEmail || "email@desconhecido.com"
          } else {
            const alunoId = ag.aluno_id || ag.alunoId
            if (alunoId === "4e8e22ac-fad1-4fcc-8b93-dfa3aead0ea8" || alunoId === "2") {
              alunoNome = "Maria Aluna Santos"
              alunoEmail = "aluno@email.com"
            } else if (alunoId === "3") {
              alunoNome = "Pedro Aluno Costa"
              alunoEmail = "pedro@email.com"
            }
          }

          return {
            ...ag,
            data: dataAgendamento,
            alunoNome,
            alunoEmail,
          }
        })
        .filter((ag: any) => {
          if (ag.mentor_id) {
            return ag.mentor_id === user?.id
          }
          if (ag.mentorEmail) {
            return ag.mentorEmail === user?.email
          }
          if (user?.email === "mentor@email.com") {
            return true
          }
          return false
        })
        .sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())

      setAgendamentos(agendamentosProcessados)
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error)
      setAgendamentos([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      carregarAgendamentos()
    }
  }, [user])

  // Filtrar agendamentos
  useEffect(() => {
    let filtrados = agendamentos

    if (busca) {
      filtrados = filtrados.filter(
        (ag) =>
          ag.alunoNome?.toLowerCase().includes(busca.toLowerCase()) ||
          ag.alunoEmail?.toLowerCase().includes(busca.toLowerCase()) ||
          ag.assunto?.toLowerCase().includes(busca.toLowerCase()),
      )
    }

    if (filtroStatus !== "todos") {
      filtrados = filtrados.filter((ag) => ag.status === filtroStatus)
    }

    setAgendamentosFiltrados(filtrados)
  }, [agendamentos, busca, filtroStatus])

  // Função para adicionar link da call
  const adicionarLinkCall = async (agendamentoId: string, linkCall: string): Promise<boolean> => {
    try {
      console.log("📹 [LINK CALL] Adicionando link:", { agendamentoId, linkCall })

      // Atualizar no localStorage
      const dadosAtuais = JSON.parse(localStorage.getItem("agendamentos") || "[]")
      const agendamentosAtualizados = dadosAtuais.map((ag: any) => {
        if (ag.id === agendamentoId) {
          return {
            ...ag,
            link_call: linkCall,
            call_adicionada_em: new Date().toISOString(),
            call_adicionada_por: user?.id,
          }
        }
        return ag
      })

      localStorage.setItem("agendamentos", JSON.stringify(agendamentosAtualizados))

      // Atualizar também no Supabase backup se existir
      const supabaseData = localStorage.getItem("agendamentos_supabase")
      if (supabaseData) {
        const dadosSupabase = JSON.parse(supabaseData)
        const dadosSupabaseAtualizados = dadosSupabase.map((ag: any) => {
          if (ag.id === agendamentoId) {
            return {
              ...ag,
              link_call: linkCall,
              call_adicionada_em: new Date().toISOString(),
              call_adicionada_por: user?.id,
            }
          }
          return ag
        })
        localStorage.setItem("agendamentos_supabase", JSON.stringify(dadosSupabaseAtualizados))
      }

      // Recarregar dados
      carregarAgendamentos()

      // Disparar evento
      window.dispatchEvent(new CustomEvent("agendamentosCriados"))

      return true
    } catch (error) {
      console.error("Erro ao adicionar link da call:", error)
      return false
    }
  }

  // Função para remover link da call
  const removerLinkCall = async (agendamentoId: string): Promise<boolean> => {
    try {
      console.log("🗑️ [LINK CALL] Removendo link:", agendamentoId)

      // Atualizar no localStorage
      const dadosAtuais = JSON.parse(localStorage.getItem("agendamentos") || "[]")
      const agendamentosAtualizados = dadosAtuais.map((ag: any) => {
        if (ag.id === agendamentoId) {
          const { link_call, call_adicionada_em, call_adicionada_por, ...resto } = ag
          return resto
        }
        return ag
      })

      localStorage.setItem("agendamentos", JSON.stringify(agendamentosAtualizados))

      // Atualizar também no Supabase backup se existir
      const supabaseData = localStorage.getItem("agendamentos_supabase")
      if (supabaseData) {
        const dadosSupabase = JSON.parse(supabaseData)
        const dadosSupabaseAtualizados = dadosSupabase.map((ag: any) => {
          if (ag.id === agendamentoId) {
            const { link_call, call_adicionada_em, call_adicionada_por, ...resto } = ag
            return resto
          }
          return ag
        })
        localStorage.setItem("agendamentos_supabase", JSON.stringify(dadosSupabaseAtualizados))
      }

      // Recarregar dados
      carregarAgendamentos()

      // Disparar evento
      window.dispatchEvent(new CustomEvent("agendamentosCriados"))

      return true
    } catch (error) {
      console.error("Erro ao remover link da call:", error)
      return false
    }
  }

  const getDateLabel = (data: Date) => {
    if (isToday(data)) return "Hoje"
    if (isTomorrow(data)) return "Amanhã"
    if (isPast(data)) return "Passado"
    return format(data, "dd/MM", { locale: ptBR })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado":
        return "bg-green-100 text-green-800 border-green-200"
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "recusado":
        return "bg-red-100 text-red-800 border-red-200"
      case "cancelado":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Todos os Agendamentos</h1>
          <p className="text-gray-600 mt-2">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Todos os Agendamentos</h1>
          <p className="text-gray-600 mt-2">Visualize e gerencie todos os seus agendamentos</p>
        </div>
        <Button variant="outline" onClick={() => onNavigate("agenda")}>
          ← Voltar ao Dashboard
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou assunto..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {["todos", "pendente", "confirmado", "recusado"].map((status) => (
                <Button
                  key={status}
                  variant={filtroStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroStatus(status)}
                >
                  {status === "todos" ? "Todos" : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agendamentosFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-2">Nenhum agendamento encontrado</p>
            <p className="text-sm text-gray-400">Tente ajustar os filtros ou criar um novo agendamento</p>
          </div>
        ) : (
          agendamentosFiltrados.map((ag) => (
            <Card key={ag.id} className={`${getStatusColor(ag.status)} border`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ag.alunoNome}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={ag.status === "confirmado" ? "default" : "secondary"}>{ag.status}</Badge>
                    {ag.link_call && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        <Video className="h-3 w-3 mr-1" />
                        Call
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{ag.alunoEmail}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  <span>{format(ag.data, "dd/MM/yyyy")}</span>
                  <Badge variant="outline" size="sm">
                    {getDateLabel(ag.data)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{ag.horario}</span>
                </div>
                {ag.telefone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{ag.telefone}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MessageSquare className="h-4 w-4 mt-0.5" />
                  <span className="line-clamp-2">{ag.assunto}</span>
                </div>

                {/* Link da Call */}
                {ag.link_call && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Link da Call Disponível</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input value={ag.link_call} readOnly className="text-xs bg-white" />
                      <Button size="sm" variant="outline" onClick={() => window.open(ag.link_call, "_blank")}>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    {ag.call_adicionada_em && (
                      <p className="text-xs text-blue-600 mt-1">
                        Adicionado em: {format(new Date(ag.call_adicionada_em), "dd/MM 'às' HH:mm")}
                      </p>
                    )}
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  {ag.status === "confirmado" && (
                    <Button
                      size="sm"
                      variant={ag.link_call ? "outline" : "default"}
                      onClick={() => {
                        setAgendamentoSelecionado(ag)
                        setModalLinkCallAberto(true)
                      }}
                      className="flex-1"
                    >
                      <Video className="h-3 w-3 mr-1" />
                      {ag.link_call ? "Editar Call" : "Adicionar Call"}
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Detalhes
                  </Button>
                </div>

                {ag.motivoRecusa && (
                  <div className="mt-2 p-2 bg-red-100 rounded border-l-4 border-red-400">
                    <p className="text-sm font-medium text-red-800">Motivo da recusa:</p>
                    <p className="text-sm text-red-700">{ag.motivoRecusa}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estatísticas */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{agendamentos.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {agendamentos.filter((ag) => ag.status === "pendente").length}
              </p>
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {agendamentos.filter((ag) => ag.status === "confirmado").length}
              </p>
              <p className="text-sm text-gray-600">Confirmados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{agendamentos.filter((ag) => ag.link_call).length}</p>
              <p className="text-sm text-gray-600">Com Call</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Link da Call */}
      <ModalAdicionarLinkCall
        agendamento={agendamentoSelecionado}
        isOpen={modalLinkCallAberto}
        onClose={() => {
          setModalLinkCallAberto(false)
          setAgendamentoSelecionado(null)
        }}
        onSave={adicionarLinkCall}
        onRemove={removerLinkCall}
      />
    </div>
  )
}
