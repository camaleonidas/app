import { supabase } from "@/lib/supabase"

export interface Usuario {
  id: string
  nome: string
  email: string
  senha: string
  tipo: "mentor" | "aluno"
  telefone?: string
  created_at: string
}

export interface Agendamento {
  id: string
  mentor_id: string
  aluno_id: string
  data_agendamento: string
  horario: string
  assunto: string
  status: "pendente" | "confirmado" | "recusado" | "cancelado"
  motivo_recusa?: string
  created_at: string
}

// ==================== USUÁRIOS ====================

export async function buscarUsuarios(): Promise<Usuario[]> {
  try {
    const { data, error } = await supabase.from("usuarios").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao buscar usuários:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Erro crítico ao buscar usuários:", error)
    return []
  }
}

export async function criarUsuario(usuario: Omit<Usuario, "id" | "created_at">): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("usuarios").insert([usuario]).select()

    if (error) {
      console.error("Erro ao criar usuário:", error)
      return false
    }

    console.log("✅ Usuário criado no Supabase:", data)
    return true
  } catch (error) {
    console.error("Erro crítico ao criar usuário:", error)
    return false
  }
}

export async function autenticarUsuario(email: string, senha: string, tipo: string): Promise<Usuario | null> {
  try {
    console.log("🔍 Tentando autenticar:", { email, tipo })

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .eq("senha", senha)
      .eq("tipo", tipo)
      .limit(1)

    if (error) {
      console.error("Erro na autenticação:", error)
      return null
    }

    if (data && data.length > 0) {
      console.log("✅ Usuário autenticado:", data[0])
      return data[0]
    }

    console.log("❌ Usuário não encontrado")
    return null
  } catch (error) {
    console.error("Erro crítico na autenticação:", error)
    return null
  }
}

// ==================== AGENDAMENTOS ====================

export async function buscarAgendamentos(): Promise<Agendamento[]> {
  try {
    const { data, error } = await supabase
      .from("agendamentos")
      .select(`
        *,
        mentor:usuarios!agendamentos_mentor_id_fkey(nome, email, telefone),
        aluno:usuarios!agendamentos_aluno_id_fkey(nome, email, telefone)
      `)
      .order("data_agendamento", { ascending: true })

    if (error) {
      console.error("Erro ao buscar agendamentos:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Erro crítico ao buscar agendamentos:", error)
    return []
  }
}

export async function criarAgendamento(agendamento: {
  mentor_id: string
  aluno_id: string
  data_agendamento: string
  horario: string
  assunto: string
}): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("agendamentos")
      .insert([
        {
          mentor_id: agendamento.mentor_id,
          aluno_id: agendamento.aluno_id,
          data_agendamento: agendamento.data_agendamento,
          horario: agendamento.horario,
          assunto: agendamento.assunto,
          status: "pendente",
        },
      ])
      .select()

    if (error) {
      console.error("Erro ao criar agendamento:", error)
      return false
    }

    console.log("✅ Agendamento criado no Supabase:", data)
    return true
  } catch (error) {
    console.error("Erro crítico ao criar agendamento:", error)
    return false
  }
}

export async function atualizarStatusAgendamento(id: string, status: string, motivoRecusa?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("agendamentos")
      .update({
        status,
        motivo_recusa: motivoRecusa,
      })
      .eq("id", id)

    if (error) {
      console.error("Erro ao atualizar status:", error)
      return false
    }

    console.log("✅ Status atualizado no Supabase:", id, status)
    return true
  } catch (error) {
    console.error("Erro crítico ao atualizar status:", error)
    return false
  }
}

// ==================== TESTE DE CONEXÃO ====================

export async function testarConexaoCompleta(): Promise<boolean> {
  try {
    console.log("🔍 Testando conexão completa com Supabase...")

    // Testar consulta simples primeiro
    const { data: testData, error: testError } = await supabase.from("usuarios").select("id").limit(1)

    if (testError) {
      console.error("❌ Erro no teste básico:", testError)
      return false
    }

    console.log("✅ Teste básico passou")

    // Testar usuários
    const usuarios = await buscarUsuarios()
    console.log("✅ Usuários:", usuarios.length)

    // Testar agendamentos
    const agendamentos = await buscarAgendamentos()
    console.log("✅ Agendamentos:", agendamentos.length)

    return true
  } catch (error) {
    console.error("❌ Erro no teste de conexão:", error)
    return false
  }
}
