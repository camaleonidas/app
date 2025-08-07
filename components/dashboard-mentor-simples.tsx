"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, AlertCircle, CheckCircle, Settings, Eye, XCircle, Undo } from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"
import { useAuth } from "@/contexts/auth-context"

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
}

interface DashboardMentorProps {
  onNavigate: (page: string) => void
}

export function DashboardMentor({ onNavigate }: DashboardMentorProps) {
  const { user } = useAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Função simplificada para carregar agendamentos
  const carregarAgendamentos = () => {
    console.log("🔄 Carregando agendamentos...")
    setIsLoading(true)

    try {
      const agendamentosLocal = localStorage.getItem("agendamentos")
      if (!agendamentosLocal) {
        console.log("❌ Nenhum agendamento encontrado")
        setAgendamentos([])
        return
      }

      const dados = JSON.parse(agendamentosLocal)
      console.log("📊 Agendamentos carregados:", dados.length)

      // Processar dados
      const processados = dados.map((ag: any) => ({
        ...ag,
        data: new Date(ag.data),
        alunoNome: ag.alunoNome || (ag.alunoId === "2" ? "Maria Aluna Santos" : "Pedro Aluno Costa"),
        alunoEmail: ag.alunoEmail || (ag.alunoId === "2" ? "aluno@email.com" : "pedro@email.com"),
      }))

      // Filtrar por mentor (simplificado)
      const meus = processados.filter((ag: any) => ag.mentorEmail === user?.email || user?.email === "mentor@email.com")

      console.log("✅ Meus agendamentos:", meus.length)
      setAgendamentos(meus)
    } catch (error) {
      console.error("❌ Erro ao carregar:", error)
      setAgendamentos([])
    } finally {
      setIsLoading(false)
    }
  }

  // Função SUPER SIMPLES de reativação
  const reativarAgendamento = (agendamento: Agendamento) => {
    console.log("🔄 REATIVANDO:", agendamento.id)

    try {
      // 1. Carregar dados do localStorage
      const dados = JSON.parse(localStorage.getItem("agendamentos") || "[]")

      // 2. Encontrar e atualizar
      const novos = dados.map((ag: any) => {
        if (ag.id === agendamento.id) {
          console.log("✅ Encontrado! Atualizando status...")
          return { ...ag, status: "pendente", motivoRecusa: undefined }
        }
        return ag
      })

      // 3. Salvar
      localStorage.setItem("agendamentos", JSON.stringify(novos))
      console.log("💾 Salvo!")

      // 4. Recarregar
      carregarAgendamentos()

      // 5. Feedback
      alert("✅ Agendamento reativado!")
    } catch (error) {
      console.error("❌ Erro:", error)
      alert("❌ Erro ao reativar")
    }
  }

  useEffect(() => {
    if (user) carregarAgendamentos()
  }, [user])

  useEffect(() => {
    const handle = () => carregarAgendamentos()
    window.addEventListener("agendamentosCriados", handle)
    return () => window.removeEventListener("agendamentosCriados", handle)
  }, [])

  const hoje = new Date()
  const agendamentosHoje = agendamentos.filter((ag) => isToday(ag.data))
  const agendamentosAmanha = agendamentos.filter((ag) => isTomorrow(ag.data))
  const agendamentosPendentes = agendamentos.filter((ag) => ag.status === "pendente" && ag.data >= hoje)
  const agendamentosRecusados = agendamentos.filter((ag) => ag.status === "recusado")
  const proximosAgendamentos = agendamentos
    .filter((ag) => ag.status === "confirmado" && ag.data >= hoje)
    .sort((a, b) => a.data.getTime() - b.data.getTime())
    .slice(0, 5)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Mentor</h1>
          <p className="text-gray-600 mt-2">Carregando agendamentos...</p>
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
          <Button
            variant="outline"
            onClick={() => {
              const script = document.createElement("script")
              script.textContent = `
                const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]")
                const recusados = agendamentos.filter(ag => ag.status === "recusado")
                console.log("🔴 Agendamentos recusados:", recusados.length)
                recusados.forEach((ag, i) => console.log(\`\${i+1}. \${ag.id} - \${ag.alunoNome}\`))
              `
              document.head.appendChild(script)
            }}
          >
            🔍 Debug
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
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {agendamentos.filter((ag) => ag.status === "confirmado" && ag.data >= hoje).length}
            </div>
            <p className="text-xs text-muted-foreground">próximos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recusados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{agendamentosRecusados.length}</div>
            <p className="text-xs text-muted-foreground">para revisar</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Gerencie seus agendamentos e configurações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => onNavigate("solicitacoes")} className="h-20 flex flex-col gap-2">
              <AlertCircle className="h-6 w-6" />
              <span>Analisar Solicitações</span>
              {agendamentosPendentes.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {agendamentosPendentes.length} pendentes
                </Badge>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => onNavigate("todos-agendamentos")}
              className="h-20 flex flex-col gap-2"
            >
              <Eye className="h-6 w-6" />
              <span>Ver Todos</span>
              <span className="text-xs text-gray-500">Agendamentos</span>
            </Button>

            <Button variant="outline" onClick={() => onNavigate("configuracoes")} className="h-20 flex flex-col gap-2">
              <Settings className="h-6 w-6" />
              <span>Configurações</span>
              <span className="text-xs text-gray-500">Horários</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agendamentos Recusados - VERSÃO SIMPLES */}
      {agendamentosRecusados.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Agendamentos Recusados ({agendamentosRecusados.length})
            </CardTitle>
            <CardDescription>Agendamentos que foram recusados - clique em "Reativar" para aprovar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agendamentosRecusados.map((ag) => (
                <div
                  key={ag.id}
                  className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">{ag.alunoNome}</p>
                      <p className="text-sm text-gray-600">{ag.alunoEmail}</p>
                      <p className="text-sm text-gray-600">{ag.assunto}</p>
                      <p className="text-xs text-gray-500">
                        {format(ag.data, "dd/MM/yyyy")} às {ag.horario}
                      </p>
                      {ag.motivoRecusa && (
                        <p className="text-xs text-red-600 mt-1">
                          <strong>Motivo:</strong> {ag.motivoRecusa}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="mb-2">
                      Recusado
                    </Badge>
                    <br />
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        console.log("🔘 Botão clicado para:", ag.id)
                        reativarAgendamento(ag)
                      }}
                      className="text-xs"
                    >
                      <Undo className="h-3 w-3 mr-1" />
                      Reativar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximos Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Próximos Agendamentos
          </CardTitle>
          <CardDescription>Seus próximos compromissos confirmados</CardDescription>
        </CardHeader>
        <CardContent>
          {proximosAgendamentos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">Nenhum agendamento confirmado</p>
              {agendamentosPendentes.length > 0 && (
                <p className="text-sm text-blue-600">
                  Você tem {agendamentosPendentes.length} solicitação(ões) pendente(s) para analisar
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {proximosAgendamentos.map((ag) => (
                <div key={ag.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{ag.alunoNome}</p>
                      <p className="text-sm text-gray-600">{ag.alunoEmail}</p>
                      <p className="text-sm text-gray-600">{ag.assunto}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{format(ag.data, "dd/MM/yyyy")}</p>
                    <p className="text-sm text-gray-600">{ag.horario}</p>
                    <Badge variant="default">Confirmado</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">🔍 Debug Info</summary>
            <div className="mt-2 space-y-1 text-xs">
              <p>Total agendamentos: {agendamentos.length}</p>
              <p>Recusados: {agendamentosRecusados.length}</p>
              <p>Pendentes: {agendamentosPendentes.length}</p>
              <p>Usuário: {user?.email}</p>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  )
}
