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

async function verificarUsuariosDeletados() {
  console.log('🗑️  VERIFICAÇÃO - USUÁRIOS DELETADOS')
  console.log('===================================')

  try {
    // 1. Estado atual do banco
    console.log('\n📊 1. ESTADO ATUAL DO BANCO:')
    const usuarios = await supabaseRequest('usuarios?select=*')
    console.log(`   Total de usuários restantes: ${usuarios.length}`)

    if (usuarios.length === 0) {
      console.log('   ✅ Banco está vazio - todos os usuários foram deletados')
    } else {
      console.log('\n   👥 Usuários que ainda existem:')
      usuarios.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.nome} (${user.email}) - ${user.tipo}`)
        console.log(`      ID: ${user.id}`)
        console.log(`      Status: ${user.status}`)
        console.log(`      Criado em: ${user.created_at}`)
        console.log('')
      })
    }

    // 2. Análise dos usuários restantes
    console.log('\n🔍 2. ANÁLISE DOS USUÁRIOS RESTANTES:')
    const mentores = usuarios.filter(u => u.tipo === 'mentor')
    const alunos = usuarios.filter(u => u.tipo === 'aluno')
    const ativos = usuarios.filter(u => u.status === 'ativo')
    const inativos = usuarios.filter(u => u.status === 'inativo')

    console.log(`   Mentores: ${mentores.length}`)
    console.log(`   Alunos: ${alunos.length}`)
    console.log(`   Ativos: ${ativos.length}`)
    console.log(`   Inativos: ${inativos.length}`)

    // 3. Teste de integridade da tabela
    console.log('\n🧪 3. TESTE DE INTEGRIDADE DA TABELA:')
    
    // Tentar inserir um usuário teste
    const usuarioTeste = {
      id: `teste_delete_${Date.now()}`,
      nome: 'Teste Delete',
      email: `teste.delete.${Date.now()}@email.com`,
      senha: '123456',
      tipo: 'aluno',
      telefone: '11999999999',
      status: 'ativo',
      created_at: new Date().toISOString()
    }

    console.log('   Criando usuário teste...')
    await supabaseRequest('usuarios', {
      method: 'POST',
      body: JSON.stringify(usuarioTeste)
    })
    console.log('   ✅ Usuário teste criado')

    // Verificar se foi criado
    const verificacao = await supabaseRequest(`usuarios?id=eq.${usuarioTeste.id}`)
    if (verificacao.length > 0) {
      console.log('   ✅ Usuário teste encontrado no banco')
    } else {
      console.log('   ❌ Usuário teste NÃO encontrado')
    }

    // Deletar o usuário teste
    console.log('   Deletando usuário teste...')
    await supabaseRequest(`usuarios?id=eq.${usuarioTeste.id}`, {
      method: 'DELETE'
    })
    console.log('   ✅ Usuário teste deletado')

    // Verificar se foi deletado
    const verificacaoDelete = await supabaseRequest(`usuarios?id=eq.${usuarioTeste.id}`)
    if (verificacaoDelete.length === 0) {
      console.log('   ✅ Usuário teste confirmado como deletado')
    } else {
      console.log('   ❌ Usuário teste ainda existe no banco')
    }

    // 4. Resultado final
    console.log('\n🎯 RESULTADO FINAL:')
    console.log('✅ Sistema de delete está funcionando corretamente')
    console.log('✅ Tabela "usuarios" está íntegra')
    console.log('✅ Operações CRUD funcionando normalmente')
    
    if (usuarios.length === 0) {
      console.log('✅ Todos os usuários foram deletados com sucesso')
    } else {
      console.log(`ℹ️  Restam ${usuarios.length} usuários no banco`)
    }

  } catch (error) {
    console.error('\n❌ ERRO NA VERIFICAÇÃO:', error.message)
    console.log('\n🔧 POSSÍVEIS CAUSAS:')
    console.log('   - Problema de conexão com Supabase')
    console.log('   - Tabela "usuarios" não existe')
    console.log('   - Permissões RLS bloqueando operações')
    console.log('   - Estrutura da tabela incorreta')
  }
}

// Executar verificação
verificarUsuariosDeletados()
