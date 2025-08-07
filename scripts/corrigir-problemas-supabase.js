const fs = require('fs')
const path = require('path')

console.log('🔧 CORREÇÃO AUTOMÁTICA DE PROBLEMAS - Supabase')
console.log('=' .repeat(50))

// Função para verificar e criar arquivo .env.local
function verificarArquivoEnv() {
  console.log('📁 Verificando arquivo .env.local...')
  
  if (!fs.existsSync('.env.local')) {
    console.log('❌ Arquivo .env.local não encontrado!')
    console.log('📝 Criando arquivo .env.local...')
    
    const templateEnv = `# Configurações do Supabase - MentoriaApp
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# INSTRUÇÕES:
# 1. Acesse: https://supabase.com/dashboard
# 2. Selecione seu projeto
# 3. Vá em Settings → API
# 4. Copie a "Project URL" e cole acima
# 5. Copie a "anon public" key e cole acima
# 6. Salve este arquivo
`
    
    try {
      fs.writeFileSync('.env.local', templateEnv)
      console.log('✅ Arquivo .env.local criado com sucesso!')
      console.log('⚠️  AÇÃO NECESSÁRIA: Configure suas credenciais do Supabase')
      console.log('📋 Edite o arquivo .env.local com suas credenciais reais')
      return false
    } catch (error) {
      console.log(`❌ Erro ao criar arquivo: ${error.message}`)
      return false
    }
  } else {
    console.log('✅ Arquivo .env.local encontrado!')
    
    // Ler e verificar conteúdo
    try {
      const conteudo = fs.readFileSync('.env.local', 'utf8')
      
      const temUrl = conteudo.includes('NEXT_PUBLIC_SUPABASE_URL=') && 
                     !conteudo.includes('SEU_PROJETO.supabase.co')
      const temKey = conteudo.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && 
                     !conteudo.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
      
      console.log(`   🔗 SUPABASE_URL configurada: ${temUrl ? '✅' : '❌'}`)
      console.log(`   🔑 SUPABASE_ANON_KEY configurada: ${temKey ? '✅' : '❌'}`)
      
      if (!temUrl || !temKey) {
        console.log('⚠️  Variáveis não configuradas corretamente!')
        console.log('📋 Edite o arquivo .env.local com suas credenciais reais')
        return false
      }
      
      return true
    } catch (error) {
      console.log(`❌ Erro ao ler arquivo: ${error.message}`)
      return false
    }
  }
}

// Função para testar conexão básica
async function testarConexaoBasica() {
  console.log('\n🔌 Testando conexão básica com Supabase...')
  
  // Carregar variáveis do .env.local manualmente
  if (fs.existsSync('.env.local')) {
    const envContent = fs.readFileSync('.env.local', 'utf8')
    const lines = envContent.split('\n')
    
    let supabaseUrl = null
    let supabaseKey = null
    
    for (const line of lines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1]?.trim()
      }
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        supabaseKey = line.split('=')[1]?.trim()
      }
    }
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Credenciais não encontradas no .env.local')
      return false
    }
    
    if (supabaseUrl.includes('SEU_PROJETO') || supabaseKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')) {
      console.log('❌ Credenciais ainda são templates - configure com valores reais')
      return false
    }
    
    console.log('✅ Credenciais encontradas')
    console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`)
    console.log(`   KEY: ${supabaseKey.substring(0, 20)}...`)
    
    // Teste de ping usando fetch nativo
    try {
      console.log('🏓 Fazendo ping no Supabase...')
      
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        console.log('✅ Ping no Supabase: SUCESSO!')
        console.log(`   Status: ${response.status}`)
        return { supabaseUrl, supabaseKey }
      } else {
        console.log(`❌ Ping no Supabase: FALHOU!`)
        console.log(`   Status: ${response.status}`)
        console.log(`   Verifique se as credenciais estão corretas`)
        return false
      }
      
    } catch (error) {
      console.log(`❌ Erro no ping: ${error.message}`)
      return false
    }
  } else {
    console.log('❌ Arquivo .env.local não encontrado')
    return false
  }
}

// Função para verificar tabelas
async function verificarTabelas(credentials) {
  console.log('\n🗄️ Verificando tabelas do banco...')
  
  const { supabaseUrl, supabaseKey } = credentials
  
  const tabelas = ['usuarios', 'agendamentos', 'configuracoes_mentor']
  let tabelasOk = 0
  
  for (const tabela of tabelas) {
    try {
      console.log(`   Verificando tabela: ${tabela}`)
      
      const response = await fetch(`${supabaseUrl}/rest/v1/${tabela}?select=*&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        console.log(`   ✅ Tabela '${tabela}': OK`)
        tabelasOk++
      } else if (response.status === 404) {
        console.log(`   ❌ Tabela '${tabela}': NÃO EXISTE`)
      } else {
        console.log(`   ⚠️  Tabela '${tabela}': Erro ${response.status}`)
      }
      
    } catch (error) {
      console.log(`   ❌ Erro ao verificar '${tabela}': ${error.message}`)
    }
  }
  
  console.log(`\n📊 Resultado: ${tabelasOk}/3 tabelas funcionando`)
  return tabelasOk === 3
}

