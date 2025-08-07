-- Criar estrutura completa no banco de dados para agendamentos
-- Este script vai criar todas as tabelas necessárias com relacionamentos corretos

-- 1. Limpar tabelas existentes (se necessário)
DROP TABLE IF EXISTS agendamentos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 2. Criar tabela de usuários
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('mentor', 'aluno')),
    telefone VARCHAR(20),
    avatar_url TEXT,
    bio TEXT,
    especialidades TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de agendamentos
CREATE TABLE agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    aluno_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    data_agendamento DATE NOT NULL,
    horario TIME NOT NULL,
    assunto TEXT NOT NULL,
    telefone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'recusado', 'cancelado')),
    motivo_recusa TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT unique_mentor_datetime UNIQUE (mentor_id, data_agendamento, horario)
);

-- 4. Criar tabela de histórico de alterações
CREATE TABLE agendamentos_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agendamento_id UUID NOT NULL REFERENCES agendamentos(id) ON DELETE CASCADE,
    acao VARCHAR(50) NOT NULL,
    status_anterior VARCHAR(20),
    status_novo VARCHAR(20),
    detalhes TEXT,
    usuario_id UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar índices para performance
CREATE INDEX idx_agendamentos_mentor_id ON agendamentos(mentor_id);
CREATE INDEX idx_agendamentos_aluno_id ON agendamentos(aluno_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_historico_agendamento_id ON agendamentos_historico(agendamento_id);

-- 6. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Criar triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON agendamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Inserir usuários de exemplo
INSERT INTO usuarios (nome, email, senha, tipo, telefone) VALUES
('João Mentor Silva', 'mentor@email.com', '$2b$10$example_hash_mentor', 'mentor', '(11) 99999-0001'),
('Maria Aluna Santos', 'aluno@email.com', '$2b$10$example_hash_aluno', 'aluno', '(11) 99999-0002'),
('Pedro Aluno Costa', 'pedro@email.com', '$2b$10$example_hash_pedro', 'aluno', '(11) 99999-0003');

-- 9. Inserir agendamentos de exemplo
WITH mentor AS (SELECT id FROM usuarios WHERE email = 'mentor@email.com'),
     aluno1 AS (SELECT id FROM usuarios WHERE email = 'aluno@email.com'),
     aluno2 AS (SELECT id FROM usuarios WHERE email = 'pedro@email.com')

INSERT INTO agendamentos (mentor_id, aluno_id, data_agendamento, horario, assunto, status, motivo_recusa) VALUES
-- Agendamento confirmado
((SELECT id FROM mentor), (SELECT id FROM aluno1), CURRENT_DATE + INTERVAL '1 day', '10:00', 'Revisão de código React', 'confirmado', NULL),

-- Agendamento pendente
((SELECT id FROM mentor), (SELECT id FROM aluno2), CURRENT_DATE + INTERVAL '2 days', '14:00', 'Dúvidas sobre TypeScript', 'pendente', NULL),

-- Agendamento recusado (para testar reativação)
((SELECT id FROM mentor), (SELECT id FROM aluno1), CURRENT_DATE + INTERVAL '3 days', '16:00', 'Mentoria sobre carreira', 'recusado', 'Horário não disponível'),

-- Agendamento hoje
((SELECT id FROM mentor), (SELECT id FROM aluno2), CURRENT_DATE, '09:00', 'Reunião de acompanhamento', 'confirmado', NULL);

-- 10. Criar função para reativar agendamento
CREATE OR REPLACE FUNCTION reativar_agendamento(agendamento_uuid UUID, usuario_uuid UUID)
RETURNS JSON AS $$
DECLARE
    agendamento_record RECORD;
    resultado JSON;
BEGIN
    -- Verificar se o agendamento existe e está recusado
    SELECT * INTO agendamento_record 
    FROM agendamentos 
    WHERE id = agendamento_uuid AND status = 'recusado';
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Agendamento não encontrado ou não está recusado'
        );
    END IF;
    
    -- Atualizar o status para pendente
    UPDATE agendamentos 
    SET 
        status = 'pendente',
        motivo_recusa = NULL,
        updated_at = NOW()
    WHERE id = agendamento_uuid;
    
    -- Registrar no histórico
    INSERT INTO agendamentos_historico (
        agendamento_id, 
        acao, 
        status_anterior, 
        status_novo, 
        detalhes, 
        usuario_id
    ) VALUES (
        agendamento_uuid,
        'reativacao',
        'recusado',
        'pendente',
        'Agendamento reativado pelo mentor',
        usuario_uuid
    );
    
    RETURN json_build_object(
        'success', true,
        'message', 'Agendamento reativado com sucesso'
    );
END;
$$ LANGUAGE plpgsql;

-- 11. Criar função para buscar agendamentos do mentor
CREATE OR REPLACE FUNCTION buscar_agendamentos_mentor(mentor_uuid UUID)
RETURNS TABLE (
    id UUID,
    mentor_id UUID,
    aluno_id UUID,
    aluno_nome VARCHAR,
    aluno_email VARCHAR,
    aluno_telefone VARCHAR,
    data_agendamento DATE,
    horario TIME,
    assunto TEXT,
    telefone VARCHAR,
    status VARCHAR,
    motivo_recusa TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.mentor_id,
        a.aluno_id,
        u.nome as aluno_nome,
        u.email as aluno_email,
        u.telefone as aluno_telefone,
        a.data_agendamento,
        a.horario,
        a.assunto,
        a.telefone,
        a.status,
        a.motivo_recusa,
        a.created_at,
        a.updated_at
    FROM agendamentos a
    JOIN usuarios u ON a.aluno_id = u.id
    WHERE a.mentor_id = mentor_uuid
    ORDER BY a.data_agendamento DESC, a.horario DESC;
END;
$$ LANGUAGE plpgsql;

-- 12. Criar políticas RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos_historico ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados" ON usuarios
    FOR ALL USING (auth.uid()::text = id::text);

-- Política para agendamentos - mentores veem seus agendamentos, alunos veem os seus
CREATE POLICY "Mentores veem seus agendamentos" ON agendamentos
    FOR ALL USING (mentor_id::text = auth.uid()::text);

CREATE POLICY "Alunos veem seus agendamentos" ON agendamentos
    FOR ALL USING (aluno_id::text = auth.uid()::text);

-- Política para histórico
CREATE POLICY "Ver histórico dos próprios agendamentos" ON agendamentos_historico
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM agendamentos a 
            WHERE a.id = agendamento_id 
            AND (a.mentor_id::text = auth.uid()::text OR a.aluno_id::text = auth.uid()::text)
        )
    );

COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema (mentores e alunos)';
COMMENT ON TABLE agendamentos IS 'Tabela de agendamentos entre mentores e alunos';
COMMENT ON TABLE agendamentos_historico IS 'Histórico de alterações nos agendamentos';
COMMENT ON FUNCTION reativar_agendamento IS 'Função para reativar um agendamento recusado';
COMMENT ON FUNCTION buscar_agendamentos_mentor IS 'Função para buscar todos os agendamentos de um mentor';

-- Verificar se tudo foi criado corretamente
SELECT 'Estrutura criada com sucesso!' as resultado;
