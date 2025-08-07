"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Clock, Calendar, Save, RotateCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface HorarioConfig {
  dia: string
  diaSemana: number
  ativo: boolean
  horarios: string[]
}

const diasSemana = [
  { nome: "Segunda-feira", numero: 1 },
  { nome: "Terça-feira", numero: 2 },
  { nome: "Quarta-feira", numero: 3 },
  { nome: "Quinta-feira", numero: 4 },
  { nome: "Sexta-feira", numero: 5 },
  { nome: "Sábado", numero: 6 },
  { nome: "Domingo", numero: 0 },
]

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
  "19:00",
  "19:30",
]

const configuracaoPadrao: HorarioConfig[] = [
  {
    dia: "Segunda-feira",
    diaSemana: 1,
    ativo: true,
    horarios: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30"],
  },
  {
    dia: "Terça-feira",
    diaSemana: 2,
    ativo: true,
    horarios: ["09:00", "09:30", "11:00", "11:30", "14:00", "14:30", "16:00", "16:30"],
  },
  {
    dia: "Quarta-feira",
    diaSemana: 3,
    ativo: true,
    horarios: ["10:00", "10:30", "11:00", "11:30", "15:00", "15:30", "16:00", "16:30"],
  },
  {
    dia: "Quinta-feira",
    diaSemana: 4,
    ativo: true,
    horarios: ["09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30"],
  },
  {
    dia: "Sexta-feira",
    diaSemana: 5,
    ativo: true,
    horarios: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  },
  { dia: "Sábado", diaSemana: 6, ativo: false, horarios: [] },
  { dia: "Domingo", diaSemana: 0, ativo: false, horarios: [] },
]

export function ConfiguracoesMentor() {
  const { user } = useAuth()
  const [configuracoes, setConfiguracoes] = useState<HorarioConfig[]>(configuracaoPadrao)
  const [isLoading, setIsLoading] = useState(false)

  // Carregar configurações salvas ao montar o componente
  useEffect(() => {
    if (user?.tipo === "mentor") {
      const configSalva = localStorage.getItem(`configuracoes-mentor-${user.id}`)
      if (configSalva) {
        try {
          const configParsed = JSON.parse(configSalva)
          setConfiguracoes(configParsed)
        } catch (error) {
          console.log("Erro ao carregar configurações:", error)
          setConfiguracoes(configuracaoPadrao)
        }
      }
    }
  }, [user])

  const toggleDia = (index: number) => {
    const novasConfiguracoes = [...configuracoes]
    novasConfiguracoes[index].ativo = !novasConfiguracoes[index].ativo
    if (!novasConfiguracoes[index].ativo) {
      novasConfiguracoes[index].horarios = []
    }
    setConfiguracoes(novasConfiguracoes)
  }

  const toggleHorario = (diaIndex: number, horario: string) => {
    const novasConfiguracoes = [...configuracoes]
    const horarios = novasConfiguracoes[diaIndex].horarios

    if (horarios.includes(horario)) {
      novasConfiguracoes[diaIndex].horarios = horarios.filter((h) => h !== horario)
    } else {
      novasConfiguracoes[diaIndex].horarios = [...horarios, horario].sort()
    }

    setConfiguracoes(novasConfiguracoes)
  }

  const salvarConfiguracoes = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Salvar no localStorage com ID do mentor
      localStorage.setItem(`configuracoes-mentor-${user.id}`, JSON.stringify(configuracoes))

      // Também salvar uma versão global para o aluno acessar
      localStorage.setItem("configuracoes-mentor-global", JSON.stringify(configuracoes))

      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      alert("✅ Configurações salvas com sucesso!")
    } catch (error) {
      alert("❌ Erro ao salvar configurações")
    } finally {
      setIsLoading(false)
    }
  }

  const resetarConfiguracoes = () => {
    setConfiguracoes(configuracaoPadrao)
  }

  const totalHorarios = configuracoes.reduce((total, config) => total + config.horarios.length, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Configuração de Disponibilidade
          </CardTitle>
          <CardDescription>Configure os dias e horários em que você está disponível para mentorias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <Clock className="h-3 w-3 mr-1" />
                {totalHorarios} horários/semana
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetarConfiguracoes}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetar
              </Button>
              <Button size="sm" onClick={salvarConfiguracoes} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {configuracoes.map((config, diaIndex) => (
              <div key={config.dia} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch id={`dia-${diaIndex}`} checked={config.ativo} onCheckedChange={() => toggleDia(diaIndex)} />
                    <Label htmlFor={`dia-${diaIndex}`} className="text-base font-medium">
                      {config.dia}
                    </Label>
                  </div>
                  {config.ativo && <Badge variant="secondary">{config.horarios.length} horários</Badge>}
                </div>

                {config.ativo && (
                  <div className="ml-6 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {horariosDisponiveis.map((horario) => (
                      <Button
                        key={horario}
                        variant={config.horarios.includes(horario) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleHorario(diaIndex, horario)}
                        className="h-8 text-xs"
                      >
                        {horario}
                      </Button>
                    ))}
                  </div>
                )}

                {diaIndex < configuracoes.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo da Disponibilidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {configuracoes
              .filter((config) => config.ativo && config.horarios.length > 0)
              .map((config) => (
                <div key={config.dia} className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">{config.dia}</h4>
                  <div className="flex flex-wrap gap-1">
                    {config.horarios.map((horario) => (
                      <Badge key={horario} variant="secondary" className="text-xs">
                        {horario}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {configuracoes.filter((c) => c.ativo && c.horarios.length > 0).length === 0 && (
            <p className="text-center text-gray-500 py-8">
              Nenhum dia configurado. Configure pelo menos um dia para receber agendamentos.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
