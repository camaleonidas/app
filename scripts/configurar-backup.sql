-- Configuração de Backup Automático no Supabase

-- 1. Habilitar extensão pg_cron (requer acesso de superuser)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Criar schema para backups
CREATE SCHEMA IF NOT EXISTS backup;

-- 3. Criar função para realizar backup
CREATE OR REPLACE FUNCTION backup.fazer_backup()
RETURNS void AS $$
DECLARE
    backup_path TEXT;
    timestamp_str TEXT;
BEGIN
    -- Gerar timestamp para o nome do arquivo
    timestamp_str := to_char(now(), 'YYYY_MM_DD_HH24_MI');
    
    -- Criar backup de cada tabela importante
    -- Usuários
    EXECUTE format(
        'COPY (SELECT * FROM usuarios WHERE deleted_at IS NULL) TO ''/tmp/backup_usuarios_%s.csv'' CSV HEADER',
        timestamp_str
    );
    
    -- Agendamentos
    EXECUTE format(
        'COPY (SELECT * FROM agendamentos WHERE deleted_at IS NULL) TO ''/tmp/backup_agendamentos_%s.csv'' CSV HEADER',
        timestamp_str
    );
    
    -- Configurações de mentores
    EXECUTE format(
        'COPY (SELECT * FROM configuracoes_mentores WHERE deleted_at IS NULL) TO ''/tmp/backup_config_mentores_%s.csv'' CSV HEADER',
        timestamp_str
    );
    
    -- Log de backup
    INSERT INTO backup.log (
        data_backup,
        tipo,
        status,
        detalhes
    ) VALUES (
        now(),
        'FULL',
        'SUCCESS',
        format('Backup realizado com sucesso em %s', timestamp_str)
    );
    
EXCEPTION WHEN OTHERS THEN
    -- Log de erro
    INSERT INTO backup.log (
        data_backup,
        tipo,
        status,
        detalhes
    ) VALUES (
        now(),
        'FULL',
        'ERROR',
        format('Erro no backup: %s', SQLERRM)
    );
    
    -- Repassar o erro
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar tabela de log de backups
CREATE TABLE IF NOT EXISTS backup.log (
    id SERIAL PRIMARY KEY,
    data_backup TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tipo TEXT,
    status TEXT,
    detalhes TEXT
);

-- 5. Agendar backup diário às 3 AM
SELECT cron.schedule(
    'backup-diario',  -- nome único do job
    '0 3 * * *',     -- executar todo dia às 3 AM
    'SELECT backup.fazer_backup()'
);

-- 6. Criar índices para a tabela de log
CREATE INDEX IF NOT EXISTS idx_backup_log_data ON backup.log(data_backup);
CREATE INDEX IF NOT EXISTS idx_backup_log_status ON backup.log(status);

-- 7. Criar view para monitoramento de backups
CREATE OR REPLACE VIEW backup.status_backups AS
SELECT 
    date_trunc('day', data_backup) as dia,
    count(*) as total_backups,
    count(*) FILTER (WHERE status = 'SUCCESS') as backups_sucesso,
    count(*) FILTER (WHERE status = 'ERROR') as backups_erro,
    max(data_backup) FILTER (WHERE status = 'SUCCESS') as ultimo_backup_sucesso,
    max(data_backup) FILTER (WHERE status = 'ERROR') as ultimo_backup_erro
FROM backup.log
GROUP BY date_trunc('day', data_backup)
ORDER BY dia DESC;

-- 8. Criar função para limpar backups antigos (manter últimos 30 dias)
CREATE OR REPLACE FUNCTION backup.limpar_backups_antigos()
RETURNS void AS $$
BEGIN
    DELETE FROM backup.log
    WHERE data_backup < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 9. Agendar limpeza de backups antigos (executar todo domingo às 4 AM)
SELECT cron.schedule(
    'limpar-backups-antigos',
    '0 4 * * 0',
    'SELECT backup.limpar_backups_antigos()'
);

-- Verificação final
SELECT 'Configuração de backup concluída!' as status;
SELECT cron.schedule as horario, cron.command as comando 
FROM cron.job 
WHERE schedule IN ('0 3 * * *', '0 4 * * 0');
