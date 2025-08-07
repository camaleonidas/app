"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

interface Agendamento {
  id: string
  nome: string
  email: string
  telefone: string
  data: Date
  horario: string
  assunto: string
  status: "confirmado" | "pendente" | "recusado"
  motivoRecusa?: string
  mentor_id?: string
  aluno_id?: string
}

interface ConfiguracaoMentor {
  dia_semana: number
  ativo: boolean
  horarios: string[]
}

export function useSupabaseData() {
  const { user } = useAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [configuracoesMentor, setConfiguracoesMentor] = useState<ConfiguracaoMentor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Buscar agendamentos
  const buscarAgendamentos = async () => {
    if (!user) return

    try {
      let query = supabase.from("agendamentos").select(`
          id,
          data_agendamento,
          horario,
          assunto,
          status,
          motivo_recusa,
          mentor_id,
          aluno_id,
          usuarios!agendamentos_mentor_id_fkey(nome, email, telefone),
          usuarios!agendamentos_aluno_id_fkey(nome, email, telefone)
        `)

      // Filtrar por tipo de usuário
      if (user.tipo === "mentor") {
        query = query.eq("mentor_id", user.id)
      } else {
        query = query.eq("aluno_id", user.id)
      }

      const { data, error } = await query

      if (error) {
        return
      }

      if (data) {
        const agendamentosFormatados = data.map((ag: any) => ({
          id: ag.id,
          nome:
            user.tipo === "mentor"
              ? ag.usuarios.nome // Nome do aluno para mentor
              : ag.usuarios.nome, // Nome do mentor para aluno
          email: user.tipo === "mentor" ? ag.usuarios.email : ag.usuarios.email,
          telefone: ag.usuarios?.telefone || "",
          data: new Date(ag.data_agendamento),
          horario: ag.horario,
          assunto: ag.assunto,
          status: ag.status,
          motivoRecusa: ag.motivo_recusa,
          mentor_id: ag.mentor_id,
          aluno_id: ag.aluno_id,
        }))

        setAgendamentos(agendamentosFormatados)
      }
    } catch (error) {
      return
    }
  }

  // Buscar configurações do mentor
  const buscarConfiguracoesMentor = async () => {
    if (!user || user.tipo !== "mentor") return

    try {
      const { data, error } = await supabase
        .from("configuracoes_mentor")
        .select("dia_semana, ativo, horarios")
        .eq("mentor_id", user.id)
        .order("dia_semana")

      if (error) {
        return
      }

      if (data) {
        setConfiguracoesMentor(data)
      }
    } catch (error) {
      return
    }
  }

  // Criar novo agendamento
  const criarAgendamento = async (dadosAgendamento: {
    mentorId: string
    alunoId: string
    data: Date
    horario: string
    assunto: string
    telefone?: string
  }) => {
    try {
      const { data, error } = await supabase
        .from("agendamentos")
        .insert({
          mentor_id: dadosAgendamento.mentorId,
          aluno_id: dadosAgendamento.alunoId,
          data_agendamento: dadosAgendamento.data.toISOString().split("T")[0],
          horario: dadosAgendamento.horario,
          assunto: dadosAgendamento.assunto,
          status: "pendente",
        })
        .select()

      if (error) {
        return false
      }

      // Atualizar lista local
      await buscarAgendamentos()
      return true
    } catch (error) {
      return false
    }
  }

  // Atualizar status do agendamento
  const atualizarStatusAgendamento = async (
    id: string,
    novoStatus: "confirmado" | "pendente" | "recusado",
    motivoRecusa?: string,
  ) => {
    try {
      const { error } = await supabase
        .from("agendamentos")
        .update({
          status: novoStatus,
          motivo_recusa: motivoRecusa,
        })
        .eq("id", id)

      if (error) {
        return false
      }

      // Atualizar lista local
      await buscarAgendamentos()
      return true
    } catch (error) {
      return false
    }
  }

  // Buscar horários disponíveis para um dia
  const buscarHorariosDisponiveis = async (diaSemana: number): Promise<string[]> => {
    try {
      // Buscar mentor padrão (primeiro mentor encontrado)
      const { data: mentores, error: errorMentores } = await supabase
        .from("usuarios")
        .select("id")
        .eq("tipo", "mentor")
        .limit(1)

      if (errorMentores || !mentores || mentores.length === 0) {
        return []
      }

      const mentorId = mentores[0].id

      const { data, error } = await supabase
        .from("configuracoes_mentor")
        .select("horarios")
        .eq("mentor_id", mentorId)
        .eq("dia_semana", diaSemana)
        .eq("ativo", true)
        .limit(1)

      if (error || !data || data.length === 0) {
        return []
      }

      return data[0].horarios || []
    } catch (error) {
      return []
    }
  }

  useEffect(() => {
    if (user) {
      setIsLoading(true)
      Promise.all([buscarAgendamentos(), buscarConfiguracoesMentor()]).finally(() => {
        setIsLoading(false)
      })
    }
  }, [user])

  return {
    agendamentos,
    configuracoesMentor,
    isLoading,
    criarAgendamento,
    atualizarStatusAgendamento,
    buscarHorariosDisponiveis,
    recarregarDados: () => {
      buscarAgendamentos()
      buscarConfiguracoesMentor()
    },
  }
}
