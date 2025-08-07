-- 🗄️ VERSÃO SIMPLES - CRIANDO O BANCO PASSO A PASSO

-- Limpar tudo primeiro
DROP TABLE IF EXISTS agendamentos CASCADE;
DROP TABLE IF EXISTS configuracoes_mentor CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 👥 Criar tabela de usuários
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo VARCHAR(10) CHECK (tipo IN ('mentor', 'aluno')) NOT NULL,
  telefone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ⚙️ Criar tabela de configurações do mentor
CREATE TABLE configuracoes_mentor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  dia_semana INTEGER CHECK (dia_semana >= 1 AND dia_semana <= 7),
  ativo BOOLEAN DEFAULT true,
  horarios TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mentor_id, dia_semana)
);

-- 📅 Criar tabela de agendamentos
CREATE TABLE agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  aluno_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  data_agendamento DATE NOT NULL,
  horario TIME NOT NULL,
  assunto TEXT NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pendente', 'confirmado', 'recusado', 'concluido')) DEFAULT 'pendente',
  motivo_recusa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 👤 Inserir usuários de teste
INSERT INTO usuarios (nome, email, senha, tipo, telefone) VALUES 
('João Mentor Silva', 'mentor@email.com', '123456', 'mentor', '(11) 99999-1234'),
('Maria Aluna Santos', 'aluno@email.com', '123456', 'aluno', '(11) 99999-5678');

-- ✅ Verificar se foi criado
SELECT 'Usuários criados:' as info, COUNT(*) as quantidade FROM usuarios;
SELECT nome, email, tipo FROM usuarios;
