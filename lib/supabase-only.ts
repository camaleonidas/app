import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Verificar se está configurado
export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey)

// Tipos principais baseados na estrutura real da tabela
export interface Usuario {
  id: string
  nome: string
  email: string
  senha: string
  tipo: 'mentor' | 'aluno'
  telefone?: string
  created_at: string
  updated_at: string
}

export interface Agendamento {
  id: string
  mentor_id?: string
  aluno_id?: string
  // Campos de data flexíveis - vamos descobrir qual existe
  data_agendamento?: string
  data?: string
  data_hora?: string
  horario?: string
  status: 'pendente' | 'aprovado' | 'recusado' | 'concluido' | 'confirmado'
  assunto?: string
  observacoes?: string
  link_call?: string
  gravacao_url?: string
  telefone?: string
  created_at: string
  updated_at?: string
  // Dados relacionados
  mentor?: Usuario
  aluno?: Usuario
}

export interface ConfiguracaoMentor {
  id: string
  mentor_id: string
  horario_inicio: string
  horario_fim: string
  dias_semana: string[]
  ativo: boolean
  created_at: string
  updated_at: string
}

// ==================== AUTENTICAÇÃO ====================

export async function autenticarUsuario(
  email: string, 
  senha: string, 
  tipo: 'mentor' | 'aluno'
): Promise<{ user: Usuario | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('senha', senha)
      .eq('tipo', tipo)
      .single()

    if (error || !data) {
      return { user: null, error: 'Email, senha ou tipo incorretos' }
    }

    return { user: data }
  } catch (error) {
    return { user: null, error: 'Erro interno do servidor' }
  }
}

export async function buscarUsuarioPorId(id: string): Promise<{ data: Usuario | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data }
  } catch (error) {
    return { data: null, error: 'Erro interno do servidor' }
  }
}

// ==================== AGENDAMENTOS ====================

export async function buscarAgendamentosPorUsuario(
  usuarioId: string, 
  tipoUsuario: 'mentor' | 'aluno'
): Promise<{ data: Agendamento[]; error?: string }> {
  try {
    const campo = tipoUsuario === 'mentor' ? 'mentor_id' : 'aluno_id'
    
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        mentor:usuarios!agendamentos_mentor_id_fkey(id, nome, email, telefone),
        aluno:usuarios!agendamentos_aluno_id_fkey(id, nome, email, telefone)
      `)
      .eq(campo, usuarioId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    return { data: data || [] }
  } catch (error) {
    return { data: [], error: 'Erro interno do servidor' }
  }
}

export async function criarAgendamento(dados: {
  mentor_id?: string
  aluno_id?: string
  data_agendamento?: string
  data?: string
  horario?: string
  assunto?: string
  telefone?: string
}): Promise<{ success: boolean; data?: Agendamento; error?: string }> {
  try {
    console.log('🔄 [SUPABASE] Criando agendamento com dados:', dados)
    
    // Preparar dados para inserção
    const dadosInsercao = {
      mentor_id: dados.mentor_id,
      aluno_id: dados.aluno_id,
      data_agendamento: dados.data_agendamento || dados.data,
      horario: dados.horario,
      assunto: dados.assunto,
      telefone: dados.telefone,
      status: 'pendente'
    }
    
    console.log('📋 [SUPABASE] Dados preparados:', dadosInsercao)
    
    const { data, error } = await supabase
      .from('agendamentos')
      .insert([dadosInsercao])
      .select(`
        *,
        mentor:usuarios!agendamentos_mentor_id_fkey(id, nome, email, telefone),
        aluno:usuarios!agendamentos_aluno_id_fkey(id, nome, email, telefone)
      `)
      .single()

    if (error) {
      console.error('❌ [SUPABASE] Erro ao inserir:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ [SUPABASE] Agendamento criado:', data)
    return { success: true, data }
  } catch (error) {
    console.error('❌ [SUPABASE] Erro geral:', error)
    return { success: false, error: 'Erro interno do servidor' }
  }
}

export async function atualizarStatusAgendamento(
  agendamentoId: string,
  novoStatus: 'pendente' | 'aprovado' | 'recusado' | 'concluido' | 'confirmado',
  observacoes?: string
): Promise<{ success: boolean; data?: Agendamento; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .update({
        status: novoStatus,
        observacoes: observacoes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', agendamentoId)
      .select(`
        *,
        mentor:usuarios!agendamentos_mentor_id_fkey(id, nome, email, telefone),
        aluno:usuarios!agendamentos_aluno_id_fkey(id, nome, email, telefone)
      `)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'Erro interno do servidor' }
  }
}

export async function adicionarLinkCall(
  agendamentoId: string,
  linkCall: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('agendamentos')
      .update({
        link_call: linkCall,
        updated_at: new Date().toISOString()
      })
      .eq('id', agendamentoId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Erro interno do servidor' }
  }
}

export async function adicionarGravacao(
  agendamentoId: string,
  gravacaoUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('agendamentos')
      .update({
        gravacao_url: gravacaoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', agendamentoId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// ==================== USUÁRIOS ====================

export async function buscarMentores(): Promise<{ data: Usuario[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('tipo', 'mentor')
      .order('nome')

    if (error) {
      return { data: [], error: error.message }
    }

    return { data: data || [] }
  } catch (error) {
    return { data: [], error: 'Erro interno do servidor' }
  }
}

export async function buscarAlunos(): Promise<{ data: Usuario[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('tipo', 'aluno')
      .order('nome')

    if (error) {
      return { data: [], error: error.message }
    }

    return { data: data || [] }
  } catch (error) {
    return { data: [], error: 'Erro interno do servidor' }
  }
}

export async function buscarTodosAgendamentos(): Promise<{ data: Agendamento[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        mentor:usuarios!agendamentos_mentor_id_fkey(id, nome, email, telefone),
        aluno:usuarios!agendamentos_aluno_id_fkey(id, nome, email, telefone)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    return { data: data || [] }
  } catch (error) {
    return { data: [], error: 'Erro interno do servidor' }
  }
}

// ==================== CONFIGURAÇÕES MENTOR ====================

export async function buscarConfiguracaoMentor(
  mentorId: string
): Promise<{ data: ConfiguracaoMentor | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('configuracoes_mentor')
      .select('*')
      .eq('mentor_id', mentorId)
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data }
  } catch (error) {
    return { data: null, error: 'Erro interno do servidor' }
  }
}

export async function salvarConfiguracaoMentor(
  config: Omit<ConfiguracaoMentor, 'id' | 'created_at' | 'updated_at'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('configuracoes_mentor')
      .upsert([{
        ...config,
        updated_at: new Date().toISOString()
      }], { 
        onConflict: 'mentor_id' 
      })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Erro interno do servidor' }
  }
}

// ==================== TEMPO REAL ====================

export function subscribeToChanges(table: string, callback: (payload: any) => void) {
  return supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe()
}

// ==================== TESTE DE CONEXÃO ====================

export async function testarConexaoSupabase(): Promise<{ success: boolean; message: string }> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1)

    if (error) {
      return { success: false, message: `Erro de conexão: ${error.message}` }
    }

    return { success: true, message: 'Conexão com Supabase estabelecida com sucesso!' }
  } catch (error) {
    return { success: false, message: `Erro crítico: ${error}` }
  }
}
