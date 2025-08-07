-- 🔍 VERIFICAR UUIDs DOS USUÁRIOS

-- Mostrar todos os usuários com seus UUIDs
SELECT 
    id,
    nome,
    email,
    tipo,
    status,
    created_at
FROM usuarios
ORDER BY tipo, nome;

-- Verificar especificamente o mentor principal
SELECT 
    'MENTOR PRINCIPAL:' as info,
    id,
    nome,
    email
FROM usuarios 
WHERE email = 'mentor@email.com' AND tipo = 'mentor';

-- Verificar se há agendamentos existentes
SELECT 
    'AGENDAMENTOS EXISTENTES:' as info,
    COUNT(*) as total
FROM agendamentos;
