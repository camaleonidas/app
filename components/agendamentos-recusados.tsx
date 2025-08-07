"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft,
  XCircle,
  Edit,
  Undo,
  Search,
  Calendar,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  History,
} from "lucide-react"
import { format } from "date-fns"
import { ModalEditarAgendamentoRecusado } from "./modal-editar-agendamento-recusado"

interface Agendamento {
  id: string
  mentorNome: string
  mentorEmail: string
  alunoId: string
  alunoNome: string
  alunoEmail: string
  data: Date
  horario: string
  assunto: string
  telefone?: string
  status: "confirmado" | "pendente" | "recusado" | "cancelado"
  motivoRecusa?: string
  editHistory?: Array<{
    data: string
    acao: string
    detalhes: string
    timestamp: string
  }>
}

interface AgendamentosRecusadosProps {
  onVoltar: () => void
}

export function AgendamentosRecusados({ onVoltar }: AgendamentosRecusadosProps) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [agendamentoEditando, setAgendamentoEditando] = useState<Agendamento | null>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [filtro, setFiltro] = useState("")

  // Horários disponíveis
  const horariosDisponiveis = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
  ]

  // Carregar agendamentos do localStorage
  useEffect(() => {
    carregarAgendamentos()
  }, [])

  // Escutar eventos de atualização
  useEffect(() => {
    const handleAgendamentosCriados = () => {
      console.log("🔔 [RECUSADOS] Evento de agendamentos criados recebido")
      carregarAgendamentos()
    }

    window.addEventListener("agendamentosCriados", handleAgendamentosCriados)
    return () => window.removeEventListener("agendamentosCriados", handleAgendamentosCriados)
  }, [])

  const carregarAgendamentos = () => {
    try {
      const savedAgendamentos = localStorage.getItem("agendamentos")
      if (savedAgendamentos) {
        const todosAgendamentos = JSON.parse(savedAgendamentos).map((ag: any) => ({
          ...ag,
          data: new Date(ag.data),
          alunoNome: ag.alunoId === "2" ? "Maria Aluna Santos" : "Pedro Aluno Costa",
          alunoEmail: ag.alunoId === "2" ? "aluno@email.com" : "pedro@email.com",
        }))

        // Filtrar apenas agendamentos recusados
        const agendamentosRecusados = todosAgendamentos.filter((ag: any) => ag.status === "recusado")
        console.log("📊 [RECUSADOS] Agendamentos recusados encontrados:", agendamentosRecusados.length)
        setAgendamentos(agendamentosRecusados)
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error)
      setAgendamentos([])
    }
  }

  // FUNÇÃO DE REATIVAÇÃO CORRIGIDA - IGUAL À DO DASHBOARD
  const reativarAgendamento = (agendamento: Agendamento) => {
    console.log("🚀 [REATIVAR RECUSADOS] =".repeat(30))
    console.log("🚀 [REATIVAR RECUSADOS] INICIANDO REATIVAÇÃO")
    console.log("🚀 [REATIVAR RECUSADOS] ID:", agendamento.id)
    console.log("🚀 [REATIVAR RECUSADOS] Status atual:", agendamento.status)

    // Função interna super simples
    const executarReativacao = () => {
      try {
        // 1. Carregar dados do localStorage
        const dadosString = localStorage.getItem("agendamentos")
        if (!dadosString) {
          throw new Error("Nenhum dado encontrado no localStorage")
        }

        const dados = JSON.parse(dadosString)
        console.log("✅ [REATIVAR RECUSADOS] Dados carregados:", dados.length)

        // 2. Encontrar o agendamento
        const index = dados.findIndex((ag: any) => ag.id === agendamento.id)
        if (index === -1) {
          throw new Error("Agendamento não encontrado")
        }

        console.log("✅ [REATIVAR RECUSADOS] Agendamento encontrado no índice:", index)
        console.log("📋 [REATIVAR RECUSADOS] Status ANTES:", dados[index].status)

        // 3. Alterar o status para CONFIRMADO (não pendente)
        dados[index].status = "confirmado"
        dados[index].motivoRecusa = undefined
        dados[index].editHistory = [
          ...(dados[index].editHistory || []),
          {
            data: new Date().toISOString(),
            acao: "Agendamento reativado",
            detalhes: `Reativado pelo mentor. Status alterado para confirmado. Motivo anterior: ${agendamento.motivoRecusa || "Não informado"}`,
            timestamp: new Date().toLocaleString(),
          },
        ]

        console.log("📋 [REATIVAR RECUSADOS] Status DEPOIS:", dados[index].status)

        // 4. Salvar de volta no localStorage
        localStorage.setItem("agendamentos", JSON.stringify(dados))
        console.log("💾 [REATIVAR RECUSADOS] Dados salvos no localStorage")

        // 5. Verificação IMEDIATA
        const verificacao = JSON.parse(localStorage.getItem("agendamentos") || "[]")
        const agVerificado = verificacao.find((ag: any) => ag.id === agendamento.id)

        console.log("🔍 [REATIVAR RECUSADOS] VERIFICAÇÃO IMEDIATA:")
        console.log("   Status verificado:", agVerificado?.status)
        console.log("   Motivo removido:", agVerificado?.motivoRecusa === undefined)

        if (agVerificado?.status !== "confirmado") {
          throw new Error("Falha na verificação - status não foi alterado para confirmado")
        }

        console.log("🎉 [REATIVAR RECUSADOS] SUCESSO CONFIRMADO!")

        // 6. Atualizar lista local IMEDIATAMENTE
        carregarAgendamentos()

        // 7. Disparar eventos para outros componentes
        window.dispatchEvent(new CustomEvent("agendamentosCriados"))
        console.log("📡 [REATIVAR RECUSADOS] Evento disparado")

        // 8. Forçar atualização de outros componentes com delay
        setTimeout(() => {
          console.log("🔄 [REATIVAR RECUSADOS] Disparando evento adicional...")
          window.dispatchEvent(new CustomEvent("agendamentosCriados"))
        }, 500)

        // 9. Feedback para o usuário
        alert("✅ Agendamento reativado e confirmado com sucesso! Agora aparecerá em 'Aprovados'.")

        return true
      } catch (error) {
        console.error("💥 [REATIVAR RECUSADOS] ERRO:", error)
        alert(`❌ Erro ao reativar: ${error.message}`)
        return false
      }
    }

    // Executar a reativação
    const resultado = executarReativacao()

    console.log("🚀 [REATIVAR RECUSADOS] Resultado:", resultado ? "SUCESSO" : "FALHA")
    console.log("🚀 [REATIVAR RECUSADOS] =".repeat(30))

    return resultado
  }

  const handleEditarAgendamento = (agendamento: Agendamento) => {
    setAgendamentoEditando(agendamento)
    setModalAberto(true)
  }

  const handleSalvarEdicao = (agendamentoAtualizado: Agendamento) => {
    const todosAgendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]")

    const agendamentosAtualizados = todosAgendamentos.map((ag: any) =>
      ag.id === agendamentoAtualizado.id
        ? {
            ...agendamentoAtualizado,
            data: agendamentoAtualizado.data.toISOString(),
            status: "confirmado", // Garantir que vai para confirmado
          }
        : ag,
    )

    localStorage.setItem("agendamentos", JSON.stringify(agendamentosAtualizados))

    // Atualizar lista local
    carregarAgendamentos()

    // Disparar evento
    window.dispatchEvent(new CustomEvent("agendamentosCriados"))

    setModalAberto(false)
    setAgendamentoEditando(null)

    alert("✅ Agendamento editado e confirmado com sucesso!")
  }

  // Filtrar agendamentos
  const agendamentosFiltrados = agendamentos.filter((ag) => {
    if (!filtro.trim()) return true

    const termo = filtro.toLowerCase()
    return (
      ag.alunoNome.toLowerCase().includes(termo) ||
      ag.alunoEmail.toLowerCase().includes(termo) ||
      ag.assunto.toLowerCase().includes(termo) ||
      (ag.motivoRecusa && ag.motivoRecusa.toLowerCase().includes(termo))
    )
  })

  const agendamentosOrdenados = agendamentosFiltrados.sort((a, b) => b.data.getTime() - a.data.getTime())

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onVoltar}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-red-700">Agendamentos Recusados</h2>
          <p className="text-gray-600">Gerencie e reative agendamentos que foram recusados</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar agendamentos..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Total Recusados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{agendamentos.length}</div>
            <p className="text-sm text-gray-600">agendamentos para revisar</p>
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Ações Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">• Editar e reativar</p>
              <p className="text-sm text-gray-600">• Reativar rapidamente</p>
              <p className="text-sm text-gray-600">• Ver histórico</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Agendamentos Recusados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Lista de Agendamentos Recusados ({agendamentosFiltrados.length})
          </CardTitle>
          <CardDescription>
            Clique em "Editar" para modificar e reativar, ou "Reativar" para confirmar rapidamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agendamentosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {filtro ? "Nenhum agendamento encontrado na busca" : "Nenhum agendamento recusado"}
              </p>
              {!filtro && (
                <p className="text-sm text-gray-400">Ótimo! Você não tem agendamentos recusados para revisar.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {agendamentosOrdenados.map((ag) => (
                <Card key={ag.id} className="border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Cabeçalho */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{ag.alunoNome}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                <span>{ag.alunoEmail}</span>
                              </div>
                              {ag.telefone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  <span>{ag.telefone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="destructive" className="mb-2">
                              Recusado
                            </Badge>
                            {ag.editHistory && ag.editHistory.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <History className="h-3 w-3" />
                                <span>Editado {ag.editHistory.length}x</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Detalhes do agendamento */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{format(ag.data, "dd/MM/yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{ag.horario}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2 text-sm">
                              <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                              <span className="line-clamp-2">{ag.assunto}</span>
                            </div>
                          </div>
                        </div>

                        {/* Motivo da recusa */}
                        {ag.motivoRecusa && (
                          <div className="p-3 bg-red-100 rounded border-l-4 border-red-400">
                            <p className="text-sm font-medium text-red-800">Motivo da recusa:</p>
                            <p className="text-sm text-red-700 mt-1">{ag.motivoRecusa}</p>
                          </div>
                        )}

                        {/* Histórico */}
                        {ag.editHistory && ag.editHistory.length > 0 && (
                          <details className="text-xs text-gray-500">
                            <summary className="cursor-pointer font-medium">Ver histórico de alterações</summary>
                            <div className="mt-2 space-y-1">
                              {ag.editHistory.map((edit, index) => (
                                <div key={index} className="p-2 bg-gray-100 rounded">
                                  <div className="flex justify-between">
                                    <span className="font-medium">{edit.acao}</span>
                                    <span>{edit.timestamp}</span>
                                  </div>
                                  <p>{edit.detalhes}</p>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="ml-6 flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditarAgendamento(ag)}
                          className="whitespace-nowrap"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar e Reativar
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            console.log("🔘 [BOTÃO CLICADO] Reativar agendamento:", ag.id)
                            reativarAgendamento(ag)
                          }}
                          className="whitespace-nowrap"
                        >
                          <Undo className="h-4 w-4 mr-2" />
                          Reativar e Confirmar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <ModalEditarAgendamentoRecusado
        agendamento={agendamentoEditando}
        isOpen={modalAberto}
        onClose={() => {
          setModalAberto(false)
          setAgendamentoEditando(null)
        }}
        onSave={handleSalvarEdicao}
        horariosDisponiveis={horariosDisponiveis}
      />
    </div>
  )
}
