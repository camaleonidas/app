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
import { CalendarIcon, User, Mail, Phone, Save, X, AlertTriangle, History, Ban } from "lucide-react"
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

interface ModalEditarAgendamentoProps {
  agendamento: Agendamento | null
  isOpen: boolean
  onClose: () => void
  onSave: (agendamentoAtualizado: Agendamento) => void
  horariosDisponiveis: string[]
}

export function ModalEditarAgendamento({
  agendamento,
  isOpen,
  onClose,
  onSave,
  horariosDisponiveis,
}: ModalEditarAgendamentoProps) {
  const [formData, setFormData] = useState({
    data: new Date(),
    horario: "",
    assunto: "",
    telefone: "",
    observacoes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [motivoCancelamento, setMotivoCancelamento] = useState("")
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
      })
      setShowCancelDialog(false)
      setMotivoCancelamento("")
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
        acao: "Agendamento editado",
        detalhes: `Data: ${format(agendamento.data, "dd/MM/yyyy")} → ${format(formData.data, "dd/MM/yyyy")}, Horário: ${agendamento.horario} → ${formData.horario}`,
        timestamp: new Date().toLocaleString(),
      }

      const agendamentoAtualizado: Agendamento = {
        ...agendamento,
        data: formData.data,
        horario: formData.horario,
        assunto: formData.assunto,
        telefone: formData.telefone,
        editHistory: [...(agendamento.editHistory || []), novoHistorico],
      }

      onSave(agendamentoAtualizado)
      onClose()

      alert("✅ Agendamento atualizado com sucesso!")
    } catch (error) {
      alert("❌ Erro ao salvar alterações")
    } finally {
      setIsLoading(false)
    }
  }

  const cancelarAgendamento = async () => {
    if (!agendamento) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const novoHistorico = {
        data: new Date().toISOString(),
        acao: "Agendamento cancelado",
        detalhes: motivoCancelamento || "Cancelado pelo mentor",
        timestamp: new Date().toLocaleString(),
      }

      const agendamentoCancelado: Agendamento = {
        ...agendamento,
        status: "cancelado",
        motivoRecusa: motivoCancelamento,
        editHistory: [...(agendamento.editHistory || []), novoHistorico],
      }

      onSave(agendamentoCancelado)
      onClose()

      alert("✅ Agendamento cancelado com sucesso!")
    } catch (error) {
      alert("❌ Erro ao cancelar agendamento")
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Editar Agendamento - {agendamento.alunoNome}
          </DialogTitle>
          <DialogDescription>Modifique os detalhes do agendamento ou cancele se necessário</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Aluno */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Informações do Aluno</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{agendamento.alunoEmail}</span>
              </div>
              {agendamento.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{agendamento.telefone}</span>
                </div>
              )}
            </div>
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
              <h3 className="font-medium">Data e Horário</h3>

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
                  {horariosDisponiveis.map((horario) => (
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
                <Label htmlFor="observacoes">Observações da Edição</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Motivo da alteração, observações..."
                  rows={2}
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

          {/* Cancelamento */}
          {!showCancelDialog ? (
            <div className="flex justify-between">
              <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                <Ban className="h-4 w-4 mr-2" />
                Cancelar Agendamento
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
                <Button onClick={salvarAlteracoes} disabled={isLoading || conflitos.length > 0}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
              <h4 className="font-medium text-red-800">Cancelar Agendamento</h4>
              <div>
                <Label htmlFor="motivoCancelamento">Motivo do Cancelamento</Label>
                <Textarea
                  id="motivoCancelamento"
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  placeholder="Explique o motivo do cancelamento para o aluno..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                  Voltar
                </Button>
                <Button variant="destructive" onClick={cancelarAgendamento} disabled={isLoading}>
                  <X className="h-4 w-4 mr-2" />
                  {isLoading ? "Cancelando..." : "Confirmar Cancelamento"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
