"use client"

import { useState, useEffect } from "react"
import { isSupabaseConfigured } from "@/lib/supabase"

export function useSupabaseSync() {
  const [isOnline, setIsOnline] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastSync, setLastSync] = useState<string>("")

  // Testar conexão ao inicializar
  useEffect(() => {
    testarConexao()
  }, [])

  const testarConexao = async () => {
    setIsLoading(true)

    if (!isSupabaseConfigured) {
      console.warn("⚠️ Supabase não configurado – iniciando em modo offline.")
      setIsOnline(false)
      setIsLoading(false)
      return
    }

    try {
      // Importação dinâmica para evitar erros
      const { testarConexaoCompleta } = await import("@/lib/supabase-service")
      const conectado = await testarConexaoCompleta()
      setIsOnline(conectado)
      if (conectado) {
        setLastSync(new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.warn("⚠️ Erro na conexão Supabase, usando modo offline:", error)
      setIsOnline(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Sincronizar dados do localStorage com Supabase
  const sincronizarDados = async () => {
    if (!isOnline || !isSupabaseConfigured) return false

    try {
      console.log("🔄 Iniciando sincronização...")
      const { buscarUsuarios, buscarAgendamentos } = await import("@/lib/supabase-service")

      // Buscar dados do Supabase
      const usuariosSupabase = await buscarUsuarios()
      const agendamentosSupabase = await buscarAgendamentos()

      // Salvar no localStorage como backup
      localStorage.setItem("usuarios_supabase", JSON.stringify(usuariosSupabase))
      localStorage.setItem("agendamentos_supabase", JSON.stringify(agendamentosSupabase))

      console.log("✅ Sincronização concluída")
      setLastSync(new Date().toLocaleTimeString())
      return true
    } catch (error) {
      console.error("❌ Erro na sincronização:", error)
      return false
    }
  }

  // Criar agendamento (localStorage apenas)
  const criarAgendamento = async (dadosAgendamento: {
    mentorId?: string
    alunoId: string
    data: Date
    horario: string
    assunto: string
    telefone?: string
  }) => {
    console.log("🔄 [SYNC] Criando agendamento:", dadosAgendamento)

    try {
      // Usar apenas localStorage por enquanto
      const agendamentosLocal = JSON.parse(localStorage.getItem("agendamentos") || "[]")

      const novoAgendamento = {
        id: `ag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        mentorNome: "João Mentor Silva",
        mentorEmail: "mentor@email.com",
        alunoId: dadosAgendamento.alunoId,
        data: dadosAgendamento.data.toISOString(),
        horario: dadosAgendamento.horario,
        assunto: dadosAgendamento.assunto,
        telefone: dadosAgendamento.telefone,
        status: "pendente",
        createdAt: new Date().toISOString(),
      }

      const todosAgendamentos = [...agendamentosLocal, novoAgendamento]
      localStorage.setItem("agendamentos", JSON.stringify(todosAgendamentos))

      console.log("✅ [SYNC] Agendamento salvo no localStorage")

      // Disparar evento customizado
      window.dispatchEvent(
        new CustomEvent("agendamentosCriados", {
          detail: { agendamentos: todosAgendamentos },
        }),
      )

      return true
    } catch (error) {
      console.error("❌ [SYNC] Erro ao criar agendamento:", error)
      return false
    }
  }

  // Fazer login (dados locais apenas)
  const fazerLogin = async (email: string, senha: string, tipo: "mentor" | "aluno") => {
    try {
      // Usar dados locais
      const usuariosLocal = [
        { id: "1", nome: "João Mentor Silva", email: "mentor@email.com", senha: "123456", tipo: "mentor" },
        { id: "2", nome: "Maria Aluna Santos", email: "aluno@email.com", senha: "123456", tipo: "aluno" },
        { id: "3", nome: "Pedro Aluno Costa", email: "pedro@email.com", senha: "123456", tipo: "aluno" },
      ]

      const usuario = usuariosLocal.find((u) => u.email === email && u.senha === senha && u.tipo === tipo)

      if (usuario) {
        return {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo as "mentor" | "aluno",
        }
      }

      return null
    } catch (error) {
      console.error("❌ Erro no login:", error)
      return null
    }
  }

  return {
    isOnline,
    isLoading,
    lastSync,
    testarConexao,
    sincronizarDados,
    criarAgendamento,
    fazerLogin,
  }
}
