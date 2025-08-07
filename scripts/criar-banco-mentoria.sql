-- 🗄️ CRIANDO O BANCO DE DADOS PARA O APP DE MENTORIA

-- Limpar tabelas existentes (se houver)
DROP TABLE IF EXISTS agendamentos CASCADE;
DROP TABLE IF EXISTS configuracoes_mentor CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 👥 Tabela de usuários (mentores e alunos)
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo VARCHAR(10) CHECK (tipo IN ('mentor', 'aluno')) NOT NULL,
  telefone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ⚙️ Tabela de configurações do mentor (horários disponíveis)
CREATE TABLE configuracoes_mentor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  dia_semana INTEGER CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0=domingo, 6=sábado
  ativo BOOLEAN DEFAULT true,
  horarios TEXT[], -- Array de horários disponíveis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentor_id, dia_semana)
);

-- 📅 Tabela de agendamentos
CREATE TABLE agendamentos (
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

-- 📊 Índices para melhor performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_agendamentos_mentor ON agendamentos(mentor_id);
CREATE INDEX idx_agendamentos_aluno ON agendamentos(aluno_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);

-- 👤 Inserir usuários de teste
INSERT INTO usuarios (nome, email, senha, tipo, telefone) VALUES 
('João Mentor Silva', 'mentor@email.com', '123456', 'mentor', '(11) 99999-1234'),
('Maria Aluna Santos', 'aluno@email.com', '123456', 'aluno', '(11) 99999-5678'),
('Pedro Aluno Costa', 'pedro@email.com', '123456', 'aluno', '(11) 99999-9999');

-- ⏰ Configuração padrão de horários para o mentor
WITH mentor_data AS (
  SELECT id FROM usuarios WHERE email = 'mentor@email.com' AND tipo = 'mentor'
)
INSERT INTO configuracoes_mentor (mentor_id, dia_semana, ativo, horarios) 
SELECT 
  mentor_data.id,
  dia,
  CASE WHEN dia IN (1,2,3,4,5) THEN true ELSE false END, -- Ativo seg-sex
  CASE 
    WHEN dia IN (1,2,3,4,5) THEN 
      ARRAY['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']
    ELSE ARRAY[]::TEXT[]
  END
FROM mentor_data, generate_series(1, 7) AS dia;

-- 📅 Inserir alguns agendamentos de exemplo
WITH mentor_data AS (SELECT id FROM usuarios WHERE email = 'mentor@email.com'),
     aluno_data AS (SELECT id FROM usuarios WHERE email = 'aluno@email.com')
INSERT INTO agendamentos (mentor_id, aluno_id, data_agendamento, horario, assunto, status)
SELECT 
  mentor_data.id,
  aluno_data.id,
  CURRENT_DATE + INTERVAL '1 day',
  '14:00',
  'Dúvidas sobre carreira em tecnologia',
  'pendente'
FROM mentor_data, aluno_data;

-- ✅ Verificar se tudo foi criado corretamente
SELECT 'Usuários criados:' as info, COUNT(*) as quantidade FROM usuarios
UNION ALL
SELECT 'Configurações criadas:', COUNT(*) FROM configuracoes_mentor
UNION ALL
SELECT 'Agendamentos criados:', COUNT(*) FROM agendamentos;
