-- 🗄️ CRIANDO O BANCO DE DADOS COMPLETO PARA O APP DE MENTORIA

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Limpar tabelas existentes (se houver)
DROP TABLE IF EXISTS agendamentos CASCADE;
DROP TABLE IF EXISTS configuracoes_mentor CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 👥 Tabela de usuários (mentores e alunos)
CREATE TABLE usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
('Pedro Aluno Costa', 'pedro@email.com', '123456', 'aluno', '(11) 99999-9999'),
('Ana Mentora Tech', 'ana@mentor.com', '123456', 'mentor', '(11) 88888-8888');

-- ⏰ Configuração padrão de horários para os mentores
DO $$
DECLARE
    mentor_record RECORD;
    dia INTEGER;
BEGIN
    -- Para cada mentor
    FOR mentor_record IN SELECT id FROM usuarios WHERE tipo = 'mentor' LOOP
        -- Para cada dia da semana (1=segunda, 7=domingo)
        FOR dia IN 1..7 LOOP
            INSERT INTO configuracoes_mentor (mentor_id, dia_semana, ativo, horarios) 
            VALUES (
                mentor_record.id,
                dia,
                CASE WHEN dia IN (1,2,3,4,5) THEN true ELSE false END, -- Ativo seg-sex
                CASE 
                    WHEN dia IN (1,2,3,4,5) THEN 
                        ARRAY['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']
                    ELSE ARRAY[]::TEXT[]
                END
            );
        END LOOP;
    END LOOP;
END $$;

-- 📅 Inserir alguns agendamentos de exemplo
DO $$
DECLARE
    mentor_id UUID;
    aluno_id UUID;
BEGIN
    -- Pegar IDs dos usuários de teste
    SELECT id INTO mentor_id FROM usuarios WHERE email = 'mentor@email.com' LIMIT 1;
    SELECT id INTO aluno_id FROM usuarios WHERE email = 'aluno@email.com' LIMIT 1;
    
    -- Inserir agendamentos de exemplo
    INSERT INTO agendamentos (mentor_id, aluno_id, data_agendamento, horario, assunto, status) VALUES
    (mentor_id, aluno_id, CURRENT_DATE + INTERVAL '1 day', '14:00', 'Dúvidas sobre carreira em tecnologia', 'pendente'),
    (mentor_id, aluno_id, CURRENT_DATE + INTERVAL '2 days', '10:00', 'Revisão de currículo e LinkedIn', 'confirmado'),
    (mentor_id, aluno_id, CURRENT_DATE + INTERVAL '3 days', '15:30', 'Preparação para entrevistas técnicas', 'pendente');
END $$;

-- ✅ Verificar se tudo foi criado corretamente
SELECT 
    'Tabelas criadas com sucesso!' as status,
    (SELECT COUNT(*) FROM usuarios) as usuarios_criados,
    (SELECT COUNT(*) FROM configuracoes_mentor) as configuracoes_criadas,
    (SELECT COUNT(*) FROM agendamentos) as agendamentos_criados;

-- 📋 Mostrar dados criados
SELECT 'USUÁRIOS CRIADOS:' as info, nome, email, tipo FROM usuarios
UNION ALL
SELECT 'AGENDAMENTOS:', 
    (SELECT u1.nome FROM usuarios u1 WHERE u1.id = a.mentor_id) as mentor,
    (SELECT u2.nome FROM usuarios u2 WHERE u2.id = a.aluno_id) as aluno,
    a.status
FROM agendamentos a;
