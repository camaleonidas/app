"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Trash2, Database, HardDrive } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function DebugAgendamentosDetalhado() {
  // Componente desabilitado - removido do front-end
  return null
  
  const { user } = useAuth()
  const [agendamentosLocal, setAgendamentosLocal] = useState<any[]>([])
  const [agendamentosSupabase, setAgendamentosSupabase] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [showDetails, setShowDetails] = useState(true)

  const carregarTodosDados = () => {
    console.log("🔍 [DEBUG DETALHADO] ==================== INÍCIO ====================")

    // 1. Carregar localStorage
    const localData = localStorage.getItem("agendamentos")
    console.log("🔍 [DEBUG] localStorage raw:", localData)

    if (localData) {
      try {
        const parsed = JSON.parse(localData)
        setAgendamentosLocal(parsed)
        console.log("✅ [DEBUG] localStorage parsed:", parsed)
      } catch (error) {
        console.error("❌ [DEBUG] Erro ao parsear localStorage:", error)
        setAgendamentosLocal([])
      }
    } else {
      setAgendamentosLocal([])
    }

    // 2. Carregar Supabase backup
    const supabaseData = localStorage.getItem("agendamentos_supabase")
    console.log("🔍 [DEBUG] Supabase backup raw:", supabaseData)

    if (supabaseData) {
      try {
        const parsed = JSON.parse(supabaseData)
        setAgendamentosSupabase(parsed)
        console.log("✅ [DEBUG] Supabase backup parsed:", parsed)
      } catch (error) {
        console.error("❌ [DEBUG] Erro ao parsear Supabase backup:", error)
        setAgendamentosSupabase([])
      }
    } else {
      setAgendamentosSupabase([])
    }

    setLastUpdate(new Date().toLocaleTimeString())
    console.log("🔍 [DEBUG DETALHADO] ==================== FIM ====================")
  }

  useEffect(() => {
    carregarTodosDados()
    const interval = setInterval(carregarTodosDados, 3000)
    return () => clearInterval(interval)
  }, [])

  const criarAgendamentoTeste = () => {
    const agendamentoTeste = {
      id: `teste_${Date.now()}`,
      mentorNome: "João Mentor Silva",
      mentorEmail: "mentor@email.com",
      alunoId: user?.id || "2",
      data: new Date().toISOString(),
      horario: "14:00",
      assunto: "Teste de agendamento detalhado",
      telefone: "(11) 99999-9999",
      status: "pendente",
      createdAt: new Date().toISOString(),
    }

    const existentes = JSON.parse(localStorage.getItem("agendamentos") || "[]")
    const novos = [...existentes, agendamentoTeste]
    localStorage.setItem("agendamentos", JSON.stringify(novos))

    console.log("🧪 [DEBUG] Agendamento teste criado:", agendamentoTeste)
    carregarTodosDados()
  }

  const limparTudo = () => {
    localStorage.removeItem("agendamentos")
    localStorage.removeItem("agendamentos_supabase")
    setAgendamentosLocal([])
    setAgendamentosSupabase([])
    console.log("🗑️ [DEBUG] Todos os dados limpos")
  }

  const filtrarPorUsuario = (agendamentos: any[]) => {
    if (!user) return agendamentos

    return agendamentos.filter((ag) => {
      if (user.tipo === "mentor") {
        return ag.mentorEmail === user.email || ag.mentor_id === user.id
      } else {
        return ag.alunoId === user.id || ag.aluno_id === user.id
      }
    })
  }

  const agendamentosLocalFiltrados = filtrarPorUsuario(agendamentosLocal)
  const agendamentosSupabaseFiltrados = filtrarPorUsuario(agendamentosSupabase)

  return (
    <div className="space-y-4">
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            🔍 Debug Detalhado - Agendamentos
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={carregarTodosDados}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Recarregar
              </Button>
              <Button size="sm" variant="secondary" onClick={criarAgendamentoTeste}>
                🧪 Teste
              </Button>
              <Button size="sm" variant="destructive" onClick={limparTudo}>
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informações do Usuário */}
          <div className="p-3 bg-white rounded border">
            <h4 className="font-medium mb-2">👤 Usuário Atual</h4>
            <div className="text-sm space-y-1">
              <p>
                <strong>ID:</strong> {user?.id}
              </p>
              <p>
                <strong>Nome:</strong> {user?.nome}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Tipo:</strong> {user?.tipo}
              </p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded border">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4" />
                <h4 className="font-medium">localStorage</h4>
              </div>
              <div className="text-sm space-y-1">
                <p>Total: {agendamentosLocal.length}</p>
                <p>Meus: {agendamentosLocalFiltrados.length}</p>
                <p>Pendentes: {agendamentosLocalFiltrados.filter((ag) => ag.status === "pendente").length}</p>
                <p>Confirmados: {agendamentosLocalFiltrados.filter((ag) => ag.status === "confirmado").length}</p>
              </div>
            </div>

            <div className="p-3 bg-white rounded border">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4" />
                <h4 className="font-medium">Supabase Backup</h4>
              </div>
              <div className="text-sm space-y-1">
                <p>Total: {agendamentosSupabase.length}</p>
                <p>Meus: {agendamentosSupabaseFiltrados.length}</p>
                <p>Pendentes: {agendamentosSupabaseFiltrados.filter((ag) => ag.status === "pendente").length}</p>
                <p>Confirmados: {agendamentosSupabaseFiltrados.filter((ag) => ag.status === "confirmado").length}</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-600">
            <p>Última atualização: {lastUpdate}</p>
          </div>

          {/* Agendamentos localStorage */}
          {showDetails && agendamentosLocalFiltrados.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                Meus Agendamentos (localStorage)
              </h4>
              {agendamentosLocalFiltrados.map((ag, index) => (
                <div key={index} className="p-2 bg-white rounded border text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">ID: {ag.id}</span>
                    <Badge variant={ag.status === "pendente" ? "secondary" : "default"}>{ag.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p>
                        <strong>Aluno ID:</strong> {ag.alunoId}
                      </p>
                      <p>
                        <strong>Data:</strong> {new Date(ag.data).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Horário:</strong> {ag.horario}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Assunto:</strong> {ag.assunto}
                      </p>
                      <p>
                        <strong>Telefone:</strong> {ag.telefone || "N/A"}
                      </p>
                      <p>
                        <strong>Criado:</strong> {ag.createdAt ? new Date(ag.createdAt).toLocaleTimeString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Agendamentos Supabase */}
          {showDetails && agendamentosSupabaseFiltrados.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Meus Agendamentos (Supabase Backup)
              </h4>
              {agendamentosSupabaseFiltrados.map((ag, index) => (
                <div key={index} className="p-2 bg-white rounded border text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">ID: {ag.id}</span>
                    <Badge variant={ag.status === "pendente" ? "secondary" : "default"}>{ag.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p>
                        <strong>Mentor ID:</strong> {ag.mentor_id}
                      </p>
                      <p>
                        <strong>Aluno ID:</strong> {ag.aluno_id}
                      </p>
                      <p>
                        <strong>Data:</strong> {ag.data_agendamento}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Horário:</strong> {ag.horario}
                      </p>
                      <p>
                        <strong>Assunto:</strong> {ag.assunto}
                      </p>
                      <p>
                        <strong>Telefone:</strong> {ag.telefone || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {agendamentosLocalFiltrados.length === 0 && agendamentosSupabaseFiltrados.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p>Nenhum agendamento encontrado para este usuário</p>
              <Button onClick={criarAgendamentoTeste} className="mt-2" size="sm">
                Criar Agendamento Teste
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
