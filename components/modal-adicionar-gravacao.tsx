"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Video, Calendar, Clock, User, ExternalLink, Eye, EyeOff } from "lucide-react"
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
  link_gravacao?: string
  senha_gravacao?: string
  observacoes_gravacao?: string
  gravacao_adicionada_em?: string
}

interface ModalAdicionarGravacaoProps {
  agendamento: Agendamento | null
  isOpen: boolean
  onClose: () => void
  onSave: (
    agendamentoId: string,
    dadosGravacao: {
      link_gravacao: string
      senha_gravacao?: string
      observacoes_gravacao?: string
    },
  ) => Promise<boolean>
  onRemove: (agendamentoId: string) => Promise<boolean>
}

export function ModalAdicionarGravacao({
  agendamento,
  isOpen,
  onClose,
  onSave,
  onRemove,
}: ModalAdicionarGravacaoProps) {
  const [linkGravacao, setLinkGravacao] = useState("")
  const [senhaGravacao, setSenhaGravacao] = useState("")
  const [observacoesGravacao, setObservacoesGravacao] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  // Atualizar campos quando o agendamento mudar
  useState(() => {
    if (agendamento) {
      setLinkGravacao(agendamento.link_gravacao || "")
      setSenhaGravacao(agendamento.senha_gravacao || "")
      setObservacoesGravacao(agendamento.observacoes_gravacao || "")
    }
  }, [agendamento])

  const handleSave = async () => {
    if (!agendamento || !linkGravacao.trim()) return

    // Validação básica de URL
    const urlPattern = /^https?:\/\/.+/
    if (!urlPattern.test(linkGravacao.trim())) {
      alert("❌ Por favor, insira um link válido (deve começar com http:// ou https://)")
      return
    }

    setIsLoading(true)
    try {
      const sucesso = await onSave(agendamento.id, {
        link_gravacao: linkGravacao.trim(),
        senha_gravacao: senhaGravacao.trim() || undefined,
        observacoes_gravacao: observacoesGravacao.trim() || undefined,
      })

      if (sucesso) {
        alert("✅ Gravação adicionada com sucesso! O aluno já pode acessar.")
        onClose()
      } else {
        alert("❌ Erro ao adicionar gravação. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao salvar gravação:", error)
      alert("❌ Erro ao adicionar gravação. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!agendamento) return

    if (!confirm("Tem certeza que deseja remover a gravação? O aluno perderá o acesso.")) return

    setIsRemoving(true)
    try {
      const sucesso = await onRemove(agendamento.id)
      if (sucesso) {
        alert("✅ Gravação removida com sucesso!")
        setLinkGravacao("")
        setSenhaGravacao("")
        setObservacoesGravacao("")
        onClose()
      } else {
        alert("❌ Erro ao remover gravação. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao remover gravação:", error)
      alert("❌ Erro ao remover gravação. Tente novamente.")
    } finally {
      setIsRemoving(false)
    }
  }

  const testarLink = () => {
    if (linkGravacao.trim()) {
      window.open(linkGravacao.trim(), "_blank")
    }
  }

  if (!agendamento) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            {agendamento.link_gravacao ? "Gerenciar Gravação da Call" : "Adicionar Gravação da Call"}
          </DialogTitle>
          <DialogDescription>
            {agendamento.link_gravacao
              ? "Edite ou remova o link da gravação desta mentoria"
              : "Adicione o link da gravação (Zoom Cloud, Google Drive, etc.) para que o aluno possa acessar"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Agendamento */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">{agendamento.alunoNome}</span>
              <Badge variant="default" className="bg-green-600">
                Finalizada
              </Badge>
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

          {/* Gravação Atual (se existir) */}
          {agendamento.link_gravacao && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Video className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-900">Gravação Atual</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input value={agendamento.link_gravacao} readOnly className="bg-white" />
                  <Button size="sm" variant="outline" onClick={() => window.open(agendamento.link_gravacao, "_blank")}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                {agendamento.senha_gravacao && (
                  <div className="text-sm text-green-700">
                    <strong>Senha:</strong> {agendamento.senha_gravacao}
                  </div>
                )}
              </div>
              {agendamento.gravacao_adicionada_em && (
                <p className="text-xs text-green-600 mt-2">
                  Adicionado em: {format(new Date(agendamento.gravacao_adicionada_em), "dd/MM/yyyy 'às' HH:mm")}
                </p>
              )}
            </div>
          )}

          {/* Formulário */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkGravacao">Link da Gravação *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="linkGravacao"
                  value={linkGravacao}
                  onChange={(e) => setLinkGravacao(e.target.value)}
                  placeholder="https://zoom.us/rec/share/... ou https://drive.google.com/..."
                  className="flex-1"
                />
                {linkGravacao.trim() && (
                  <Button size="sm" variant="outline" onClick={testarLink} type="button">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Suporte: Zoom Cloud, Google Drive, YouTube, Vimeo, ou qualquer plataforma de vídeo
              </p>
            </div>

            <div>
              <Label htmlFor="senhaGravacao">Senha da Gravação (opcional)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="senhaGravacao"
                  type={mostrarSenha ? "text" : "password"}
                  value={senhaGravacao}
                  onChange={(e) => setSenhaGravacao(e.target.value)}
                  placeholder="Senha para acessar a gravação (se necessário)"
                  className="flex-1"
                />
                <Button size="sm" variant="outline" onClick={() => setMostrarSenha(!mostrarSenha)} type="button">
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="observacoesGravacao">Observações sobre a Gravação (opcional)</Label>
              <Textarea
                id="observacoesGravacao"
                value={observacoesGravacao}
                onChange={(e) => setObservacoesGravacao(e.target.value)}
                placeholder="Instruções especiais, tópicos abordados, timestamps importantes, etc..."
                rows={3}
              />
            </div>
          </div>

          {/* Aviso */}
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>📹 Importante:</strong> O aluno receberá acesso imediato à gravação e poderá visualizá-la no
              painel "Minhas Calls Realizadas". Certifique-se de que o link esteja funcionando e acessível.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={!linkGravacao.trim() || isLoading} className="flex-1">
              {isLoading ? "Salvando..." : agendamento.link_gravacao ? "Atualizar Gravação" : "Adicionar Gravação"}
            </Button>

            {agendamento.link_gravacao && (
              <Button variant="destructive" onClick={handleRemove} disabled={isRemoving}>
                {isRemoving ? "Removendo..." : "Remover"}
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
