"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Trash2, Eye } from "lucide-react"

export function DebugAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [showDetails, setShowDetails] = useState(false)

  const carregarAgendamentos = () => {
    const saved = localStorage.getItem("agendamentos")
    console.log("🔍 [DEBUG] Raw localStorage:", saved)

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setAgendamentos(parsed)
        setLastUpdate(new Date().toLocaleTimeString())
        console.log("✅ [DEBUG] Agendamentos carregados:", parsed)
      } catch (error) {
        console.error("❌ [DEBUG] Erro ao parsear:", error)
        setAgendamentos([])
      }
    } else {
      setAgendamentos([])
      setLastUpdate(new Date().toLocaleTimeString())
      console.log("❌ [DEBUG] Nenhum agendamento encontrado")
    }
  }

  const limparAgendamentos = () => {
    localStorage.removeItem("agendamentos")
    setAgendamentos([])
    setLastUpdate(new Date().toLocaleTimeString())
    console.log("🗑️ [DEBUG] Agendamentos limpos")
  }

  const criarAgendamentoTeste = () => {
    const agendamentoTeste = {
      id: `teste_${Date.now()}`,
      mentorNome: "João Mentor Silva",
      mentorEmail: "mentor@email.com",
      alunoId: "2",
      data: new Date().toISOString(),
      horario: "14:00",
      assunto: "Teste de agendamento",
      telefone: "(11) 99999-9999",
      status: "pendente",
      createdAt: new Date().toISOString(),
    }

    const existentes = JSON.parse(localStorage.getItem("agendamentos") || "[]")
    const novos = [...existentes, agendamentoTeste]
    localStorage.setItem("agendamentos", JSON.stringify(novos))
    carregarAgendamentos()
    console.log("🧪 [DEBUG] Agendamento teste criado")
  }

  useEffect(() => {
    carregarAgendamentos()
    const interval = setInterval(carregarAgendamentos, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          🔍 Debug - Agendamentos
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowDetails(!showDetails)}>
              <Eye className="h-4 w-4 mr-1" />
              {showDetails ? "Ocultar" : "Detalhes"}
            </Button>
            <Button size="sm" variant="outline" onClick={carregarAgendamentos}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
            <Button size="sm" variant="secondary" onClick={criarAgendamentoTeste}>
              🧪 Teste
            </Button>
            <Button size="sm" variant="destructive" onClick={limparAgendamentos}>
              <Trash2 className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Total: {agendamentos.length} agendamentos</p>
            <p>Pendentes: {agendamentos.filter((ag) => ag.status === "pendente").length}</p>
            <p>Confirmados: {agendamentos.filter((ag) => ag.status === "confirmado").length}</p>
            <p>Última atualização: {lastUpdate}</p>
          </div>

          {agendamentos.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <p>Nenhum agendamento encontrado</p>
              <Button size="sm" onClick={criarAgendamentoTeste} className="mt-2">
                Criar Agendamento Teste
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {agendamentos.map((ag, index) => (
                <div key={index} className="p-3 border rounded text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">ID: {ag.id}</span>
                    <Badge variant={ag.status === "pendente" ? "secondary" : "default"}>{ag.status}</Badge>
                  </div>
                  <p>Aluno ID: {ag.alunoId}</p>
                  <p>Data: {new Date(ag.data).toLocaleDateString()}</p>
                  <p>Horário: {ag.horario}</p>
                  <p>Assunto: {ag.assunto}</p>
                  {showDetails && (
                    <div className="mt-2 pt-2 border-t text-xs text-gray-500">
                      <p>Criado: {ag.createdAt ? new Date(ag.createdAt).toLocaleString() : "N/A"}</p>
                      <p>Telefone: {ag.telefone || "N/A"}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
