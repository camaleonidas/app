-- 🔧 CORRIGIR ESTRUTURA COMPLETA - Adicionar colunas que faltam

-- Verificar e adicionar coluna status na tabela usuarios
DO $$ 
BEGIN
    -- Tentar adicionar a coluna status
    BEGIN
        ALTER TABLE usuarios ADD COLUMN status VARCHAR(10) DEFAULT 'ativo';
        RAISE NOTICE 'Coluna status adicionada na tabela usuarios!';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Coluna status já existe na tabela usuarios.';
    END;
END $$;

-- Verificar e adicionar coluna telefone na tabela agendamentos
DO $$ 
BEGIN
    -- Tentar adicionar a coluna telefone
    BEGIN
        ALTER TABLE agendamentos ADD COLUMN telefone VARCHAR(20);
        RAISE NOTICE 'Coluna telefone adicionada na tabela agendamentos!';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Coluna telefone já existe na tabela agendamentos.';
    END;
END $$;

-- Atualizar usuários existentes para ter status ativo
UPDATE usuarios SET status = 'ativo' WHERE status IS NULL;

-- Verificar estrutura final da tabela usuarios
SELECT 'ESTRUTURA USUARIOS:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- Verificar estrutura final da tabela agendamentos  
SELECT 'ESTRUTURA AGENDAMENTOS:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
ORDER BY ordinal_position;

-- Mostrar dados atuais dos usuários
SELECT 'USUARIOS ATUAIS:' as info;
SELECT id, nome, email, tipo, status, created_at FROM usuarios;

-- Mostrar dados atuais dos agendamentos
SELECT 'AGENDAMENTOS ATUAIS:' as info;
SELECT id, data_agendamento, horario, assunto, telefone, status FROM agendamentos LIMIT 5;