// Função para criar script SQL
function criarScriptSQL() {
  console.log('\n📝 Criando script SQL para criar tabelas...')
  
  const sqlScript = `-- Script para criar tabelas do MentoriaApp
-- Execute este SQL no Supabase Dashboard → SQL Editor

-- 1. Tabela de usuários (mentores e alunos)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('mentor', 'aluno')) NOT NULL,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de configurações dos mentores
CREATE TABLE IF NOT EXISTS configuracoes_mentor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  horarios_disponiveis JSONB DEFAULT '{}',
  preco_por_hora DECIMAL(10,2) DEFAULT 0,
  especialidades TEXT[] DEFAULT '{}',
  bio TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  data_agendamento DATE NOT NULL,
  horario TIME NOT NULL,
  assunto TEXT NOT NULL,
  status TEXT CHECK (status IN ('pendente', 'confirmado', 'recusado', 'cancelado', 'concluido')) DEFAULT 'pendente',
  motivo_recusa TEXT,
  observacoes TEXT,
  link_call TEXT,
  gravacao_url TEXT,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_agendamentos_mentor ON agendamentos(mentor_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_aluno ON agendamentos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- 5. Inserir dados de exemplo (opcional)
INSERT INTO usuarios (nome, email, senha, tipo, telefone) VALUES
('João Mentor', 'joao@mentor.com', 'senha123', 'mentor', '(11) 99999-1111'),
('Maria Aluna', 'maria@aluna.com', 'senha123', 'aluno', '(11) 99999-2222')
ON CONFLICT (email) DO NOTHING;

-- Mensagem de sucesso
SELECT 'Tabelas criadas com sucesso! 🎉' as resultado;
`
  
  try {
    fs.writeFileSync('scripts/criar-tabelas-completas.sql', sqlScript)
    console.log('✅ Script SQL criado: scripts/criar-tabelas-completas.sql')
    console.log('📋 Execute este SQL no Supabase Dashboard!')
    return true
  } catch (error) {
    console.log(`❌ Erro ao criar script: ${error.message}`)
    return false
  }
}

// Função principal
async function executarCorrecoes() {
  console.log('🚀 Iniciando correções automáticas...\n')
  
  let problemas = 0
  let correcoes = 0
  
  // Passo 1: Verificar arquivo .env
  if (!verificarArquivoEnv()) {
    problemas++
    console.log('❌ Problema: Arquivo .env.local não configurado')
  } else {
    correcoes++
  }
  
  // Passo 2: Testar conexão
  const credentials = await testarConexaoBasica()
  if (!credentials) {
    problemas++
    console.log('❌ Problema: Conexão com Supabase falhou')
  } else {
    correcoes++
    
    // Passo 3: Verificar tabelas
    const tabelasOk = await verificarTabelas(credentials)
    if (!tabelasOk) {
      problemas++
      console.log('❌ Problema: Tabelas do banco não existem ou estão com erro')
      
      // Criar script SQL para resolver
      if (criarScriptSQL()) {
        console.log('✅ Script de correção criado!')
      }
    } else {
      correcoes++
    }
  }
  
  // Resultado final
  console.log('\n' + '='.repeat(50))
  console.log('📊 RESULTADO DAS CORREÇÕES')
  console.log('='.repeat(50))
  console.log(`✅ Correções aplicadas: ${correcoes}`)
  console.log(`❌ Problemas encontrados: ${problemas}`)
  
  if (problemas === 0) {
    console.log('\n🎉 PARABÉNS! Tudo está funcionando perfeitamente!')
    console.log('✅ Seu Supabase está pronto para uso')
    console.log('🚀 Execute: node scripts/auditoria-completa-supabase.js para confirmar')
  } else {
    console.log('\n⚠️  Ainda existem problemas para resolver:')
    
    if (problemas >= 2) {
      console.log('1. Configure o arquivo .env.local com suas credenciais')
      console.log('2. Execute o SQL: scripts/criar-tabelas-completas.sql no Supabase')
    } else if (problemas === 1) {
      console.log('1. Execute o SQL: scripts/criar-tabelas-completas.sql no Supabase')
    }
    
    console.log('3. Execute este script novamente para verificar')
  }
  
  console.log('\n📋 PRÓXIMOS PASSOS:')
  console.log('1. Resolva os problemas listados acima')
  console.log('2. Execute: node scripts/corrigir-problemas-supabase.js (este script)')
  console.log('3. Execute: node scripts/auditoria-completa-supabase.js (auditoria completa)')
}

// Executar correções
executarCorrecoes().catch(error => {
  console.error('❌ Erro crítico:', error.message)
  console.log('\n🔧 Tente executar manualmente cada passo:')
  console.log('1. Verifique se o arquivo .env.local existe')
  console.log('2. Configure as credenciais do Supabase')
  console.log('3. Teste a conexão manualmente')
})
