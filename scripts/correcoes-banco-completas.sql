-- ========================================================
-- SCRIPT DE CORREÇÃO COMPLETA DO BANCO DE DADOS
-- Executa alterações de forma segura mantendo dados existentes
-- ========================================================

-- Iniciar transação para garantir atomicidade das alterações
BEGIN;

-- 1. Adicionar colunas de soft delete e timestamps em todas as tabelas
-- ----------------------------------------------------------------
ALTER TABLE usuarios 
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE agendamentos 
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE configuracoes_mentores 
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Criar função para atualizar updated_at automaticamente
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
    BEFORE UPDATE ON agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_mentores_updated_at
    BEFORE UPDATE ON configuracoes_mentores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Melhorar estrutura da tabela de usuários
-- ----------------------------------------------------------------
-- Adicionar validações e constraints
ALTER TABLE usuarios
    ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    ADD CONSTRAINT valid_phone CHECK (
        telefone IS NULL OR 
        telefone ~ '^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$'
    ),
    ALTER COLUMN senha SET DATA TYPE TEXT,  -- Para armazenar hashes bcrypt
    ADD CONSTRAINT senha_nao_vazia CHECK (LENGTH(senha) > 0);

-- 4. Melhorar estrutura da tabela de agendamentos
-- ----------------------------------------------------------------
-- Converter horário para incluir timezone
ALTER TABLE agendamentos
    ALTER COLUMN horario TYPE TIME WITH TIME ZONE 
    USING horario AT TIME ZONE 'UTC',
    -- Adicionar constraint para datas futuras
    ADD CONSTRAINT data_futura CHECK (data_agendamento >= CURRENT_DATE),
    -- Melhorar enum de status
    ALTER COLUMN status TYPE TEXT,
    ADD CONSTRAINT valid_status CHECK (
        status IN ('pendente', 'confirmado', 'recusado', 'concluido', 'cancelado')
    );

-- 5. Melhorar estrutura da tabela de configurações
-- ----------------------------------------------------------------
ALTER TABLE configuracoes_mentores
    -- Validar array de horários
    ADD CONSTRAINT horarios_validos CHECK (
        array_length(horarios, 1) > 0 AND
        NOT EXISTS (
            SELECT unnest(horarios) AS h
            WHERE NOT (h ~ '^([0-1][0-9]|2[0-3]):[0-5][0-9]$')
        )
    );

-- 6. Criar índices compostos para queries comuns
-- ----------------------------------------------------------------
-- Índice para busca de agendamentos por período
CREATE INDEX IF NOT EXISTS idx_agendamentos_periodo ON agendamentos (mentor_id, data_agendamento, status)
WHERE deleted_at IS NULL;

-- Índice para busca de configurações ativas
CREATE INDEX IF NOT EXISTS idx_config_ativas ON configuracoes_mentores (mentor_id, dia_semana)
WHERE ativo = true AND deleted_at IS NULL;

-- Índice para busca de usuários por tipo
CREATE INDEX IF NOT EXISTS idx_usuarios_ativos ON usuarios (tipo, email)
WHERE deleted_at IS NULL;

-- 7. Implementar Row Level Security (RLS)
-- ----------------------------------------------------------------
-- Habilitar RLS nas tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_mentores ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
CREATE POLICY usuarios_select ON usuarios
    FOR SELECT USING (
        auth.uid() = id OR  -- próprio usuário
        EXISTS (           -- ou mentor visualizando alunos
            SELECT 1 FROM usuarios u 
            WHERE u.id = auth.uid() AND u.tipo = 'mentor'
        )
    );

CREATE POLICY usuarios_update ON usuarios
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para agendamentos
CREATE POLICY agendamentos_select ON agendamentos
    FOR SELECT USING (
        mentor_id = auth.uid() OR  -- mentor do agendamento
        aluno_id = auth.uid()      -- ou aluno do agendamento
    );

CREATE POLICY agendamentos_insert ON agendamentos
    FOR INSERT WITH CHECK (
        -- Apenas alunos podem criar agendamentos
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo = 'aluno'
        )
    );

