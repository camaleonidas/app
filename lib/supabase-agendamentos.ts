import { supabase } from "@/lib/supabase"

export interface Usuario {
  id: string
  nome: string
  email: string
  tipo: "mentor" | "aluno"
  telefone?: string
  avatar_url?: string
  bio?: string
  especialidades?: string[]
  created_at: string
  updated_at: string
}

export interface Agendamento {
  id: string
  mentor_id: string
  aluno_id: string
  aluno_nome?: string
  aluno_email?: string
  aluno_telefone?: string
  data_agendamento: string
  horario: string
  assunto: string
  telefone?: string
  status: "pendente" | "confirmado" | "recusado" | "cancelado"
  motivo_recusa?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export interface HistoricoAgendamento {
  id: string
  agendamento_id: string
  acao: string
  status_anterior?: string
  status_novo?: string
  detalhes?: string
  usuario_id?: string
  created_at: string
}

// ==================== FUNÇÕES DE AGENDAMENTOS ====================

export async function buscarAgendamentosMentor(mentorId: string): Promise<{
  success: boolean
  data?: Agendamento[]
  error?: string
}> {
  try {
    console.log("🔍 [SUPABASE] Buscando agendamentos do mentor:", mentorId)

    const { data, error } = await supabase.rpc("buscar_agendamentos_mentor", {
      mentor_uuid: mentorId,
    })

    if (error) {
      console.error("❌ [SUPABASE] Erro ao buscar agendamentos:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ [SUPABASE] Agendamentos encontrados:", data?.length || 0)
    return { success: true, data: data || [] }
  } catch (error) {
    console.error("💥 [SUPABASE] Erro crítico:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

export async function reativarAgendamento(
  agendamentoId: string,
  usuarioId: string,
): Promise<{
  success: boolean
  message?: string
  error?: string
}> {
  try {
    console.log("🔄 [SUPABASE] Reativando agendamento:", { agendamentoId, usuarioId })

    const { data, error } = await supabase.rpc("reativar_agendamento", {
      agendamento_uuid: agendamentoId,
      usuario_uuid: usuarioId,
    })

    if (error) {
      console.error("❌ [SUPABASE] Erro ao reativar:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ [SUPABASE] Resultado da reativação:", data)

    if (data?.success) {
      return { success: true, message: data.message }
    } else {
      return { success: false, error: data?.error || "Erro desconhecido" }
    }
  } catch (error) {
    console.error("💥 [SUPABASE] Erro crítico na reativação:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

export async function criarAgendamento(agendamento: {
  mentor_id: string
  aluno_id: string
  data_agendamento: string
  horario: string
  assunto: string
  telefone?: string
}): Promise<{
  success: boolean
  data?: Agendamento
  error?: string
}> {
  try {
    console.log("➕ [SUPABASE] Criando agendamento:", agendamento)

    const { data, error } = await supabase
      .from("agendamentos")
      .insert([agendamento])
      .select(`
        *,
        aluno:usuarios!agendamentos_aluno_id_fkey(nome, email, telefone)
      `)
      .single()

    if (error) {
      console.error("❌ [SUPABASE] Erro ao criar agendamento:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ [SUPABASE] Agendamento criado:", data)
    return { success: true, data }
  } catch (error) {
    console.error("💥 [SUPABASE] Erro crítico ao criar:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

export async function atualizarStatusAgendamento(
  agendamentoId: string,
  novoStatus: "pendente" | "confirmado" | "recusado" | "cancelado",
  motivoRecusa?: string,
  usuarioId?: string,
): Promise<{
  success: boolean
  data?: Agendamento
  error?: string
}> {
  try {
    console.log("🔄 [SUPABASE] Atualizando status:", { agendamentoId, novoStatus, motivoRecusa })

    // Buscar status atual
    const { data: agendamentoAtual } = await supabase
      .from("agendamentos")
      .select("status")
      .eq("id", agendamentoId)
      .single()

    // Atualizar agendamento
    const { data, error } = await supabase
      .from("agendamentos")
      .update({
        status: novoStatus,
        motivo_recusa: motivoRecusa || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", agendamentoId)
      .select(`
        *,
        aluno:usuarios!agendamentos_aluno_id_fkey(nome, email, telefone)
      `)
      .single()

    if (error) {
      console.error("❌ [SUPABASE] Erro ao atualizar status:", error)
      return { success: false, error: error.message }
    }

    // Registrar no histórico
    if (usuarioId && agendamentoAtual) {
      await supabase.from("agendamentos_historico").insert([
        {
          agendamento_id: agendamentoId,
          acao: `status_alterado_${novoStatus}`,
          status_anterior: agendamentoAtual.status,
          status_novo: novoStatus,
          detalhes: motivoRecusa ? `Motivo: ${motivoRecusa}` : `Status alterado para ${novoStatus}`,
          usuario_id: usuarioId,
        },
      ])
    }

    console.log("✅ [SUPABASE] Status atualizado:", data)
    return { success: true, data }
  } catch (error) {
    console.error("💥 [SUPABASE] Erro crítico ao atualizar:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

export async function buscarHistoricoAgendamento(agendamentoId: string): Promise<{
  success: boolean
  data?: HistoricoAgendamento[]
  error?: string
}> {
  try {
    const { data, error } = await supabase
      .from("agendamentos_historico")
      .select("*")
      .eq("agendamento_id", agendamentoId)
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("💥 [SUPABASE] Erro ao buscar histórico:", error)
    return { success: false, error: "Erro interno do servidor" }
  }
}

// ==================== FUNÇÕES DE SINCRONIZAÇÃO ====================

export async function sincronizarComLocalStorage(mentorId: string): Promise<void> {
  try {
    console.log("🔄 [SYNC] Sincronizando dados do Supabase com localStorage...")

    const resultado = await buscarAgendamentosMentor(mentorId)

    if (resultado.success && resultado.data) {
      // Salvar no localStorage como backup
      localStorage.setItem("agendamentos_supabase", JSON.stringify(resultado.data))
      localStorage.setItem("agendamentos_sync_timestamp", new Date().toISOString())

      console.log("✅ [SYNC] Dados sincronizados com localStorage")
    }
  } catch (error) {
    console.error("❌ [SYNC] Erro na sincronização:", error)
  }
}

export async function testarConexaoSupabase(): Promise<{
  success: boolean
  message: string
}> {
  try {
    const { data, error } = await supabase.from("usuarios").select("id").limit(1)

    if (error) {
      return { success: false, message: `Erro de conexão: ${error.message}` }
    }

    return { success: true, message: "Conexão com Supabase estabelecida com sucesso!" }
  } catch (error) {
    return { success: false, message: `Erro crítico: ${error}` }
  }
}
