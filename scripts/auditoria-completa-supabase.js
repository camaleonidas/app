const fs = require('fs')

console.log('🔍 AUDITORIA COMPLETA DO SUPABASE - MentoriaApp')
console.log('=' .repeat(60))

// Função para carregar variáveis do .env.local
function carregarVariaveisEnv() {
  if (!fs.existsSync('.env.local')) {
    return { supabaseUrl: null, supabaseKey: null }
  }
  
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
  
  return { supabaseUrl, supabaseKey }
}

// Função para verificar arquivos .env
function verificarArquivosEnv() {
  console.log('\n📁 PASSO 1: Verificando arquivos de ambiente...')
  
  const arquivosEnv = ['.env.local', '.env', '.env.development']
  let arquivoEncontrado = false
  let pontuacao = 0
  
  for (const arquivo of arquivosEnv) {
    if (fs.existsSync(arquivo)) {
      console.log(`✅ Encontrado: ${arquivo}`)
      arquivoEncontrado = true
      
      try {
        const conteudo = fs.readFileSync(arquivo, 'utf8')
        const linhas = conteudo.split('\n').filter(linha => linha.trim() && !linha.startsWith('#'))
        console.log(`   📋 Variáveis encontradas: ${linhas.length}`)
        
        // Verificar variáveis específicas do Supabase
        const temUrl = conteudo.includes('NEXT_PUBLIC_SUPABASE_URL=') && 
                       !conteudo.includes('SEU_PROJETO.supabase.co')
        const temKey = conteudo.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && 
                       !conteudo.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
        
        console.log(`   🔗 SUPABASE_URL: ${temUrl ? '✅' : '❌'}`)
        console.log(`   🔑 SUPABASE_ANON_KEY: ${temKey ? '✅' : '❌'}`)
        
        if (temUrl && temKey) pontuacao = 1
        
      } catch (error) {
        console.log(`   ❌ Erro ao ler arquivo: ${error.message}`)
      }
    }
  }
  
  if (!arquivoEncontrado) {
    console.log('❌ Nenhum arquivo .env encontrado!')
  }
  
  return pontuacao
}

// Função para testar conexão com Supabase
async function testarConexaoSupabase() {
  console.log('\n🔌 PASSO 2: Testando conexão com Supabase...')
  
  const { supabaseUrl, supabaseKey } = carregarVariaveisEnv()
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Variáveis de ambiente não configuradas!')
    return 0
  }
  
  if (supabaseUrl.includes('SEU_PROJETO') || supabaseKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')) {
    console.log('❌ Variáveis ainda são templates!')
    return 0
  }
  
  console.log('✅ Variáveis de ambiente encontradas')
  console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`)
  console.log(`   KEY: ${supabaseKey.substring(0, 20)}...`)
  
  try {
    // Teste de ping básico
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (response.ok) {
      console.log('✅ Ping no Supabase: SUCESSO')
      return { supabaseUrl, supabaseKey, pontuacao: 1 }
    } else {
      console.log(`❌ Ping no Supabase: FALHOU (Status: ${response.status})`)
      return 0
    }
    
  } catch (error) {
    console.log(`❌ Erro na conexão: ${error.message}`)
    return 0
  }
}

// Função para verificar estrutura das tabelas
async function verificarEstruturaBanco(credentials) {
  console.log('\n🗄️ PASSO 3: Verificando estrutura do banco...')
  
  const { supabaseUrl, supabaseKey } = credentials
  const tabelasEsperadas = ['usuarios', 'agendamentos', 'configuracoes_mentor']
  
  let tabelasOk = 0
  
  for (const tabela of tabelasEsperadas) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/${tabela}?select=*&limit=1`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      })
      
      if (response.ok) {
        console.log(`✅ Tabela '${tabela}': OK`)
        
        // Contar registros
        const countResponse = await fetch(`${supabaseUrl}/rest/v1/${tabela}?select=*&head=true`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'count=exact'
          }
        })
        
        const count = countResponse.headers.get('content-range')?.split('/')[1] || '0'
        console.log(`   📊 Registros: ${count}`)
        tabelasOk++
        
      } else if (response.status === 404) {
        console.log(`❌ Tabela '${tabela}': NÃO EXISTE`)
      } else {
        console.log(`❌ Tabela '${tabela}': Erro ${response.status}`)
      }
      
    } catch (error) {
      console.log(`❌ Erro ao verificar tabela '${tabela}': ${error.message}`)
    }
  }
  
  return tabelasOk === 3 ? 1 : 0
}

