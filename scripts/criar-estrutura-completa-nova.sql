-- Script para criar toda a estrutura do banco na sua conta Supabase
-- Execute este script no SQL Editor do seu Supabase

-- 1. CRIAR TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('mentor', 'aluno')) NOT NULL,
    telefone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR TABELA DE AGENDAMENTOS
CREATE TABLE IF NOT EXISTS agendamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    aluno_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    data_agendamento DATE NOT NULL,
    horario TIME NOT NULL,
    assunto TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pendente', 'confirmado', 'recusado', 'concluido')) DEFAULT 'pendente',
    motivo_recusa TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELA DE CONFIGURAÇÕES DOS MENTORES
CREATE TABLE IF NOT EXISTS configuracoes_mentores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    dia_semana INTEGER CHECK (dia_semana >= 0 AND dia_semana <= 6) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    horarios TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, dia_semana)
);

-- 4. INSERIR USUÁRIOS DE TESTE
INSERT INTO usuarios (nome, email, senha, tipo, telefone) VALUES
('João Mentor', 'mentor@email.com', '123456', 'mentor', '(11) 99999-9999'),
('Maria Aluna', 'aluno@email.com', '123456', 'aluno', '(11) 88888-8888'),
('Carlos Professor', 'carlos@email.com', '123456', 'mentor', '(11) 77777-7777'),
('Ana Estudante', 'ana@email.com', '123456', 'aluno', '(11) 66666-6666')
ON CONFLICT (email) DO NOTHING;

-- 5. INSERIR CONFIGURAÇÕES DE EXEMPLO PARA MENTORES
INSERT INTO configuracoes_mentores (mentor_id, dia_semana, ativo, horarios)
SELECT 
    u.id,
    dia,
    true,
    ARRAY['09:00', '10:00', '14:00', '15:00', '16:00']
FROM usuarios u
CROSS JOIN generate_series(1, 5) AS dia
WHERE u.tipo = 'mentor'
ON CONFLICT (mentor_id, dia_semana) DO NOTHING;

-- 6. INSERIR ALGUNS AGENDAMENTOS DE EXEMPLO
INSERT INTO agendamentos (mentor_id, aluno_id, data_agendamento, horario, assunto, status)
SELECT 
    m.id as mentor_id,
    a.id as aluno_id,
    CURRENT_DATE + INTERVAL '1 day' as data_agendamento,
    '10:00'::time as horario,
    'Mentoria sobre carreira' as assunto,
    'pendente' as status
FROM usuarios m
CROSS JOIN usuarios a
WHERE m.tipo = 'mentor' AND a.tipo = 'aluno'
LIMIT 3
ON CONFLICT DO NOTHING;

-- 7. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_agendamentos_mentor ON agendamentos(mentor_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_aluno ON agendamentos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_configuracoes_mentor ON configuracoes_mentores(mentor_id);

-- 8. HABILITAR RLS (Row Level Security) - OPCIONAL
-- Descomente se quiser usar autenticação do Supabase
-- ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE configuracoes_mentores ENABLE ROW LEVEL SECURITY;

-- ✅ ESTRUTURA CRIADA COM SUCESSO!
-- Agora você pode testar a conexão executando o próximo script.

SELECT 'Estrutura do banco criada com sucesso!' as resultado;
SELECT 'Usuários cadastrados: ' || COUNT(*) as usuarios FROM usuarios;
SELECT 'Agendamentos criados: ' || COUNT(*) as agendamentos FROM agendamentos;
SELECT 'Configurações criadas: ' || COUNT(*) as configuracoes FROM configuracoes_mentores;
