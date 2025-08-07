-- 🔧 CORRIGIR TABELA DE USUÁRIOS - Adicionar coluna status

-- Verificar se a coluna status existe, se não, adicionar
DO $$ 
BEGIN
    -- Tentar adicionar a coluna status
    BEGIN
        ALTER TABLE usuarios ADD COLUMN status VARCHAR(10) DEFAULT 'ativo';
        RAISE NOTICE 'Coluna status adicionada com sucesso!';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Coluna status já existe.';
    END;
END $$;

-- Atualizar usuários existentes para ter status ativo
UPDATE usuarios SET status = 'ativo' WHERE status IS NULL;

-- Verificar a estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- Mostrar dados atuais
SELECT id, nome, email, tipo, status, created_at FROM usuarios;