// Função para testar operações CRUD
async function testarOperacoesCRUD(credentials) {
  console.log('\n🔧 PASSO 4: Testando operações CRUD...')
  
  const { supabaseUrl, supabaseKey } = credentials
  
  try {
    // Teste de INSERT (usuário de teste)
    const novoUsuario = {
      nome: 'Teste Auditoria',
      email: `teste-${Date.now()}@auditoria.com`,
      tipo: 'aluno',
      senha: 'teste123'
    }
    
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/usuarios`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(novoUsuario)
    })
    
    if (!insertResponse.ok) {
      console.log(`❌ Teste INSERT: Falhou (${insertResponse.status})`)
      return 0
    }
    
    const usuarioInserido = await insertResponse.json()
    const userId = usuarioInserido[0].id
    console.log('✅ Teste INSERT: OK')
    
    // Teste de SELECT
    const selectResponse = await fetch(`${supabaseUrl}/rest/v1/usuarios?id=eq.${userId}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (!selectResponse.ok) {
      console.log(`❌ Teste SELECT: Falhou (${selectResponse.status})`)
      return 0
    }
    
    console.log('✅ Teste SELECT: OK')
    
    // Teste de UPDATE
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/usuarios?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome: 'Teste Auditoria Atualizado' })
    })
    
    if (!updateResponse.ok) {
      console.log(`❌ Teste UPDATE: Falhou (${updateResponse.status})`)
      return 0
    }
    
    console.log('✅ Teste UPDATE: OK')
    
    // Teste de DELETE (limpar dados de teste)
    const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/usuarios?id=eq.${userId}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (!deleteResponse.ok) {
      console.log(`❌ Teste DELETE: Falhou (${deleteResponse.status})`)
      return 0
    }
    
    console.log('✅ Teste DELETE: OK')
    return 1
    
  } catch (error) {
    console.log(`❌ Erro nos testes CRUD: ${error.message}`)
    return 0
  }
}

// Função para verificar relacionamentos entre tabelas
async function verificarRelacionamentos(credentials) {
  console.log('\n🔗 PASSO 5: Verificando relacionamentos...')
  
  const { supabaseUrl, supabaseKey } = credentials
  
  try {
    // Verificar se agendamentos podem ser relacionados com usuários
    const response = await fetch(`${supabaseUrl}/rest/v1/agendamentos?select=*,aluno:aluno_id(nome,email),mentor:mentor_id(nome,email)&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (response.ok) {
      console.log('✅ Relacionamentos: OK')
      return 1
    } else {
      console.log(`❌ Relacionamentos: Erro ${response.status}`)
      return 0
    }
    
  } catch (error) {
    console.log(`❌ Erro ao verificar relacionamentos: ${error.message}`)
    return 0
  }
}

// Função principal
async function executarAuditoria() {
  console.log('🚀 Iniciando auditoria completa...\n')
  
  let pontuacao = 0
  const totalTestes = 5
  
  // Teste 1: Arquivos .env
  pontuacao += verificarArquivosEnv()
  
  // Teste 2: Conexão Supabase
  const conexao = await testarConexaoSupabase()
  if (conexao && conexao.pontuacao) {
    pontuacao += conexao.pontuacao
    
    // Teste 3: Estrutura do banco
    pontuacao += await verificarEstruturaBanco(conexao)
    
    // Teste 4: Operações CRUD
    pontuacao += await testarOperacoesCRUD(conexao)
    
    // Teste 5: Relacionamentos
    pontuacao += await verificarRelacionamentos(conexao)
  }
  
  // Resultado final
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESULTADO FINAL DA AUDITORIA')
  console.log('='.repeat(60))
  
  const porcentagem = Math.round((pontuacao / totalTestes) * 100)
  console.log(`🎯 Pontuação: ${pontuacao}/${totalTestes} (${porcentagem}%)`)
  
  if (pontuacao === totalTestes) {
    console.log('🎉 PARABÉNS! Seu Supabase está 100% PRONTO para produção!')
    console.log('✅ Todas as verificações passaram')
    console.log('✅ Sistema fluido e perfeito como solicitado')
    console.log('🚀 Pode começar a usar em produção!')
  } else if (pontuacao >= 3) {
    console.log('⚠️  Seu Supabase está QUASE pronto, mas precisa de alguns ajustes')
    console.log('🔧 Execute o script de correção para resolver os problemas')
  } else {
    console.log('❌ Seu Supabase NÃO está pronto para produção')
    console.log('🚨 Vários problemas críticos encontrados')
    console.log('🔧 Execute os scripts de correção urgentemente')
  }
  
  console.log('\n📋 PRÓXIMOS PASSOS:')
  if (pontuacao < totalTestes) {
    console.log('1. Execute: node scripts/corrigir-problemas-supabase.js')
    console.log('2. Se necessário, execute o SQL: scripts/criar-tabelas-completas.sql')
    console.log('3. Execute esta auditoria novamente')
  } else {
    console.log('1. Seu sistema está pronto!')
    console.log('2. Pode começar a usar em produção')
    console.log('3. Execute testes regulares para manter a qualidade')
  }
  
  console.log('\n🎯 RESPOSTA HONESTA: ' + (pontuacao === totalTestes ? 
    'SIM, está perfeito e pronto!' : 
    `NÃO, precisa de ${totalTestes - pontuacao} correções antes de usar`))
}

// Executar auditoria
executarAuditoria().catch(error => {
  console.error('❌ Erro crítico na auditoria:', error.message)
})
