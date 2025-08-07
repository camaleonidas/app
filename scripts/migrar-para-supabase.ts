import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

interface Usuario {
  id: string
  nome: string
  email: string
  senha: string
  tipo: string
  telefone?: string
  createdAt: string
}

interface Agendamento {
  id: string
  mentorId: string
  mentorNome: string
  mentorEmail: string
  alunoId: string
  alunoNome: string
  alunoEmail: string
  data: string
  horario: string
  assunto: string
  status: string
  createdAt: string
}

async function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10)
}

async function migrarUsuarios() {
  console.log('🔄 Migrando usuários...')
  const usuarios: Usuario[] = JSON.parse(localStorage.getItem('usuarios') || '[]')
  
  for (const usuario of usuarios) {
    const senhaHash = await hashSenha(usuario.senha)
    
    const { data, error } = await supabase
      .from('usuarios')
      .upsert({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        senha: senhaHash,
        tipo: usuario.tipo,
        telefone: usuario.telefone,
        created_at: usuario.createdAt,
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      console.error(`❌ Erro ao migrar usuário ${usuario.email}:`, error)
    } else {
      console.log(`✅ Usuário ${usuario.email} migrado com sucesso`)
    }
  }
}

async function migrarAgendamentos() {
  console.log('🔄 Migrando agendamentos...')
  const agendamentos: Agendamento[] = JSON.parse(localStorage.getItem('agendamentos') || '[]')
  
  for (const agendamento of agendamentos) {
    const { data, error } = await supabase
      .from('agendamentos')
      .upsert({
        id: agendamento.id,
        mentor_id: agendamento.mentorId,
        aluno_id: agendamento.alunoId,
        data_agendamento: agendamento.data,
        horario: agendamento.horario,
        assunto: agendamento.assunto,
        status: agendamento.status,
        created_at: agendamento.createdAt,
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      console.error(`❌ Erro ao migrar agendamento ${agendamento.id}:`, error)
    } else {
      console.log(`✅ Agendamento ${agendamento.id} migrado com sucesso`)
    }
  }
}

export async function migrarDados() {
  console.log('🚀 Iniciando migração de dados para Supabase...')
  
  try {
    // Verificar conexão com Supabase
    const { data, error } = await supabase.from('usuarios').select('count')
    if (error) throw new Error('Erro ao conectar com Supabase')
    
    // Realizar migração
    await migrarUsuarios()
    await migrarAgendamentos()
    
    // Limpar localStorage após migração bem-sucedida
    localStorage.removeItem('usuarios')
    localStorage.removeItem('agendamentos')
    
    console.log('✅ Migração concluída com sucesso!')
    return true
  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    return false
  }
}

// Executar migração
if (typeof window !== 'undefined') {
  migrarDados()
}
