import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Verifica se as variáveis existem
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

/* ----------------------------------------------------------------
 * Factory + singleton
 * ---------------------------------------------------------------- */
let _supabase: SupabaseClient | null = null

function createSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      "❌ Supabase não configurado. Defina as variáveis " + "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    )
  }

  return createClient(url, anonKey)
}

/**
 * Retorna sempre a mesma instância do Supabase Client
 * (criada apenas na primeira chamada).
 */
export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) _supabase = createSupabase()
  return _supabase
}

/* ----------------------------------------------------------------
 * Compatibilidade: export `supabase`
 * ---------------------------------------------------------------- */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop: keyof SupabaseClient) {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase não configurado - defina as variáveis de ambiente")
    }
    const client = getSupabaseClient()
    // @ts-ignore
    return client[prop]
  },
})

/* ----------------------------------------------------------------
 * Utilitário opcional para testes manuais
 * ---------------------------------------------------------------- */
export async function testarConexaoSupabase() {
  if (!isSupabaseConfigured) {
    console.warn("⚠️ Supabase não configurado - modo offline")
    return false
  }

  try {
    const client = getSupabaseClient()
    const { error } = await client.from("usuarios").select("*").limit(1)
    if (error) {
      console.error("❌ Erro na consulta:", error.message)
      return false
    }
    console.log("✅ Conexão com Supabase funcionando!")
    return true
  } catch (err) {
    console.error("❌ Erro crítico:", (err as Error).message)
    return false
  }
}

/* ----------------------------------------------------------------
 * Tipos baseados no schema do seu banco
 * ---------------------------------------------------------------- */
export interface Usuario {
  id: string
  nome: string
  email: string
  senha: string
  tipo: string
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
  status: string
  motivo_recusa?: string
  created_at: string
}

export interface ConfiguracaoMentor {
  id: string
  mentor_id: string
  dia_semana: number
  ativo: boolean
  horarios: string[]
  created_at: string
}
