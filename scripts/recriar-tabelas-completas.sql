-- 🗄️ RECRIAR TABELAS COMPLETAS COM TODAS AS COLUNAS

-- Fazer backup dos dados existentes (se houver)
CREATE TABLE IF NOT EXISTS usuarios_backup AS SELECT * FROM usuarios;
CREATE TABLE IF NOT EXISTS agendamentos_backup AS SELECT * FROM agendamentos;
CREATE TABLE IF NOT EXISTS configuracoes_mentor_backup AS SELECT * FROM configuracoes_mentor;

-- Recriar tabela usuarios com todas as colunas
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo VARCHAR(10) CHECK (tipo IN ('mentor', 'aluno')) NOT NULL,
  telefone VARCHAR(20),
  status VARCHAR(10) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recriar tabela configuracoes_mentor
DROP TABLE IF EXISTS configuracoes_mentor CASCADE;

CREATE TABLE configuracoes_mentor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  dia_semana INTEGER CHECK (dia_semana >= 0 AND dia_semana <= 6),
  ativo BOOLEAN DEFAULT true,
  horarios TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentor_id, dia_semana)
);

-- Recriar tabela agendamentos
DROP TABLE IF EXISTS agendamentos CASCADE;

CREATE TABLE agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  aluno_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  data_agendamento DATE NOT NULL,
  horario TIME NOT NULL,
  assunto TEXT NOT NULL,
  telefone VARCHAR(20),
  status VARCHAR(20) CHECK (status IN ('pendente', 'confirmado', 'recusado', 'cancelado')) DEFAULT 'pendente',
  motivo_recusa TEXT,
  edit_history JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentor_id, data_agendamento, horario)
);

-- Índices para performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_usuarios_status ON usuarios(status);
CREATE INDEX idx_agendamentos_mentor ON agendamentos(mentor_id);
CREATE INDEX idx_agendamentos_aluno ON agendamentos(aluno_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);

-- Inserir usuários padrão
INSERT INTO usuarios (nome, email, senha, tipo, telefone, status) VALUES 
('João Mentor Silva', 'mentor@email.com', '123456', 'mentor', '(11) 99999-1234', 'ativo'),
('Maria Aluna Santos', 'aluno@email.com', '123456', 'aluno', '(11) 99999-5678', 'ativo'),
('Pedro Aluno Costa', 'pedro@email.com', '123456', 'aluno', '(11) 99999-9999', 'ativo'),
('Ana Mentora Tech', 'ana@mentor.com', '123456', 'mentor', '(11) 88888-8888', 'ativo');

-- Configurar horários para os mentores
DO $$
DECLARE
    mentor_record RECORD;
    dia INTEGER;
BEGIN
    FOR mentor_record IN SELECT id FROM usuarios WHERE tipo = 'mentor' LOOP
        FOR dia IN 1..7 LOOP
            INSERT INTO configuracoes_mentor (mentor_id, dia_semana, ativo, horarios) 
            VALUES (
                mentor_record.id,
                dia,
                CASE WHEN dia IN (1,2,3,4,5) THEN true ELSE false END,
                CASE 
                    WHEN dia IN (1,2,3,4,5) THEN 
                        ARRAY['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']
                    ELSE ARRAY[]::TEXT[]
                END
            );
        END LOOP;
    END LOOP;
END $$;

-- Verificar se tudo foi criado
SELECT 'Usuários criados:' as info, COUNT(*) as quantidade FROM usuarios
UNION ALL
SELECT 'Configurações criadas:', COUNT(*) FROM configuracoes_mentor
UNION ALL
SELECT 'Agendamentos criados:', COUNT(*) FROM agendamentos;

-- Mostrar estrutura das tabelas
SELECT 'ESTRUTURA DA TABELA USUARIOS:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;
