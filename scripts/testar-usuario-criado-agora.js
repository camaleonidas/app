// Configuração do Supabase
const supabaseUrl = 'https://bmakppbboypkggrtxlkn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYWtwcGJib3lwa2dncnR4bGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjcwNjcsImV4cCI6MjA2NTg0MzA2N30.o9yvioEiGrLuGk239lG_lXIWGU6s_vzKPK0lPfV08vU'

async function supabaseRequest(endpoint, options = {}) {
  const url = `${supabaseUrl}/rest/v1/${endpoint}`
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...options.headers
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase request failed: ${response.status} - ${errorText}`)
  }

  return response.json()
}

async function testarCriacaoUsuario() {
  console.log('🧪 TESTE COMPLETO - CRIAÇÃO DE USUÁRIO')
  console.log('=====================================')

  try {
    // 1. Verificar estado atual
    console.log('\n📊 1. ESTADO ATUAL DO BANCO:')
    const usuariosAtuais = await supabaseRequest('usuarios?select=*')
    console.log(`   Total de usuários: ${usuariosAtuais.length}`)
    
    if (usuariosAtuais.length > 0) {
      console.log('   Usuários existentes:')
      usuariosAtuais.forEach(user => {
        console.log(`   - ${user.nome} (${user.email}) - ${user.tipo}`)
      })
    }

    // 2. Criar usuário teste
    console.log('\n🚀 2. CRIANDO USUÁRIO TESTE:')
    const novoUsuario = {
      id: `user_teste_${Date.now()}`,
      nome: 'Usuário Teste',
      email: `teste${Date.now()}@email.com`,
      senha: '123456',
      tipo: 'aluno',
      telefone: '11999999999',
      status: 'ativo',
      created_at: new Date().toISOString()
    }

    console.log('   Dados do usuário:', novoUsuario)

    const usuarioCriado = await supabaseRequest('usuarios', {
      method: 'POST',
      body: JSON.stringify(novoUsuario)
    })

    console.log('✅ Usuário criado com sucesso!')
    console.log('   Resposta do Supabase:', usuarioCriado)

    // 3. Verificar se foi salvo
    console.log('\n🔍 3. VERIFICANDO PERSISTÊNCIA:')
    const usuarioVerificacao = await supabaseRequest(`usuarios?id=eq.${novoUsuario.id}`)
    
    if (usuarioVerificacao.length > 0) {
      console.log('✅ Usuário encontrado no banco!')
      console.log('   Dados salvos:', usuarioVerificacao[0])
    } else {
      console.log('❌ Usuário NÃO encontrado no banco!')
    }

    // 4. Estado final
    console.log('\n📊 4. ESTADO FINAL:')
    const usuariosFinais = await supabaseRequest('usuarios?select=*')
    console.log(`   Total de usuários: ${usuariosFinais.length}`)
    console.log(`   Diferença: +${usuariosFinais.length - usuariosAtuais.length}`)

    // 5. Resultado
    console.log('\n🎯 RESULTADO:')
    if (usuarioVerificacao.length > 0) {
      console.log('✅ SUCESSO: Sistema de criação de usuários está funcionando!')
      console.log('✅ Supabase está conectado e salvando dados corretamente')
    } else {
      console.log('❌ FALHA: Usuário não foi salvo no Supabase')
      console.log('❌ Há problema na função de criação')
    }

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message)
    console.log('\n🔧 POSSÍVEIS CAUSAS:')
    console.log('   - Problema de conexão com Supabase')
    console.log('   - Tabela "usuarios" não existe')
    console.log('   - Permissões RLS bloqueando inserção')
    console.log('   - Estrutura da tabela incorreta')
  }
}

// Executar teste
testarCriacaoUsuario()