CREATE POLICY agendamentos_update ON agendamentos
    FOR UPDATE USING (
        mentor_id = auth.uid() OR  -- mentor pode atualizar
        (aluno_id = auth.uid() AND status = 'pendente')  -- aluno só pode atualizar se pendente
    );

-- Políticas para configurações de mentores
CREATE POLICY config_mentores_select ON configuracoes_mentores
    FOR SELECT USING (true);  -- visível para todos

CREATE POLICY config_mentores_insert ON configuracoes_mentores
    FOR INSERT WITH CHECK (
        mentor_id = auth.uid() AND  -- próprio mentor
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo = 'mentor'
        )
    );

CREATE POLICY config_mentores_update ON configuracoes_mentores
    FOR UPDATE USING (
        mentor_id = auth.uid() AND  -- próprio mentor
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid() AND tipo = 'mentor'
        )
    );

-- 8. Criar views para facilitar consultas comuns
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW view_agendamentos_ativos AS
SELECT 
    a.*,
    u_mentor.nome as mentor_nome,
    u_mentor.email as mentor_email,
    u_aluno.nome as aluno_nome,
    u_aluno.email as aluno_email
FROM agendamentos a
JOIN usuarios u_mentor ON a.mentor_id = u_mentor.id
JOIN usuarios u_aluno ON a.aluno_id = u_aluno.id
WHERE a.deleted_at IS NULL
AND a.data_agendamento >= CURRENT_DATE;

CREATE OR REPLACE VIEW view_mentores_disponiveis AS
SELECT 
    u.id,
    u.nome,
    u.email,
    cm.dia_semana,
    cm.horarios
FROM usuarios u
JOIN configuracoes_mentores cm ON u.id = cm.mentor_id
WHERE u.tipo = 'mentor'
AND u.deleted_at IS NULL
AND cm.ativo = true
AND cm.deleted_at IS NULL;

-- 9. Criar funções úteis
-- ----------------------------------------------------------------
-- Função para verificar disponibilidade de horário
CREATE OR REPLACE FUNCTION verificar_disponibilidade(
    p_mentor_id UUID,
    p_data DATE,
    p_horario TIME WITH TIME ZONE
) RETURNS BOOLEAN AS $$
DECLARE
    dia_semana INTEGER;
    horario_disponivel BOOLEAN;
    tem_conflito BOOLEAN;
BEGIN
    -- Pegar dia da semana (0-6)
    dia_semana := EXTRACT(DOW FROM p_data);
    
    -- Verificar se horário está configurado
    SELECT EXISTS (
        SELECT 1 
        FROM configuracoes_mentores
        WHERE mentor_id = p_mentor_id
        AND dia_semana = dia_semana
        AND ativo = true
        AND p_horario::TIME::TEXT = ANY(horarios)
        AND deleted_at IS NULL
    ) INTO horario_disponivel;
    
    IF NOT horario_disponivel THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se não tem conflito
    SELECT EXISTS (
        SELECT 1 
        FROM agendamentos
        WHERE mentor_id = p_mentor_id
        AND data_agendamento = p_data
        AND horario = p_horario
        AND status = 'confirmado'
        AND deleted_at IS NULL
    ) INTO tem_conflito;
    
    RETURN NOT tem_conflito;
END;
$$ LANGUAGE plpgsql;

-- 10. Adicionar função para soft delete
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION soft_delete_record(
    tabela TEXT,
    registro_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('
        UPDATE %I 
        SET deleted_at = NOW() 
        WHERE id = $1 
        AND deleted_at IS NULL
    ', tabela)
    USING registro_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Commit da transação
COMMIT;

-- Verificação final
DO $$
BEGIN
    RAISE NOTICE 'Verificando alterações...';
    
    -- Verificar se as colunas foram adicionadas
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'usuarios' 
        AND column_name = 'deleted_at'
    ) THEN
        RAISE NOTICE 'Soft delete implementado com sucesso!';
    END IF;
    
    -- Verificar se RLS está ativo
    IF EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE tablename = 'usuarios' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE 'RLS ativado com sucesso!';
    END IF;
    
    RAISE NOTICE 'Migração concluída com sucesso!';
END $$;
