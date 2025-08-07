-- Adicionar coluna para link da call na tabela agendamentos
ALTER TABLE agendamentos 
ADD COLUMN link_call TEXT,
ADD COLUMN call_adicionada_em TIMESTAMP WITH TIME ZONE,
ADD COLUMN call_adicionada_por UUID REFERENCES usuarios(id);

-- Criar índice para performance
CREATE INDEX idx_agendamentos_link_call ON agendamentos(link_call) WHERE link_call IS NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN agendamentos.link_call IS 'Link da videochamada (Zoom, Meet, etc.)';
COMMENT ON COLUMN agendamentos.call_adicionada_em IS 'Timestamp de quando o link foi adicionado';
COMMENT ON COLUMN agendamentos.call_adicionada_por IS 'ID do usuário que adicionou o link';

-- Função para adicionar link da call
CREATE OR REPLACE FUNCTION adicionar_link_call(
  agendamento_uuid UUID,
  link_url TEXT,
  mentor_uuid UUID
) RETURNS JSON AS $$
DECLARE
  agendamento_record agendamentos%ROWTYPE;
  resultado JSON;
BEGIN
  -- Verificar se o agendamento existe e pertence ao mentor
  SELECT * INTO agendamento_record 
  FROM agendamentos 
  WHERE id = agendamento_uuid AND mentor_id = mentor_uuid;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Agendamento não encontrado ou você não tem permissão'
    );
  END IF;
  
  -- Verificar se o agendamento está confirmado
  IF agendamento_record.status != 'confirmado' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Só é possível adicionar link para agendamentos confirmados'
    );
  END IF;
  
  -- Validar URL básica
  IF link_url IS NULL OR length(trim(link_url)) < 10 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Link inválido'
    );
  END IF;
  
  -- Atualizar o agendamento com o link
  UPDATE agendamentos 
  SET 
    link_call = trim(link_url),
    call_adicionada_em = NOW(),
    call_adicionada_por = mentor_uuid,
    updated_at = NOW()
  WHERE id = agendamento_uuid;
  
  -- Registrar no histórico
  INSERT INTO agendamentos_historico (
    agendamento_id,
    acao,
    detalhes,
    usuario_id
  ) VALUES (
    agendamento_uuid,
    'link_call_adicionado',
    'Link da videochamada adicionado: ' || left(link_url, 50) || '...',
    mentor_uuid
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Link da call adicionado com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para remover link da call
CREATE OR REPLACE FUNCTION remover_link_call(
  agendamento_uuid UUID,
  mentor_uuid UUID
) RETURNS JSON AS $$
BEGIN
  -- Verificar se o agendamento existe e pertence ao mentor
  IF NOT EXISTS (
    SELECT 1 FROM agendamentos 
    WHERE id = agendamento_uuid AND mentor_id = mentor_uuid
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Agendamento não encontrado ou você não tem permissão'
    );
  END IF;
  
  -- Remover o link
  UPDATE agendamentos 
  SET 
    link_call = NULL,
    call_adicionada_em = NULL,
    call_adicionada_por = NULL,
    updated_at = NOW()
  WHERE id = agendamento_uuid;
  
  -- Registrar no histórico
  INSERT INTO agendamentos_historico (
    agendamento_id,
    acao,
    detalhes,
    usuario_id
  ) VALUES (
    agendamento_uuid,
    'link_call_removido',
    'Link da videochamada removido',
    mentor_uuid
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Link da call removido com sucesso'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
