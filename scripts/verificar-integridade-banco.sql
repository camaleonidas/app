-- Script para verificar integridade completa do banco
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se todas as tabelas existem
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Verificar estrutura da tabela usuarios
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela agendamentos
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'agendamentos' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar estrutura da tabela configuracoes_mentor
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'configuracoes_mentor' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Verificar foreign keys
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public';

-- 6. Contar registros em cada tabela
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'agendamentos' as tabela, COUNT(*) as total FROM agendamentos  
UNION ALL
SELECT 'configuracoes_mentor' as tabela, COUNT(*) as total FROM configuracoes_mentor;

-- 7. Verificar se há dados de exemplo
SELECT 
  'Usuários cadastrados:' as info,
  COUNT(*) as quantidade
FROM usuarios;

SELECT 
  'Agendamentos criados:' as info,
  COUNT(*) as quantidade  
FROM agendamentos;

-- 8. Verificar integridade referencial
SELECT 
  'Agendamentos órfãos (sem aluno):' as problema,
  COUNT(*) as quantidade
FROM agendamentos a
LEFT JOIN usuarios u ON a.aluno_id = u.id
WHERE u.id IS NULL;

SELECT 
  'Agendamentos órfãos (sem mentor):' as problema,
  COUNT(*) as quantidade
FROM agendamentos a
LEFT JOIN usuarios u ON a.mentor_id = u.id
WHERE u.id IS NULL;

-- 9. Verificar configurações órfãs
SELECT 
  'Configurações órfãs (sem mentor):' as problema,
  COUNT(*) as quantidade
FROM configuracoes_mentor c
LEFT JOIN usuarios u ON c.mentor_id = u.id
WHERE u.id IS NULL;

-- 10. Status final
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM usuarios) 
     AND EXISTS (SELECT 1 FROM agendamentos) 
     AND EXISTS (SELECT 1 FROM configuracoes_mentor)
    THEN '✅ BANCO PRONTO PARA PRODUÇÃO'
    ELSE '❌ BANCO PRECISA DE CONFIGURAÇÃO'
  END as status_final;
