-- 🔧 ADICIONAR COLUNA TELEFONE NA TABELA AGENDAMENTOS

-- Verificar se a coluna telefone existe, se não, adicionar
DO $$ 
BEGIN
    -- Tentar adicionar a coluna telefone
    BEGIN
        ALTER TABLE agendamentos ADD COLUMN telefone VARCHAR(20);
        RAISE NOTICE 'Coluna telefone adicionada com sucesso na tabela agendamentos!';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Coluna telefone já existe na tabela agendamentos.';
    END;
END $$;

-- Verificar a estrutura da tabela agendamentos
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
ORDER BY ordinal_position;

-- Mostrar alguns agendamentos para verificar
SELECT id, data_agendamento, horario, assunto, telefone, status 
FROM agendamentos 
LIMIT 5;
