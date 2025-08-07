// Script para verificar se o usuário foi criado corretamente no Supabase

// Suas variáveis do Supabase
const supabaseUrl = 'https://bmakppbboypkggrtxlkn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYWtwcGJib3lwa2dncnR4bGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjcwNjcsImV4cCI6MjA2NTg0MzA2N30.o9yvioEiGrLuGk239lG_lXIWGU6s_vzKPK0lPfV08vU'

console.log('🔍 VERIFICANDO USUÁRIO CRIADO')
console.log('=====================================')

// Função para fazer requisições ao Supabase
async function supabaseRequest(endpoint, options = {}) {
  const url = `${supabaseUrl}/rest/v1/${endpoint}`
  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
    ...options.headers
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { data: null, error: data }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error: { message: error.message } }
  }
}

async function verificarUsuarioCriado() {
  console.log('\n📋 DADOS DO USUÁRIO CRIADO NA APLICAÇÃO:')
  console.log('ID: user_1754593410789_3keoqxdt5')
  console.log('Nome: Thuany')
  console.log('Email: tu@email.com')
  console.log('Tipo: aluno')
  console.log('Telefone: 489536215')
  console.log('Data: 2025-08-07T19:03:30.789Z')

  // 1. Verificar se o usuário existe no banco
  console.log('\n1️⃣ VERIFICANDO NO BANCO DE DADOS:')
  
  try {
    // Buscar por ID específico
    const { data: usuarioPorId, error: errorId } = await supabaseRequest('usuarios?id=eq.user_1754593410789_3keoqxdt5')
    
    if (errorId) {
      console.log('❌ Erro ao buscar por ID:', errorId.message)
    } else if (usuarioPorId && usuarioPorId.length > 0) {
      console.log('✅ ENCONTRADO POR ID!')
      const usuario = usuarioPorId[0]
      console.log('   📋 Dados no banco:')
      console.log('   - ID:', usuario.id)
      console.log('   - Nome:', usuario.nome)
      console.log('   - Email:', usuario.email)
      console.log('   - Tipo:', usuario.tipo)
      console.log('   - Telefone:', usuario.telefone)
      console.log('   - Criado em:', usuario.created_at)
      console.log('   - Status:', usuario.status || 'N/A')
    } else {
      console.log('❌ NÃO ENCONTRADO POR ID')
    }

    // Buscar por email como alternativa
    const { data: usuarioPorEmail, error: errorEmail } = await supabaseRequest('usuarios?email=eq.tu@email.com')
    
    if (errorEmail) {
      console.log('❌ Erro ao buscar por email:', errorEmail.message)
    } else if (usuarioPorEmail && usuarioPorEmail.length > 0) {
      console.log('✅ ENCONTRADO POR EMAIL!')
      const usuario = usuarioPorEmail[0]
      console.log('   📋 Dados no banco:')
      console.log('   - ID:', usuario.id)
      console.log('   - Nome:', usuario.nome)
      console.log('   - Email:', usuario.email)
      console.log('   - Tipo:', usuario.tipo)
      console.log('   - Telefone:', usuario.telefone)
      console.log('   - Criado em:', usuario.created_at)
    } else {
      console.log('❌ NÃO ENCONTRADO POR EMAIL')
    }

    // Buscar por nome
    const { data: usuarioPorNome, error: errorNome } = await supabaseRequest('usuarios?nome=eq.Thuany')
    
    if (errorNome) {
      console.log('❌ Erro ao buscar por nome:', errorNome.message)
    } else if (usuarioPorNome && usuarioPorNome.length > 0) {
      console.log('✅ ENCONTRADO POR NOME!')
      const usuario = usuarioPorNome[0]
      console.log('   📋 Dados no banco:')
      console.log('   - ID:', usuario.id)
      console.log('   - Nome:', usuario.nome)
      console.log('   - Email:', usuario.email)
      console.log('   - Tipo:', usuario.tipo)
      console.log('   - Telefone:', usuario.telefone)
      console.log('   - Criado em:', usuario.created_at)
    } else {
      console.log('❌ NÃO ENCONTRADO POR NOME')
    }

  } catch (error) {
    console.log('❌ Erro crítico na busca:', error.message)
  }

  // 2. Listar todos os usuários para verificar
  console.log('\n2️⃣ LISTANDO TODOS OS USUÁRIOS NO BANCO:')
  
  try {
    const { data: todosUsuarios, error: errorTodos } = await supabaseRequest('usuarios?select=*&order=created_at.desc')
    
    if (errorTodos) {
      console.log('❌ Erro ao listar usuários:', errorTodos.message)
    } else if (todosUsuarios && todosUsuarios.length > 0) {
      console.log(`✅ Total de usuários no banco: ${todosUsuarios.length}`)
      console.log('\n📋 LISTA COMPLETA:')
      
      todosUsuarios.forEach((usuario, index) => {
        console.log(`\n${index + 1}. ${usuario.nome}`)
        console.log(`   ID: ${usuario.id}`)
        console.log(`   Email: ${usuario.email}`)
        console.log(`   Tipo: ${usuario.tipo}`)
        console.log(`   Telefone: ${usuario.telefone || 'N/A'}`)
        console.log(`   Criado: ${usuario.created_at}`)
        
        // Verificar se é o usuário que acabamos de criar
        if (usuario.email === 'tu@email.com' || usuario.nome === 'Thuany') {
          console.log('   🎯 ESTE É O USUÁRIO QUE ACABAMOS DE CRIAR!')
        }
      })
    } else {
      console.log('❌ Nenhum usuário encontrado no banco')
    }

  } catch (error) {
    console.log('❌ Erro ao listar usuários:', error.message)
  }

  // 3. Verificar estrutura da tabela
  console.log('\n3️⃣ VERIFICANDO ESTRUTURA DA TABELA:')
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/usuarios?limit=0`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (response.ok) {
      console.log('✅ Tabela usuarios existe e está acessível')
    } else {
      console.log('❌ Problema com a tabela usuarios:', response.status)
    }
  } catch (error) {
    console.log('❌ Erro ao verificar tabela:', error.message)
  }

  // 4. Resultado final
  console.log('\n🎯 RESULTADO DA VERIFICAÇÃO:')
  console.log('=====================================')
  
  // Fazer uma última verificação específica
  try {
    const { data: verificacaoFinal, error } = await supabaseRequest('usuarios?email=eq.tu@email.com')
    
    if (error) {
      console.log('❌ FALHA: Erro na verificação final')
      console.log('   Erro:', error.message)
      console.log('\n🔧 POSSÍVEIS CAUSAS:')
      console.log('   1. Usuário não foi salvo no banco')
      console.log('   2. Problema na conexão com Supabase')
      console.log('   3. Erro na aplicação ao salvar')
    } else if (verificacaoFinal && verificacaoFinal.length > 0) {
      console.log('🎉 SUCESSO! Usuário foi salvo corretamente no Supabase!')
      console.log('✅ Aplicação está conectada e funcionando')
      console.log('✅ Dados foram persistidos no banco')
      console.log('✅ Sistema de criação de usuários está operacional')
      
      const usuario = verificacaoFinal[0]
      console.log('\n📊 COMPARAÇÃO:')
      console.log('Aplicação disse que criou:', 'Thuany (tu@email.com)')
      console.log('Banco confirma que tem:', `${usuario.nome} (${usuario.email})`)
      console.log('Status:', usuario.id === 'user_1754593410789_3keoqxdt5' ? 'IDs COINCIDEM' : 'IDs DIFERENTES')
    } else {
      console.log('❌ PROBLEMA: Usuário NÃO foi salvo no banco')
      console.log('\n🔧 DIAGNÓSTICO:')
      console.log('   - A aplicação disse que criou o usuário')
      console.log('   - Mas o usuário não está no Supabase')
      console.log('   - Pode haver problema na função de salvar')
    }
    
  } catch (error) {
    console.log('❌ Erro na verificação final:', error.message)
  }
}

verificarUsuarioCriado().catch(console.error)
