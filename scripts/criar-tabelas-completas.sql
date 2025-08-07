-- Script para criar tabelas do MentoriaApp
-- Execute este SQL no Supabase Dashboard → SQL Editor

-- 1. Tabela de usuários (mentores e alunos)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('mentor', 'aluno')) NOT NULL,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de configurações dos mentores
CREATE TABLE IF NOT EXISTS configuracoes_mentor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  horarios_disponiveis JSONB DEFAULT '{}',
  preco_por_hora DECIMAL(10,2) DEFAULT 0,
  especialidades TEXT[] DEFAULT '{}',
  bio TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  data_agendamento DATE NOT NULL,
  horario TIME NOT NULL,
  assunto TEXT NOT NULL,
  status TEXT CHECK (status IN ('pendente', 'confirmado', 'recusado', 'cancelado', 'concluido')) DEFAULT 'pendente',
  motivo_recusa TEXT,
  observacoes TEXT,
  link_call TEXT,
  gravacao_url TEXT,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_agendamentos_mentor ON agendamentos(mentor_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_aluno ON agendamentos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- 5. Inserir dados de exemplo (opcional)
INSERT INTO usuarios (nome, email, senha, tipo, telefone) VALUES
('João Mentor', 'joao@mentor.com', 'senha123', 'mentor', '(11) 99999-1111'),
('Maria Aluna', 'maria@aluna.com', 'senha123', 'aluno', '(11) 99999-2222')
ON CONFLICT (email) DO NOTHING;

-- Mensagem de sucesso
SELECT 'Tabelas criadas com sucesso! 🎉' as resultado;
