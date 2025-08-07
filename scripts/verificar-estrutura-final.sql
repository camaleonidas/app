-- 🔍 VERIFICAR ESTRUTURA FINAL DAS TABELAS

-- Verificar se todas as colunas necessárias existem
SELECT 
    'VERIFICAÇÃO FINAL:' as status,
    (
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_name = 'usuarios' AND column_name = 'status'
    ) as usuarios_tem_status,
    (
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_name = 'agendamentos' AND column_name = 'telefone'
    ) as agendamentos_tem_telefone;

-- Contar registros
SELECT 
    'CONTAGEM DE DADOS:' as info,
    (SELECT COUNT(*) FROM usuarios) as total_usuarios,
    (SELECT COUNT(*) FROM agendamentos) as total_agendamentos,
    (SELECT COUNT(*) FROM configuracoes_mentor) as total_configuracoes;

-- Mostrar estrutura completa da tabela usuarios
SELECT 'COLUNAS DA TABELA USUARIOS:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;
