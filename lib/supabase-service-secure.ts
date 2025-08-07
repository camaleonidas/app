import { supabase } from "@/lib/supabase"
import { cache } from "@/lib/cache"
import { handleSupabaseError, DatabaseError } from "@/lib/error-handler"
import { hashPassword, verifyPassword, AGENDAMENTO_STATUS } from "@/lib/auth-utils"
import type { UserType, AgendamentoStatus } from "@/lib/auth-utils"

export interface Usuario {
  id: string
  nome: string
  email: string
  senha?: string // Não retornar em consultas normais
  tipo: UserType
  telefone?: string
  created_at: string
  avatar_url?: string
  bio?: string
  especialidades?: string[]
}

export interface Agendamento {
  id: string
  mentor_id: string
  aluno_id: string
  data_agendamento: string
  horario: string
  assunto: string
  status: AgendamentoStatus
  motivo_recusa?: string
  created_at: string
  mentor?: Partial<Usuario>
  aluno?: Partial<Usuario>
}

// ==================== USUÁRIOS SEGUROS ====================

export async function buscarUsuarios(incluirSenhas = false): Promise<Usuario[]> {
  try {
    const cacheKey = `usuarios_${incluirSenhas ? "com_senhas" : "sem_senhas"}`
    const cached = cache.get<Usuario[]>(cacheKey)
    if (cached) return cached

    const selectFields = incluirSenhas
      ? "*"
      : "id, nome, email, tipo, telefone, created_at, avatar_url, bio, especialidades"

    const { data, error } = await supabase
      .from("usuarios")
      .select(selectFields)
      .order("created_at", { ascending: false })

    if (error) {
      throw new DatabaseError("Erro ao buscar usuários", error.message)
    }

    const usuarios = data || []
    cache.set(cacheKey, usuarios, 300) // Cache por 5 minutos
    return usuarios
  } catch (error) {
    const appError = handleSupabaseError(error)
    console.error("Erro crítico ao buscar usuários:", appError)
    return []
  }
}

export async function criarUsuario(
  usuario: Omit<Usuario, "id" | "created_at">,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validações
    if (!usuario.email || !usuario.senha || !usuario.nome) {
      return { success: false, error: "Campos obrigatórios não preenchidos" }
    }

    // Hash da senha
    const senhaHash = await hashPassword(usuario.senha)

    const { data, error } = await supabase
      .from("usuarios")
      .insert([
        {
          ...usuario,
          senha: senhaHash,
        },
      ])
      .select("id, nome, email, tipo, telefone, created_at")

    if (error) {
      const appError = handleSupabaseError(error)
      return { success: false, error: appError.message }
    }

    // Limpar cache
    cache.delete("usuarios_sem_senhas")
    cache.delete("usuarios_com_senhas")

    console.log("✅ Usuário criado com segurança:", data)
    return { success: true }
  } catch (error) {
    const appError = handleSupabaseError(error)
    return { success: false, error: appError.message }
  }
}

export async function autenticarUsuario(
  email: string,
  senha: string,
): Promise<{ user: Usuario | null; error?: string }> {
  try {
    console.log("🔍 Tentando autenticar:", { email })

    // Buscar usuário com senha
    const { data, error } = await supabase.from("usuarios").select("*").eq("email", email).limit(1)

    if (error) {
      throw new DatabaseError("Erro na consulta de autenticação", error.message)
    }

    if (!data || data.length === 0) {
      return { user: null, error: "Email não encontrado" }
    }

    const usuario = data[0]

    // Verificar senha
    const senhaValida = await verifyPassword(senha, usuario.senha)
    if (!senhaValida) {
      return { user: null, error: "Senha incorreta" }
    }

    // Remover senha do retorno
    const { senha: _, ...usuarioSemSenha } = usuario

    console.log("✅ Usuário autenticado com segurança:", usuarioSemSenha.email)
    return { user: usuarioSemSenha as Usuario }
  } catch (error) {
    const appError = handleSupabaseError(error)
    return { user: null, error: appError.message }
  }
}

// ==================== AGENDAMENTOS OTIMIZADOS ====================

export async function buscarAgendamentos(filtros?: {
  mentorId?: string
  alunoId?: string
  status?: AgendamentoStatus
  dataInicio?: string
  dataFim?: string
}): Promise<Agendamento[]> {
  try {
    const cacheKey = `agendamentos_${JSON.stringify(filtros || {})}`
    const cached = cache.get<Agendamento[]>(cacheKey)
    if (cached) return cached

    let query = supabase.from("agendamentos").select(`
        *,
        mentor:usuarios!agendamentos_mentor_id_fkey(id, nome, email, telefone, avatar_url),
        aluno:usuarios!agendamentos_aluno_id_fkey(id, nome, email, telefone, avatar_url)
      `)

    // Aplicar filtros
    if (filtros?.mentorId) {
      query = query.eq("mentor_id", filtros.mentorId)
    }
    if (filtros?.alunoId) {
      query = query.eq("aluno_id", filtros.alunoId)
    }
    if (filtros?.status) {
      query = query.eq("status", filtros.status)
    }
    if (filtros?.dataInicio) {
      query = query.gte("data_agendamento", filtros.dataInicio)
    }
    if (filtros?.dataFim) {
      query = query.lte("data_agendamento", filtros.dataFim)
    }

    const { data, error } = await query.order("data_agendamento", { ascending: true })

    if (error) {
      throw new DatabaseError("Erro ao buscar agendamentos", error.message)
    }

    const agendamentos = data || []
    cache.set(cacheKey, agendamentos, 180) // Cache por 3 minutos
    return agendamentos
  } catch (error) {
    const appError = handleSupabaseError(error)
    console.error("Erro crítico ao buscar agendamentos:", appError)
    return []
  }
}

export async function criarAgendamento(agendamento: {
  mentor_id: string
  aluno_id: string
  data_agendamento: string
  horario: string
  assunto: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Validar conflitos de horário
    const conflitos = await buscarAgendamentos({
      mentorId: agendamento.mentor_id,
      status: AGENDAMENTO_STATUS.CONFIRMADO,
    })

    const temConflito = conflitos.some(
      (ag) => ag.data_agendamento === agendamento.data_agendamento && ag.horario === agendamento.horario,
    )

    if (temConflito) {
      return { success: false, error: "Horário já ocupado" }
    }

    const { data, error } = await supabase
      .from("agendamentos")
      .insert([
        {
          ...agendamento,
          status: AGENDAMENTO_STATUS.PENDENTE,
        },
      ])
      .select()

    if (error) {
      const appError = handleSupabaseError(error)
      return { success: false, error: appError.message }
    }

    // Limpar cache relacionado
    cache.clear() // Em produção, ser mais específico

    console.log("✅ Agendamento criado:", data)
    return { success: true }
  } catch (error) {
    const appError = handleSupabaseError(error)
    return { success: false, error: appError.message }
  }
}

// ==================== TESTE DE CONEXÃO SEGURO ====================

export async function testarConexaoCompleta(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("🔍 Testando conexão segura com Supabase...")

    const { data, error } = await supabase.from("usuarios").select("id").limit(1)

    if (error) {
      const appError = handleSupabaseError(error)
      return { success: false, error: appError.message }
    }

    console.log("✅ Conexão segura estabelecida!")
    return { success: true }
  } catch (error) {
    const appError = handleSupabaseError(error)
    return { success: false, error: appError.message }
  }
}
