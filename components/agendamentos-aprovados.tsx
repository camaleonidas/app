"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  Search,
  CheckCircle,
  ExternalLink,
  Eye,
} from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useAuth } from "@/contexts/auth-context"
import { ModalAdicionarLinkCall } from "./modal-adicionar-link-call"
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
  link_call?: string
  call_adicionada_em?: string
}

interface AgendamentosAprovadosProps {
  onVoltar: () => void
}

export function AgendamentosAprovados({ onVoltar }: AgendamentosAprovadosProps) {
  const { user } = useAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState<Agendamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null)
  const [modalLinkCallAberto, setModalLinkCallAberto] = useState(false)

  // Carregar apenas agendamentos aprovados (confirmados) e futuros
  const carregarAgendamentosAprovados = () => {
    console.log("✅ [APROVADOS] Carregando agendamentos aprovados...")

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
          // Filtrar apenas do mentor atual
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
        .filter((ag: any) => {
          // NOVA LÓGICA: Filtrar apenas confirmados e futuros (não finalizados e não passados)
          const jaPassou = agendamentoJaPassou(ag.data, ag.horario)
          const isAprovado = ag.status === "confirmado" && !jaPassou

          console.log(`🔍 [APROVADOS] Agendamento ${ag.id}:`)
          console.log(`   - Data: ${ag.data.toDateString()}`)
          console.log(`   - Horário: ${ag.horario}`)
          console.log(`   - Status: ${ag.status}`)
          console.log(`   - Já passou: ${jaPassou}`)
          console.log(`   - É aprovado: ${isAprovado}`)

          return isAprovado
        })
        .sort((a: any, b: any) => new Date(a.data).getTime() - new Date(b.data).getTime())

      console.log("✅ [APROVADOS] Agendamentos encontrados:", agendamentosProcessados.length)
      setAgendamentos(agendamentosProcessados)
    } catch (error) {
      console.error("❌ [APROVADOS] Erro ao carregar:", error)
      setAgendamentos([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      carregarAgendamentosAprovados()
    }
  }, [user])

  // Filtrar por busca
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

    setAgendamentosFiltrados(filtrados)
  }, [agendamentos, busca])

  // Função para adicionar link da call
  const adicionarLinkCall = async (agendamentoId: string, linkCall: string): Promise<boolean> => {
    try {
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

      // Atualizar Supabase backup
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

      carregarAgendamentosAprovados()
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
      const dadosAtuais = JSON.parse(localStorage.getItem("agendamentos") || "[]")
      const agendamentosAtualizados = dadosAtuais.map((ag: any) => {
        if (ag.id === agendamentoId) {
          const { link_call, call_adicionada_em, call_adicionada_por, ...resto } = ag
          return resto
        }
        return ag
      })

      localStorage.setItem("agendamentos", JSON.stringify(agendamentosAtualizados))

      // Atualizar Supabase backup
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

      carregarAgendamentosAprovados()
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
    return format(data, "dd/MM", { locale: ptBR })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos Aprovados</h1>
          <p className="text-gray-600 mt-2">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-700">Agendamentos Aprovados</h1>
          <p className="text-gray-600 mt-2">Mentorias confirmadas e futuras</p>
        </div>
        <Button variant="outline" onClick={onVoltar}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Dashboard
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Total Aprovados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{agendamentos.length}</div>
            <p className="text-sm text-gray-600">agendamentos confirmados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {agendamentos.filter((ag) => isToday(ag.data)).length}
            </div>
            <p className="text-sm text-gray-600">calls hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Com Call</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{agendamentos.filter((ag) => ag.link_call).length}</div>
            <p className="text-sm text-gray-600">links adicionados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{agendamentosFiltrados.length}</div>
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
              placeholder="Buscar por aluno, email ou assunto..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos Aprovados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agendamentosFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {busca ? "Nenhum agendamento encontrado na busca" : "Nenhum agendamento aprovado"}
            </p>
            {!busca && <p className="text-sm text-gray-400">Agendamentos confirmados aparecerão aqui</p>}
          </div>
        ) : (
          agendamentosFiltrados.map((ag) => (
            <Card key={ag.id} className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    {ag.alunoNome}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-600">
                      Aprovado
                    </Badge>
                    {ag.link_call && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        <Video className="h-3 w-3 mr-1" />
                        Call
                      </Badge>
                    )}
                    <Badge variant="outline" size="sm">
                      {getDateLabel(ag.data)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{ag.alunoEmail}</span>
                </div>

                {ag.telefone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{ag.telefone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span>{format(ag.data, "dd/MM/yyyy")}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>{ag.horario}</span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MessageSquare className="h-4 w-4 mt-0.5" />
                  <span className="line-clamp-2">{ag.assunto}</span>
                </div>

                {/* Link da Call */}
                {ag.link_call && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Link da Call</span>
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
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
