-- Vamos criar as tabelas para o nosso app de mentoria

-- Tabela de usuários (mentores e alunos)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo VARCHAR(10) CHECK (tipo IN ('mentor', 'aluno')) NOT NULL,
  telefone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do mentor
CREATE TABLE IF NOT EXISTS configuracoes_mentor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  dia_semana INTEGER CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0=domingo, 6=sábado
  ativo BOOLEAN DEFAULT true,
  horarios TEXT[], -- Array de horários disponíveis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentor_id, dia_semana)
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  aluno_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  data_agendamento DATE NOT NULL,
  horario TIME NOT NULL,
  assunto TEXT NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pendente', 'confirmado', 'recusado', 'concluido')) DEFAULT 'pendente',
  motivo_recusa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentor_id, data_agendamento, horario) -- Evita conflitos de horário
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_agendamentos_mentor ON agendamentos(mentor_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_aluno ON agendamentos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- Inserir usuários de teste
INSERT INTO usuarios (nome, email, senha, tipo) VALUES 
('João Mentor', 'mentor@email.com', '123456', 'mentor'),
('Maria Aluna', 'aluno@email.com', '123456', 'aluno')
ON CONFLICT (email) DO NOTHING;

-- Inserir configuração padrão para o mentor
INSERT INTO configuracoes_mentor (mentor_id, dia_semana, ativo, horarios) 
SELECT 
  u.id,
  generate_series(1, 5) as dia_semana, -- Segunda a sexta
  true,
  ARRAY['09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30']
FROM usuarios u 
WHERE u.tipo = 'mentor' AND u.email = 'mentor@email.com'
ON CONFLICT (mentor_id, dia_semana) DO NOTHING;
