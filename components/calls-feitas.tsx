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
} from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { agendamentoJaPassou } from "@/lib/date-utils"
import { ModalAdicionarGravacao } from "./modal-adicionar-gravacao"

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
  finalizado_em?: string
  avaliacao?: number
  feedback_aluno?: string
  observacoes_mentor?: string
  link_gravacao?: string
  senha_gravacao?: string
  observacoes_gravacao?: string
  gravacao_adicionada_em?: string
  gravacao_adicionada_por?: string
}

interface CallsFeitasProps {
  onVoltar: () => void
}

export function CallsFeitas({ onVoltar }: CallsFeitasProps) {
  const { user } = useAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState<Agendamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [agendamentoSelecionadoGravacao, setAgendamentoSelecionadoGravacao] = useState<Agendamento | null>(null)
  const [modalGravacaoAberto, setModalGravacaoAberto] = useState(false)

  // Carregar agendamentos finalizados
  const carregarCallsFeitas = () => {
    console.log("🎯 [CALLS FEITAS] Carregando calls concluídas...")

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
          // NOVA LÓGICA: Filtrar apenas calls finalizadas (status finalizado OU confirmado + data+horário passados)
          const jaPassou = agendamentoJaPassou(ag.data, ag.horario)
          const isCallFeita = ag.status === "finalizado" || (ag.status === "confirmado" && jaPassou)

          console.log(`🔍 [CALLS FEITAS] Agendamento ${ag.id}:`)
          console.log(`   - Data: ${ag.data.toDateString()}`)
          console.log(`   - Horário: ${ag.horario}`)
          console.log(`   - Status: ${ag.status}`)
          console.log(`   - Já passou: ${jaPassou}`)
          console.log(`   - É call feita: ${isCallFeita}`)

          return isCallFeita
        })
        .sort((a: any, b: any) => new Date(b.data).getTime() - new Date(a.data).getTime())

      console.log("✅ [CALLS FEITAS] Calls encontradas:", agendamentosProcessados.length)
      setAgendamentos(agendamentosProcessados)
    } catch (error) {
      console.error("❌ [CALLS FEITAS] Erro ao carregar:", error)
      setAgendamentos([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      carregarCallsFeitas()
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

  // Função para adicionar gravação
  const adicionarGravacao = async (
    agendamentoId: string,
    dadosGravacao: {
      link_gravacao: string
      senha_gravacao?: string
      observacoes_gravacao?: string
    },
  ): Promise<boolean> => {
    try {
      const dadosAtuais = JSON.parse(localStorage.getItem("agendamentos") || "[]")
      const agendamentosAtualizados = dadosAtuais.map((ag: any) => {
        if (ag.id === agendamentoId) {
          return {
            ...ag,
            ...dadosGravacao,
            gravacao_adicionada_em: new Date().toISOString(),
            gravacao_adicionada_por: user?.id,
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
              ...dadosGravacao,
              gravacao_adicionada_em: new Date().toISOString(),
              gravacao_adicionada_por: user?.id,
            }
          }
          return ag
        })
        localStorage.setItem("agendamentos_supabase", JSON.stringify(dadosSupabaseAtualizados))
      }

      carregarCallsFeitas()
      window.dispatchEvent(new CustomEvent("agendamentosCriados"))
      return true
    } catch (error) {
      console.error("Erro ao adicionar gravação:", error)
      return false
    }
  }

  // Função para remover gravação
  const removerGravacao = async (agendamentoId: string): Promise<boolean> => {
    try {
      const dadosAtuais = JSON.parse(localStorage.getItem("agendamentos") || "[]")
      const agendamentosAtualizados = dadosAtuais.map((ag: any) => {
        if (ag.id === agendamentoId) {
          const {
            link_gravacao,
            senha_gravacao,
            observacoes_gravacao,
            gravacao_adicionada_em,
            gravacao_adicionada_por,
            ...resto
          } = ag
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
            const {
              link_gravacao,
              senha_gravacao,
              observacoes_gravacao,
              gravacao_adicionada_em,
              gravacao_adicionada_por,
              ...resto
            } = ag
            return resto
          }
          return ag
        })
        localStorage.setItem("agendamentos_supabase", JSON.stringify(dadosSupabaseAtualizados))
      }

      carregarCallsFeitas()
      window.dispatchEvent(new CustomEvent("agendamentosCriados"))
      return true
    } catch (error) {
      console.error("Erro ao remover gravação:", error)
      return false
    }
  }

  // Função para marcar como finalizado
  const marcarComoFinalizado = (agendamentoId: string, observacoes?: string) => {
    try {
      const dadosAtuais = JSON.parse(localStorage.getItem("agendamentos") || "[]")
      const agendamentosAtualizados = dadosAtuais.map((ag: any) => {
        if (ag.id === agendamentoId) {
          return {
            ...ag,
            status: "finalizado",
            finalizado_em: new Date().toISOString(),
            observacoes_mentor: observacoes || "",
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
              status: "finalizado",
              finalizado_em: new Date().toISOString(),
              observacoes_mentor: observacoes || "",
            }
          }
          return ag
        })
        localStorage.setItem("agendamentos_supabase", JSON.stringify(dadosSupabaseAtualizados))
      }

      // Recarregar
      carregarCallsFeitas()
      window.dispatchEvent(new CustomEvent("agendamentosCriados"))

      // Perguntar se quer adicionar gravação
      const adicionarGrav = confirm("✅ Call marcada como finalizada!\n\n🎥 Deseja adicionar o link da gravação agora?")
      if (adicionarGrav) {
        const agendamento = agendamentosAtualizados.find((ag: any) => ag.id === agendamentoId)
        if (agendamento) {
          setAgendamentoSelecionadoGravacao({
            ...agendamento,
            data: new Date(agendamento.data_agendamento || agendamento.data),
          })
          setModalGravacaoAberto(true)
        }
      }
    } catch (error) {
      console.error("Erro ao finalizar call:", error)
      alert("❌ Erro ao finalizar call")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calls Feitas</h1>
          <p className="text-gray-600 mt-2">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-700">Calls Feitas</h1>
          <p className="text-gray-600 mt-2">Histórico de mentorias concluídas</p>
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
              Total de Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{agendamentos.length}</div>
            <p className="text-sm text-gray-600">mentorias concluídas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Com Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{agendamentos.filter((ag) => ag.link_call).length}</div>
            <p className="text-sm text-gray-600">calls online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {
                agendamentos.filter(
                  (ag) =>
                    ag.data.getMonth() === new Date().getMonth() && ag.data.getFullYear() === new Date().getFullYear(),
                ).length
              }
            </div>
            <p className="text-sm text-gray-600">calls realizadas</p>
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

      {/* Lista de Calls Feitas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agendamentosFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              {busca ? "Nenhuma call encontrada na busca" : "Nenhuma call finalizada ainda"}
            </p>
            {!busca && <p className="text-sm text-gray-400">As calls concluídas aparecerão aqui automaticamente</p>}
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
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Finalizada
                    </Badge>
                    {ag.link_call && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        <Video className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    )}
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

                {ag.finalizado_em && (
                  <div className="bg-green-100 p-2 rounded border-l-4 border-green-400">
                    <p className="text-xs text-green-700">
                      <strong>Finalizada em:</strong> {format(new Date(ag.finalizado_em), "dd/MM/yyyy 'às' HH:mm")}
                    </p>
                  </div>
                )}

                {ag.observacoes_mentor && (
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-xs text-blue-700">
                      <strong>Observações:</strong> {ag.observacoes_mentor}
                    </p>
                  </div>
                )}

                {ag.link_call && (
                  <div className="bg-blue-50 p-2 rounded border border-blue-200">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-900">Link da Call</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(ag.link_call, "_blank")}
                        className="ml-auto"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {ag.link_gravacao && (
                  <div className="bg-purple-50 p-2 rounded border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Video className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-900">Gravação Disponível</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAgendamentoSelecionadoGravacao(ag)
                          setModalGravacaoAberto(true)
                        }}
                        className="ml-auto"
                      >
                        Gerenciar
                      </Button>
                    </div>
                    {ag.senha_gravacao && <p className="text-xs text-purple-700">Com senha de acesso</p>}
                  </div>
                )}

                {!ag.link_gravacao && (
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAgendamentoSelecionadoGravacao(ag)
                        setModalGravacaoAberto(true)
                      }}
                      className="w-full"
                    >
                      <Video className="h-3 w-3 mr-1" />
                      Adicionar Gravação
                    </Button>
                  </div>
                )}

                {/* Ações para calls ainda não marcadas como finalizadas */}
                {ag.status === "confirmado" && agendamentoJaPassou(ag.data, ag.horario) && (
                  <div className="pt-2 border-t">
                    <Button
                      size="sm"
                      onClick={() => {
                        const observacoes = prompt("Observações sobre a mentoria (opcional):")
                        marcarComoFinalizado(ag.id, observacoes || undefined)
                      }}
                      className="w-full"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Marcar como Finalizada
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Gravação */}
      <ModalAdicionarGravacao
        agendamento={agendamentoSelecionadoGravacao}
        isOpen={modalGravacaoAberto}
        onClose={() => {
          setModalGravacaoAberto(false)
          setAgendamentoSelecionadoGravacao(null)
        }}
        onSave={adicionarGravacao}
        onRemove={removerGravacao}
      />
    </div>
  )
}
