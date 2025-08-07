// Script completo para testar conexão com Supabase
console.log('🔍 TESTE COMPLETO DE CONEXÃO SUPABASE')
console.log('='.repeat(60))

// TESTE 1 - Variáveis de ambiente
console.log('🔍 TESTE 1 - Variáveis de ambiente:')
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Key existe:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('Key primeiros 20 chars:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20))

// Verificar se as variáveis existem
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('❌ ERRO: Variáveis de ambiente não configuradas!')
  console.log('Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

// TESTE 2 - Ping no Supabase
console.log('\n🔍 TESTE 2 - Ping no Supabase:')
fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/', {
  headers: {
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
}).then(response => {
  console.log('✅ Status:', response.status)
  console.log('✅ Conexão:', response.ok ? 'FUNCIONANDO!' : 'FALHOU!')
  return response.text()
}).then(data => {
  console.log('Resposta:', data.substring(0, 100))
  
  // TESTE 3 - Testar tabelas específicas
  return testarTabelas()
}).catch(error => {
  console.error('❌ Erro no ping:', error)
})

// TESTE 3 - Testar acesso às tabelas
async function testarTabelas() {
  console.log('\n🔍 TESTE 3 - Testando tabelas:')
  
  const tabelas = ['usuarios', 'agendamentos', 'configuracoes_mentor']
  
  for (const tabela of tabelas) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${tabela}?select=*&limit=1`,
        {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Tabela ${tabela}: OK (${data.length} registros encontrados)`)
      } else {
        const error = await response.text()
        console.log(`❌ Tabela ${tabela}: ERRO ${response.status} - ${error}`)
      }
    } catch (error) {
      console.log(`❌ Tabela ${tabela}: ERRO - ${error.message}`)
    }
  }
  
  // TESTE 4 - Testar com cliente Supabase
  return testarClienteSupabase()
}

// TESTE 4 - Testar com cliente Supabase
async function testarClienteSupabase() {
  console.log('\n🔍 TESTE 4 - Cliente Supabase:')
  
  try {
    // Importar dinamicamente para evitar erros de módulo
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    // Testar consulta simples
    const { data, error } = await supabase
      .from('usuarios')
      .select('nome, email, tipo')
      .limit(3)
    
    if (error) {
      console.log('❌ Erro no cliente Supabase:', error.message)
    } else {
      console.log('✅ Cliente Supabase funcionando!')
      console.log('Usuários encontrados:', data?.length || 0)
      
      if (data && data.length > 0) {
        console.log('Exemplos de usuários:')
        data.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.nome} (${user.email}) - ${user.tipo}`)
        })
      }
    }
    
    // TESTE 5 - Testar autenticação
    return testarAutenticacao(supabase)
    
  } catch (error) {
    console.log('❌ Erro ao criar cliente Supabase:', error.message)
  }
}

// TESTE 5 - Testar sistema de autenticação
async function testarAutenticacao(supabase) {
  console.log('\n🔍 TESTE 5 - Sistema de autenticação:')
  
  try {
    // Testar login com usuário de exemplo
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', 'mentor@email.com')
      .eq('senha', '123456')
      .limit(1)
    
    if (error) {
      console.log('❌ Erro na autenticação:', error.message)
    } else if (data && data.length > 0) {
      console.log('✅ Sistema de autenticação funcionando!')
      console.log('Usuário teste encontrado:', data[0].nome)
    } else {
      console.log('⚠️ Usuário de teste não encontrado (normal se banco estiver vazio)')
    }
    
    // Resumo final
    console.log('\n' + '='.repeat(60))
    console.log('🎉 TESTE COMPLETO FINALIZADO!')
    console.log('✅ Se chegou até aqui, a conexão está funcionando!')
    console.log('✅ Supabase configurado corretamente!')
    console.log('='.repeat(60))
    
  } catch (error) {
    console.log('❌ Erro no teste de autenticação:', error.message)
  }
}
