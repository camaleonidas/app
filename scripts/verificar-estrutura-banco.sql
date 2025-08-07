-- Verificar se as tabelas existem
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('usuarios', 'agendamentos', 'configuracoes_mentor')
ORDER BY table_name, ordinal_position;

-- Contar registros em cada tabela
SELECT 'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'agendamentos' as tabela, COUNT(*) as total FROM agendamentos  
UNION ALL
SELECT 'configuracoes_mentor' as tabela, COUNT(*) as total FROM configuracoes_mentor;

-- Verificar se há dados de exemplo
SELECT 'Usuários de exemplo:' as info;
SELECT id, nome, email, tipo FROM usuarios LIMIT 5;

SELECT 'Agendamentos de exemplo:' as info;
SELECT id, data_agendamento, horario, status FROM agendamentos LIMIT 5;
