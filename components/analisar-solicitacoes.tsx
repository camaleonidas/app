"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Clock, User, Mail, Phone, MessageSquare, ArrowLeft, Check, X, RefreshCw } from 'lucide-react'
import { format } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { 
  buscarAgendamentosPorUsuario, 
  atualizarStatusAgendamento,
  buscarTodosAgendamentos 
} from "@/lib/supabase-only"

interface Agendamento {
  id: string
  mentor_id?: string
  aluno_id?: string
  data_agendamento?: string
  data?: string
  data_hora?: string
  horario?: string
  status: 'pendente' | 'aprovado' | 'recusado' | 'concluido' | 'confirmado'
  assunto?: string
  observacoes?: string
  telefone?: string
  created_at: string
  updated_at?: string
  // Dados relacionados
  mentor?: {
    id: string
    nome: string
    email: string
    telefone?: string
  }
  aluno?: {
    id: string
    nome: string
    email: string
    telefone?: string
  }
}

interface AnalisarSolicitacoesProps {
  onVoltar: () => void
}

export function AnalisarSolicitacoes({ onVoltar }: AnalisarSolicitacoesProps) {
  const { user } = useAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [motivosRecusa, setMotivosRecusa] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})

  // Função para extrair data e horário de um agendamento
  const extrairDataHorario = (ag: Agendamento) => {
    // Tentar diferentes campos de data
    let dataStr = ag.data_agendamento || ag.data || ag.data_hora || ag.created_at
    let horarioStr = ag.horario || ''
    
    // Se data_hora contém data e hora juntas
    if (ag.data_hora && !ag.horario) {
      const dataHora = new Date(ag.data_hora)
      dataStr = ag.data_hora
      horarioStr = dataHora.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
    
    return {
      data: new Date(dataStr),
      horario: horarioStr,
      dataOriginal: dataStr
    }
  }

  // Função para carregar agendamentos diretamente do Supabase
  const carregarAgendamentos = async () => {
    console.log("🔍 [ANALISAR] ==================== INÍCIO ====================")
    console.log("🔍 [ANALISAR] Usuário logado:", user)

    if (!user) {
      console.log("❌ [ANALISAR] Usuário não logado")
      return
    }

    try {
      setIsLoading(true)

      // Buscar TODOS os agendamentos primeiro para debug
      console.log("🔍 [ANALISAR] Buscando todos os agendamentos...")
      const { data: todosAgendamentos, error: errorTodos } = await buscarTodosAgendamentos()
      
      if (errorTodos) {
        console.error("❌ [ANALISAR] Erro ao buscar todos agendamentos:", errorTodos)
        setDebugInfo({ error: errorTodos, totalAgendamentos: 0 })
        return
      }

      console.log("📊 [ANALISAR] Total de agendamentos no banco:", todosAgendamentos.length)
      console.log("📋 [ANALISAR] Agendamentos encontrados:", todosAgendamentos)

      // Filtrar agendamentos pendentes
      const agendamentosPendentes = todosAgendamentos.filter(ag => 
        ag.status === 'pendente' || ag.status === 'confirmado'
      )
      console.log("⏳ [ANALISAR] Agendamentos pendentes:", agendamentosPendentes.length)

      // Se o usuário é mentor, filtrar por mentor_id
      let meusAgendamentos = agendamentosPendentes
      if (user.tipo === 'mentor') {
        meusAgendamentos = agendamentosPendentes.filter(ag => ag.mentor_id === user.id)
        console.log("👨‍🏫 [ANALISAR] Agendamentos do mentor:", meusAgendamentos.length)
      }

      // Processar dados para exibição
      const agendamentosProcessados = meusAgendamentos.map(ag => {
        const { data, horario, dataOriginal } = extrairDataHorario(ag)
        
        return {
          ...ag,
          // Garantir que temos os dados do aluno
          alunoNome: ag.aluno?.nome || 'Nome não encontrado',
          alunoEmail: ag.aluno?.email || 'Email não encontrado',
          // Dados processados
          dataFormatada: data,
          horarioFormatado: horario,
          dataOriginal: dataOriginal
        }
      })

      console.log("✅ [ANALISAR] Agendamentos processados:", agendamentosProcessados.length)
      
      setAgendamentos(agendamentosProcessados)
      setDebugInfo({
        totalAgendamentos: todosAgendamentos.length,
        pendentes: agendamentosPendentes.length,
        meus: meusAgendamentos.length,
        processados: agendamentosProcessados.length,
        userTipo: user.tipo,
        userId: user.id,
        estruturaExemplo: todosAgendamentos.length > 0 ? Object.keys(todosAgendamentos[0]) : []
      })

    } catch (error) {
      console.error("❌ [ANALISAR] Erro geral:", error)
      setDebugInfo({ error: error.message })
    } finally {
      setIsLoading(false)
    }

    console.log("🔍 [ANALISAR] ==================== FIM ====================")
  }

  // Carregar agendamentos quando o componente monta
  useEffect(() => {
    if (user) {
      carregarAgendamentos()
    }
  }, [user])

  // Auto-refresh a cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🔄 [ANALISAR] Auto-refresh...")
      carregarAgendamentos()
    }, 10000)

    return () => clearInterval(interval)
  }, [user])

  const atualizarStatus = async (id: string, novoStatus: 'aprovado' | 'recusado', observacoes?: string) => {
    console.log(`🔄 [ANALISAR] Atualizando status: ID=${id}, Status=${novoStatus}`)
    setIsLoading(true)

    try {
      const { success, error } = await atualizarStatusAgendamento(id, novoStatus, observacoes)

      if (!success) {
        console.error("❌ [ANALISAR] Erro ao atualizar:", error)
        alert(`❌ Erro ao atualizar agendamento: ${error}`)
        return
      }

      console.log("✅ [ANALISAR] Status atualizado com sucesso!")
      
      // Limpar motivo de recusa se foi aprovado
      if (novoStatus === 'aprovado') {
        setMotivosRecusa({ ...motivosRecusa, [id]: "" })
      }

      // Mostrar feedback
      const acao = novoStatus === 'aprovado' ? "aprovado" : "recusado"
      alert(`✅ Agendamento ${acao} com sucesso!`)

      // Recarregar dados
      setTimeout(() => {
        carregarAgendamentos()
      }, 1000)

    } catch (error) {
      console.error("❌ [ANALISAR] Erro ao atualizar status:", error)
      alert("❌ Erro ao atualizar agendamento. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecusar = (id: string) => {
    const motivo = motivosRecusa[id] || ""
    atualizarStatus(id, "recusado", motivo)
  }

  const handleMotivoChange = (id: string, motivo: string) => {
    setMotivosRecusa({ ...motivosRecusa, [id]: motivo })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onVoltar}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Analisar Solicitações</h2>
          <p className="text-gray-600">Confirme ou recuse os agendamentos pendentes</p>
        </div>
        <Button variant="outline" onClick={carregarAgendamentos} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Debug Info */}
      {debugInfo && Object.keys(debugInfo).length > 0 && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Solicitações Pendentes ({agendamentos.length})
          </CardTitle>
          <CardDescription>Agendamentos aguardando sua análise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Carregando agendamentos...</p>
              </div>
            ) : agendamentos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhuma solicitação pendente</p>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Debug: {debugInfo.totalAgendamentos || 0} agendamentos no total</p>
                  <p>Pendentes: {debugInfo.pendentes || 0}</p>
                  <p>Seus: {debugInfo.meus || 0}</p>
                  <p>Usuário: {debugInfo.userTipo} (ID: {debugInfo.userId})</p>
                  <p>Estrutura: {debugInfo.estruturaExemplo?.join(', ')}</p>
                </div>
                <Button onClick={carregarAgendamentos} className="mt-4" variant="outline">
                  🔄 Recarregar Dados
                </Button>
              </div>
            ) : (
              agendamentos.map((ag) => (
                <div key={ag.id} className="border rounded-lg p-6 space-y-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-500" />
                      <span className="text-lg font-semibold">{ag.alunoNome || "Nome não encontrado"}</span>
                    </div>
                    <Badge variant="secondary">Pendente</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{ag.alunoEmail || "Email não encontrado"}</span>
                      </div>
                      {ag.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{ag.telefone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {ag.dataFormatada ? format(ag.dataFormatada, "dd/MM/yyyy") : "Data não encontrada"}
                          {ag.horarioFormatado && ` às ${ag.horarioFormatado}`}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-700">Assunto:</p>
                          <p className="text-gray-600">{ag.assunto || ag.observacoes || "Não informado"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`motivo-${ag.id}`}>Motivo da recusa (opcional)</Label>
                      <Textarea
                        id={`motivo-${ag.id}`}
                        placeholder="Ex: Conflito de horário, indisponibilidade, etc."
                        value={motivosRecusa[ag.id] || ""}
                        onChange={(e) => handleMotivoChange(ag.id, e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => atualizarStatus(ag.id, "aprovado")}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {isLoading ? "Aprovando..." : "Aprovar Agendamento"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRecusar(ag.id)}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        {isLoading ? "Recusando..." : "Recusar Solicitação"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
