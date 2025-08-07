"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Video, Link, Calendar, Clock, User, ExternalLink, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Agendamento {
  id: string
  alunoNome: string
  alunoEmail: string
  data: Date
  horario: string
  assunto: string
  status: string
  link_call?: string
  call_adicionada_em?: string
}

interface ModalAdicionarLinkCallProps {
  agendamento: Agendamento | null
  isOpen: boolean
  onClose: () => void
  onSave: (agendamentoId: string, linkCall: string) => Promise<boolean>
  onRemove: (agendamentoId: string) => Promise<boolean>
}

export function ModalAdicionarLinkCall({
  agendamento,
  isOpen,
  onClose,
  onSave,
  onRemove,
}: ModalAdicionarLinkCallProps) {
  const [linkCall, setLinkCall] = useState("")
  const [observacoes, setObservacoes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  // Atualizar campos quando o agendamento mudar
  useState(() => {
    if (agendamento) {
      setLinkCall(agendamento.link_call || "")
      setObservacoes("")
    }
  }, [agendamento])

  const handleSave = async () => {
    if (!agendamento || !linkCall.trim()) return

    // Validação básica de URL
    const urlPattern = /^https?:\/\/.+/
    if (!urlPattern.test(linkCall.trim())) {
      alert("❌ Por favor, insira um link válido (deve começar com http:// ou https://)")
      return
    }

    setIsLoading(true)
    try {
      const sucesso = await onSave(agendamento.id, linkCall.trim())
      if (sucesso) {
        alert("✅ Link da call adicionado com sucesso!")
        onClose()
      } else {
        alert("❌ Erro ao adicionar link da call. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao salvar link:", error)
      alert("❌ Erro ao adicionar link da call. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!agendamento) return

    if (!confirm("Tem certeza que deseja remover o link da call?")) return

    setIsRemoving(true)
    try {
      const sucesso = await onRemove(agendamento.id)
      if (sucesso) {
        alert("✅ Link da call removido com sucesso!")
        setLinkCall("")
        onClose()
      } else {
        alert("❌ Erro ao remover link da call. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao remover link:", error)
      alert("❌ Erro ao remover link da call. Tente novamente.")
    } finally {
      setIsRemoving(false)
    }
  }

  const testarLink = () => {
    if (linkCall.trim()) {
      window.open(linkCall.trim(), "_blank")
    }
  }

  if (!agendamento) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            {agendamento.link_call ? "Gerenciar Link da Call" : "Adicionar Link da Call"}
          </DialogTitle>
          <DialogDescription>
            {agendamento.link_call
              ? "Edite ou remova o link da videochamada para este agendamento"
              : "Adicione o link da videochamada (Zoom, Meet, Teams, etc.) para este agendamento"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Agendamento */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">{agendamento.alunoNome}</span>
              <Badge variant="default">{agendamento.status}</Badge>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <Calendar className="h-4 w-4" />
              <span>{format(agendamento.data, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <Clock className="h-4 w-4" />
              <span>{agendamento.horario}</span>
            </div>
            <div className="text-sm text-blue-600">
              <strong>Assunto:</strong> {agendamento.assunto}
            </div>
          </div>

          {/* Link Atual (se existir) */}
          {agendamento.link_call && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Link className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Link Atual da Call</span>
              </div>
              <div className="flex items-center gap-2">
                <Input value={agendamento.link_call} readOnly className="bg-white" />
                <Button size="sm" variant="outline" onClick={() => window.open(agendamento.link_call, "_blank")}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              {agendamento.call_adicionada_em && (
                <p className="text-xs text-green-600 mt-1">
                  Adicionado em: {format(new Date(agendamento.call_adicionada_em), "dd/MM/yyyy 'às' HH:mm")}
                </p>
              )}
            </div>
          )}

          {/* Formulário */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkCall">Link da Videochamada *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="linkCall"
                  value={linkCall}
                  onChange={(e) => setLinkCall(e.target.value)}
                  placeholder="https://zoom.us/j/123456789 ou https://meet.google.com/abc-defg-hij"
                  className="flex-1"
                />
                {linkCall.trim() && (
                  <Button size="sm" variant="outline" onClick={testarLink} type="button">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Suporte: Zoom, Google Meet, Microsoft Teams, ou qualquer outro link de videochamada
              </p>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Instruções especiais, senha da reunião, etc..."
                rows={3}
              />
            </div>
          </div>

          {/* Aviso */}
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>💡 Dica:</strong> O aluno receberá acesso ao link e será notificado que a call está disponível.
              Certifique-se de que o link esteja correto e funcionando.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={!linkCall.trim() || isLoading} className="flex-1">
              {isLoading ? "Salvando..." : agendamento.link_call ? "Atualizar Link" : "Adicionar Link"}
            </Button>

            {agendamento.link_call && (
              <Button variant="destructive" onClick={handleRemove} disabled={isRemoving}>
                {isRemoving ? "Removendo..." : <Trash2 className="h-4 w-4" />}
              </Button>
            )}

            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
