"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Clock, User, ArrowLeft, AlertTriangle } from 'lucide-react'
import { format, addDays, isBefore, isAfter, addHours } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { buscarMentores, criarAgendamento } from "@/lib/supabase-only"

interface Mentor {
  id: string
  nome: string
  email: string
  telefone?: string
}

interface AgendamentoAlunoProps {
  onVoltar: () => void
}

export function AgendamentoAluno({ onVoltar }: AgendamentoAlunoProps) {
  const { user } = useAuth()
  const [mentores, setMentores] = useState<Mentor[]>([])
  const [mentorSelecionado, setMentorSelecionado] = useState<string>("")
  const [data, setData] = useState<Date>()
  const [horario, setHorario] = useState<string>("")
  const [assunto, setAssunto] = useState<string>("")
  const [telefone, setTelefone] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carregar mentores
  useEffect(() => {
    const carregarMentores = async () => {
      console.log("🔍 [AGENDAMENTO] Carregando mentores...")
      setIsLoading(true)
      try {
        const { data: mentoresData, error } = await buscarMentores()
        if (error) {
          console.error("❌ [AGENDAMENTO] Erro ao carregar mentores:", error)
          return
        }
        console.log("✅ [AGENDAMENTO] Mentores carregados:", mentoresData.length)
        setMentores(mentoresData)
      } catch (error) {
        console.error("❌ [AGENDAMENTO] Erro geral ao carregar mentores:", error)
      } finally {
        setIsLoading(false)
      }
    }

    carregarMentores()
  }, [])

  // Função para verificar se um horário já passou (considerando 2h de antecedência)
  const horarioJaPassou = (data: Date, horario: string): boolean => {
    if (!data || !horario) return false
    
    const [horas, minutos] = horario.split(':').map(Number)
    const dataHorario = new Date(data)
    dataHorario.setHours(horas, minutos, 0, 0)
    
    // Adicionar 2 horas ao horário atual para a regra de antecedência
    const agora = new Date()
    const limiteMinimo = addHours(agora, 2)
    
    return isBefore(dataHorario, limiteMinimo)
  }

  // Gerar horários disponíveis (8h às 18h, de hora em hora)
  const gerarHorarios = (): string[] => {
    const horarios: string[] = []
    for (let hora = 8; hora <= 18; hora++) {
      horarios.push(`${hora.toString().padStart(2, '0')}:00`)
    }
    return horarios
  }

  // Filtrar horários disponíveis para a data selecionada
  const horariosDisponiveis = data ? gerarHorarios().filter(h => !horarioJaPassou(data, h)) : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("🔄 [AGENDAMENTO] ==================== INÍCIO CRIAÇÃO ====================")
    console.log("🔄 [AGENDAMENTO] Usuário:", user)
    console.log("🔄 [AGENDAMENTO] Mentor selecionado:", mentorSelecionado)
    console.log("🔄 [AGENDAMENTO] Data:", data)
    console.log("🔄 [AGENDAMENTO] Horário:", horario)
    console.log("🔄 [AGENDAMENTO] Assunto:", assunto)
    
    if (!user) {
      alert("❌ Você precisa estar logado para agendar uma sessão")
      return
    }

    if (!mentorSelecionado || !data || !horario || !assunto.trim()) {
      alert("❌ Por favor, preencha todos os campos obrigatórios")
      return
    }

    // Verificar novamente se o horário não passou
    if (horarioJaPassou(data, horario)) {
      alert("❌ Este horário não está mais disponível. Por favor, selecione outro horário.")
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar dados do agendamento
      const dadosAgendamento = {
        mentor_id: mentorSelecionado,
        aluno_id: user.id,
        data_agendamento: data.toISOString().split('T')[0], // YYYY-MM-DD
        horario: horario,
        assunto: assunto.trim(),
        telefone: telefone.trim() || undefined
      }

      console.log("📋 [AGENDAMENTO] Dados preparados:", dadosAgendamento)

      const { success, data: agendamentoCriado, error } = await criarAgendamento(dadosAgendamento)

      if (!success) {
        console.error("❌ [AGENDAMENTO] Erro ao criar:", error)
        alert(`❌ Erro ao criar agendamento: ${error}`)
        return
      }

      console.log("✅ [AGENDAMENTO] Agendamento criado com sucesso!")
      console.log("📋 [AGENDAMENTO] Dados retornados:", agendamentoCriado)
      
      // Limpar formulário
      setMentorSelecionado("")
      setData(undefined)
      setHorario("")
      setAssunto("")
      setTelefone("")

      alert("✅ Agendamento solicitado com sucesso! O mentor analisará sua solicitação em breve.")

    } catch (error) {
      console.error("❌ [AGENDAMENTO] Erro geral:", error)
      alert("❌ Erro interno. Tente novamente.")
    } finally {
      setIsSubmitting(false)
      console.log("🔄 [AGENDAMENTO] ==================== FIM CRIAÇÃO ====================")
    }
  }

  const mentorSelecionadoObj = mentores.find(m => m.id === mentorSelecionado)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onVoltar}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Agendar Sessão de Mentoria</h2>
          <p className="text-gray-600">Solicite uma sessão com um mentor. Mínimo 2h de antecedência.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Nova Solicitação de Agendamento
          </CardTitle>
          <CardDescription>
            Preencha os dados abaixo para solicitar uma sessão de mentoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção do Mentor */}
            <div className="space-y-2">
              <Label htmlFor="mentor">Mentor *</Label>
              <Select value={mentorSelecionado} onValueChange={setMentorSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um mentor" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Carregando mentores...</SelectItem>
                  ) : mentores.length === 0 ? (
                    <SelectItem value="empty" disabled>Nenhum mentor disponível</SelectItem>
                  ) : (
                    mentores.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {mentor.nome}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {mentorSelecionadoObj && (
                <div className="text-sm text-gray-600">
                  📧 {mentorSelecionadoObj.email}
                  {mentorSelecionadoObj.telefone && ` • 📱 ${mentorSelecionadoObj.telefone}`}
                </div>
              )}
            </div>

            {/* Seleção da Data */}
            <div className="space-y-2">
              <Label>Data da Sessão *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data ? format(data, "PPP", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data}
                    onSelect={setData}
                    disabled={(date) => 
                      isBefore(date, new Date()) || 
                      isAfter(date, addDays(new Date(), 30))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Seleção do Horário */}
            <div className="space-y-2">
              <Label htmlFor="horario">Horário *</Label>
              {!data ? (
                <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
                  Selecione uma data primeiro para ver os horários disponíveis
                </div>
              ) : horariosDisponiveis.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Selecione uma data válida</strong>
                    <br />
                    Não há horários disponíveis para esta data. Motivos possíveis:
                    <ul className="mt-2 ml-4 list-disc text-sm">
                      <li>Todos os horários já passaram (mínimo 2h de antecedência)</li>
                      <li>Data muito próxima do horário atual</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {horariosDisponiveis.map((h) => (
                    <Button
                      key={h}
                      type="button"
                      variant={horario === h ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHorario(h)}
                      className="text-xs"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {h}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Assunto */}
            <div className="space-y-2">
              <Label htmlFor="assunto">Assunto da Sessão *</Label>
              <Textarea
                id="assunto"
                placeholder="Descreva brevemente o que você gostaria de discutir na sessão..."
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone (opcional)</Label>
              <Input
                id="telefone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>

            {/* Resumo */}
            {mentorSelecionado && data && horario && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Resumo do Agendamento:</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Mentor:</strong> {mentorSelecionadoObj?.nome}</p>
                  <p><strong>Data:</strong> {format(data, "PPP", { locale: ptBR })}</p>
                  <p><strong>Horário:</strong> {horario}</p>
                  <p><strong>Status:</strong> <Badge variant="secondary">Aguardando aprovação</Badge></p>
                </div>
              </div>
            )}

            {/* Botão de Envio */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !mentorSelecionado || !data || !horario || !assunto.trim()}
            >
              {isSubmitting ? "Enviando solicitação..." : "Solicitar Agendamento"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
