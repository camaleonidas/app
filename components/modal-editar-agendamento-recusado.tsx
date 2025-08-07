"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Save, AlertTriangle, History, CheckCircle, Undo } from "lucide-react"
import { format, isSameDay } from "date-fns"
import { ptBR } from "date-fns/locale"

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
  createdAt?: string
  editHistory?: Array<{
    data: string
    acao: string
    detalhes: string
    timestamp: string
  }>
}

interface ModalEditarAgendamentoRecusadoProps {
  agendamento: Agendamento | null
  isOpen: boolean
  onClose: () => void
  onSave: (agendamentoAtualizado: Agendamento) => void
  horariosDisponiveis: string[]
}

export function ModalEditarAgendamentoRecusado({
  agendamento,
  isOpen,
  onClose,
  onSave,
  horariosDisponiveis = [],
}: ModalEditarAgendamentoRecusadoProps) {
  const [formData, setFormData] = useState({
    data: new Date(),
    horario: "",
    assunto: "",
    telefone: "",
    observacoes: "",
    novoStatus: "pendente" as "pendente" | "confirmado",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [conflitos, setConflitos] = useState<string[]>([])

  // Carregar dados do agendamento quando abrir o modal
  useEffect(() => {
    if (agendamento && isOpen) {
      setFormData({
        data: agendamento.data instanceof Date ? agendamento.data : new Date(agendamento.data),
        horario: agendamento.horario,
        assunto: agendamento.assunto,
        telefone: agendamento.telefone || "",
        observacoes: "",
        novoStatus: "pendente",
      })
      verificarConflitos(agendamento.data, agendamento.horario, agendamento.id)
    }
  }, [agendamento, isOpen])

  // Verificar conflitos de horário
  const verificarConflitos = (data: Date | string, horario: string, agendamentoId: string) => {
    const dataVerificacao = data instanceof Date ? data : new Date(data)
    const agendamentos = JSON.parse(localStorage.getItem("agendamentos") || "[]")

    const conflitosEncontrados = agendamentos
      .filter(
        (ag: any) =>
          ag.id !== agendamentoId &&
          ag.status === "confirmado" &&
          isSameDay(new Date(ag.data), dataVerificacao) &&
          ag.horario === horario,
      )
      .map((ag: any) => `${ag.alunoNome || "Aluno"} às ${ag.horario}`)

    setConflitos(conflitosEncontrados)
  }

  const handleDataChange = (novaData: Date | undefined) => {
    if (novaData && agendamento) {
      setFormData({ ...formData, data: novaData })
      verificarConflitos(novaData, formData.horario, agendamento.id)
      setShowCalendar(false)
    }
  }

  const handleHorarioChange = (novoHorario: string) => {
    if (agendamento) {
      setFormData({ ...formData, horario: novoHorario })
      verificarConflitos(formData.data, novoHorario, agendamento.id)
    }
  }

  const salvarAlteracoes = async () => {
    if (!agendamento) return

    setIsLoading(true)
    try {
      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Criar histórico da edição
      const novoHistorico = {
        data: new Date().toISOString(),
        acao: "Agendamento recusado editado e reativado",
        detalhes: `Status: recusado → ${formData.novoStatus}. Data: ${format(agendamento.data, "dd/MM/yyyy")} → ${format(formData.data, "dd/MM/yyyy")}, Horário: ${agendamento.horario} → ${formData.horario}. Observações: ${formData.observacoes || "Nenhuma"}`,
        timestamp: new Date().toLocaleString(),
      }

      const agendamentoAtualizado: Agendamento = {
        ...agendamento,
        data: formData.data,
        horario: formData.horario,
        assunto: formData.assunto,
        telefone: formData.telefone,
        status: formData.novoStatus,
        motivoRecusa: undefined, // Limpar motivo da recusa
        editHistory: [...(agendamento.editHistory || []), novoHistorico],
      }

      onSave(agendamentoAtualizado)
      onClose()

      const statusTexto = formData.novoStatus === "confirmado" ? "confirmado" : "reativado como pendente"
      alert(`✅ Agendamento ${statusTexto} com sucesso!`)
    } catch (error) {
      alert("❌ Erro ao salvar alterações")
    } finally {
      setIsLoading(false)
    }
  }

  const reagendarRapido = (dias: number) => {
    const novaData = new Date(formData.data)
    novaData.setDate(novaData.getDate() + dias)
    setFormData({ ...formData, data: novaData })
    if (agendamento) {
      verificarConflitos(novaData, formData.horario, agendamento.id)
    }
  }

  if (!agendamento) return null

  const horarios = horariosDisponiveis // already at least []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Undo className="h-5 w-5 text-red-600" />
            Editar Agendamento Recusado - {agendamento.alunoNome}
          </DialogTitle>
          <DialogDescription>
            Edite os detalhes e reative este agendamento que foi recusado anteriormente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Agendamento Recusado */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-medium text-red-800 mb-2">Status Atual: Recusado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p>
                  <strong>Aluno:</strong> {agendamento.alunoNome}
                </p>
                <p>
                  <strong>Email:</strong> {agendamento.alunoEmail}
                </p>
                {agendamento.telefone && (
                  <p>
                    <strong>Telefone:</strong> {agendamento.telefone}
                  </p>
                )}
              </div>
              <div>
                <p>
                  <strong>Data original:</strong> {format(agendamento.data, "dd/MM/yyyy")}
                </p>
                <p>
                  <strong>Horário original:</strong> {agendamento.horario}
                </p>
                <p>
                  <strong>Assunto:</strong> {agendamento.assunto}
                </p>
              </div>
            </div>
            {agendamento.motivoRecusa && (
              <div className="mt-3 p-3 bg-red-100 rounded border-l-4 border-red-400">
                <p className="text-sm font-medium text-red-800">Motivo da recusa anterior:</p>
                <p className="text-sm text-red-700">{agendamento.motivoRecusa}</p>
              </div>
            )}
          </div>

          {/* Conflitos de Horário */}
          {conflitos.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Conflito de horário detectado!</strong>
                <br />
                Já existe agendamento confirmado: {conflitos.join(", ")}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Edição de Data e Horário */}
            <div className="space-y-4">
              <h3 className="font-medium">Nova Data e Horário</h3>

              {/* Data */}
              <div>
                <Label>Data do Agendamento</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    variant="outline"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="flex-1 justify-start"
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(formData.data, "dd/MM/yyyy", { locale: ptBR })}
                  </Button>
                </div>

                {/* Reagendamento Rápido */}
                <div className="flex gap-1 mt-2">
                  <Button size="sm" variant="outline" onClick={() => reagendarRapido(1)}>
                    +1 dia
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => reagendarRapido(7)}>
                    +1 semana
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => reagendarRapido(-1)}>
                    -1 dia
                  </Button>
                </div>

                {showCalendar && (
                  <div className="mt-2 border rounded-lg p-2">
                    <Calendar
                      mode="single"
                      selected={formData.data}
                      onSelect={handleDataChange}
                      disabled={(date) => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        return date < today
                      }}
                      locale={ptBR}
                    />
                  </div>
                )}
              </div>

              {/* Horário */}
              <div>
                <Label>Horário</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {horarios.map((horario) => (
                    <Button
                      key={horario}
                      variant={formData.horario === horario ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleHorarioChange(horario)}
                      className="text-xs"
                    >
                      {horario}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Novo Status */}
              <div>
                <Label>Novo Status</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    variant={formData.novoStatus === "pendente" ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, novoStatus: "pendente" })}
                    className="flex-1"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Pendente (para análise)
                  </Button>
                  <Button
                    variant={formData.novoStatus === "confirmado" ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, novoStatus: "confirmado" })}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar diretamente
                  </Button>
                </div>
              </div>
            </div>

            {/* Edição de Detalhes */}
            <div className="space-y-4">
              <h3 className="font-medium">Detalhes</h3>

              <div>
                <Label htmlFor="assunto">Assunto da Mentoria</Label>
                <Textarea
                  id="assunto"
                  value={formData.assunto}
                  onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone de Contato</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações da Reativação</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Motivo da reativação, ajustes feitos..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Histórico de Edições */}
          {agendamento.editHistory && agendamento.editHistory.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico de Alterações
              </h3>
              <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                {agendamento.editHistory.map((edit, index) => (
                  <div key={index} className="text-sm mb-2 last:mb-0">
                    <div className="flex justify-between items-start">
                      <span className="font-medium">{edit.acao}</span>
                      <span className="text-gray-500 text-xs">{edit.timestamp}</span>
                    </div>
                    <p className="text-gray-600">{edit.detalhes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Ações */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <div className="flex gap-2">
              <Button onClick={salvarAlteracoes} disabled={isLoading || conflitos.length > 0}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading
                  ? "Salvando..."
                  : `Reativar como ${formData.novoStatus === "confirmado" ? "Confirmado" : "Pendente"}`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
