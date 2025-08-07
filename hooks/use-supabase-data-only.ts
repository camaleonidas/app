'use client'

import { useState, useEffect } from 'react'
import { 
  agendamentoService, 
  usuarioService, 
  configuracaoMentorService,
  subscribeToChanges,
  type Agendamento, 
  type Usuario, 
  type ConfiguracaoMentor 
} from '@/lib/supabase-only'

// Hook para agendamentos do mentor
export function useAgendamentosMentor(mentorId: string | null) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!mentorId) {
      setAgendamentos([])
      setIsLoading(false)
      return
    }

    const carregarAgendamentos = async () => {
      setIsLoading(true)
      const dados = await agendamentoService.buscarPorMentor(mentorId)
      setAgendamentos(dados)
      setIsLoading(false)
    }

    carregarAgendamentos()

    // Escutar mudanças em tempo real
    const subscription = subscribeToChanges('agendamentos', () => {
      carregarAgendamentos()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [mentorId])

  return { agendamentos, isLoading, recarregar: () => {
    if (mentorId) {
      agendamentoService.buscarPorMentor(mentorId).then(setAgendamentos)
    }
  }}
}

// Hook para agendamentos do aluno
export function useAgendamentosAluno(alunoId: string | null) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!alunoId) {
      setAgendamentos([])
      setIsLoading(false)
      return
    }

    const carregarAgendamentos = async () => {
      setIsLoading(true)
      const dados = await agendamentoService.buscarPorAluno(alunoId)
      setAgendamentos(dados)
      setIsLoading(false)
    }

    carregarAgendamentos()

    // Escutar mudanças em tempo real
    const subscription = subscribeToChanges('agendamentos', () => {
      carregarAgendamentos()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [alunoId])

  return { agendamentos, isLoading, recarregar: () => {
    if (alunoId) {
      agendamentoService.buscarPorAluno(alunoId).then(setAgendamentos)
    }
  }}
}

// Hook para todos os agendamentos (admin)
export function useTodosAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const carregarAgendamentos = async () => {
      setIsLoading(true)
      const dados = await agendamentoService.buscarTodos()
      setAgendamentos(dados)
      setIsLoading(false)
    }

    carregarAgendamentos()

    // Escutar mudanças em tempo real
    const subscription = subscribeToChanges('agendamentos', () => {
      carregarAgendamentos()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { agendamentos, isLoading, recarregar: () => {
    agendamentoService.buscarTodos().then(setAgendamentos)
  }}
}

// Hook para mentores
export function useMentores() {
  const [mentores, setMentores] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const carregarMentores = async () => {
      setIsLoading(true)
      const dados = await usuarioService.buscarMentores()
      setMentores(dados)
      setIsLoading(false)
    }

    carregarMentores()

    // Escutar mudanças em tempo real
    const subscription = subscribeToChanges('usuarios', () => {
      carregarMentores()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { mentores, isLoading, recarregar: () => {
    usuarioService.buscarMentores().then(setMentores)
  }}
}

// Hook para alunos
export function useAlunos() {
  const [alunos, setAlunos] = useState<Usuario[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const carregarAlunos = async () => {
      setIsLoading(true)
      const dados = await usuarioService.buscarAlunos()
      setAlunos(dados)
      setIsLoading(false)
    }

    carregarAlunos()

    // Escutar mudanças em tempo real
    const subscription = subscribeToChanges('usuarios', () => {
      carregarAlunos()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { alunos, isLoading, recarregar: () => {
    usuarioService.buscarAlunos().then(setAlunos)
  }}
}

// Hook para configuração do mentor
export function useConfiguracaoMentor(mentorId: string | null) {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoMentor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!mentorId) {
      setConfiguracao(null)
      setIsLoading(false)
      return
    }

    const carregarConfiguracao = async () => {
      setIsLoading(true)
      const dados = await configuracaoMentorService.buscarPorMentor(mentorId)
      setConfiguracao(dados)
      setIsLoading(false)
    }

    carregarConfiguracao()

    // Escutar mudanças em tempo real
    const subscription = subscribeToChanges('configuracoes_mentor', () => {
      carregarConfiguracao()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [mentorId])

  return { configuracao, isLoading, recarregar: () => {
    if (mentorId) {
      configuracaoMentorService.buscarPorMentor(mentorId).then(setConfiguracao)
    }
  }}
}
