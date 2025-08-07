-- Inserir usuários de exemplo (se não existirem)
INSERT INTO usuarios (nome, email, senha, tipo, telefone) 
VALUES 
  ('Dr. João Silva', 'mentor@email.com', '123456', 'mentor', '(11) 99999-9999'),
  ('Maria Santos', 'aluno@email.com', '123456', 'aluno', '(11) 88888-8888'),
  ('Pedro Costa', 'pedro@email.com', '123456', 'aluno', '(11) 77777-7777')
ON CONFLICT (email) DO NOTHING;

-- Inserir agendamento de exemplo
INSERT INTO agendamentos (
  mentor_id, 
  aluno_id, 
  data_agendamento, 
  horario, 
  assunto, 
  status
) 
SELECT 
  (SELECT id FROM usuarios WHERE email = 'mentor@email.com'),
  (SELECT id FROM usuarios WHERE email = 'aluno@email.com'),
  CURRENT_DATE + INTERVAL '1 day',
  '14:00:00',
  'Consultoria em carreira',
  'pendente'
WHERE NOT EXISTS (
  SELECT 1 FROM agendamentos 
  WHERE mentor_id = (SELECT id FROM usuarios WHERE email = 'mentor@email.com')
);
