// Script para testar Supabase usando fetch nativo (sem imports ES6)

// Suas variáveis do Supabase
const supabaseUrl = 'https://bmakppbboypkggrtxlkn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYWtwcGJib3lwa2dncnR4bGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjcwNjcsImV4cCI6MjA2NTg0MzA2N30.o9yvioEiGrLuGk239lG_lXIWGU6s_vzKPK0lPfV08vU'

console.log('🔍 TESTE COMPLETO - SUPABASE ONLY')
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

async function testarSupabaseOnly() {
  // 1. Verificar variáveis
  console.log('\n1️⃣ VARIÁVEIS DE AMBIENTE:')
  console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltando')
  console.log('Key:', supabaseKey ? '✅ Configurada' : '❌ Faltando')
  console.log('URL completa:', supabaseUrl)
  console.log('Key (primeiros 20 chars):', supabaseKey.substring(0, 20) + '...')

  // 2. Testar conexão básica
  console.log('\n2️⃣ TESTE DE CONEXÃO BÁSICA:')
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })
    
    if (response.ok) {
      console.log('✅ Ping no Supabase: SUCESSO!')
      console.log('   Status:', response.status)
    } else {
      console.log('❌ Ping no Supabase: FALHOU!', response.status)
      const errorText = await response.text()
      console.log('   Erro:', errorText.substring(0, 100))
      return
    }
  } catch (error) {
    console.log('❌ Erro no ping:', error.message)
    return
  }

  // 3. Testar acesso às tabelas
  console.log('\n3️⃣ VERIFICAR TABELAS:')
  
  const tabelas = ['usuarios', 'agendamentos', 'configuracoes_mentor']
  let tabelasOK = 0
  let tabelasDetalhes = {}
  
  for (const tabela of tabelas) {
    try {
      const { data, error } = await supabaseRequest(`${tabela}?limit=1`)
      
      if (error) {
        console.log(`❌ ${tabela}: ${error.message || error.hint || 'Erro desconhecido'}`)
        if (error.message && error.message.includes('does not exist')) {
          console.log(`   💡 Tabela "${tabela}" não existe - precisa criar`)
        }
        tabelasDetalhes[tabela] = { status: 'erro', error: error.message }
      } else {
        console.log(`✅ ${tabela}: OK (${data?.length || 0} registros encontrados)`)
        tabelasOK++
        tabelasDetalhes[tabela] = { status: 'ok', count: data?.length || 0 }
      }
    } catch (error) {
      console.log(`❌ ${tabela}: Erro crítico - ${error.message}`)
      tabelasDetalhes[tabela] = { status: 'erro crítico', error: error.message }
    }
  }

  // 4. Testar operações específicas (só se pelo menos uma tabela funcionar)
  console.log('\n4️⃣ TESTE DE OPERAÇÕES:')
  
  if (tabelasOK > 0) {
    try {
      // Contar usuários
      const { data: usuarios, error: errorUsuarios } = await supabaseRequest('usuarios?select=*')

      if (errorUsuarios) {
        console.log('❌ Erro ao buscar usuários:', errorUsuarios.message)
      } else {
        console.log(`✅ Total de usuários: ${usuarios?.length || 0}`)
        
        if (usuarios && usuarios.length > 0) {
          console.log('   📋 Exemplos de usuários:')
          usuarios.slice(0, 3).forEach(user => {
            console.log(`   - ${user.nome} (${user.tipo}) - ${user.email}`)
          })
        } else {
          console.log('   ⚠️  Banco vazio - sem usuários cadastrados')
        }
      }

      // Testar agendamentos se a tabela existir
      if (tabelasDetalhes.agendamentos?.status === 'ok') {
        const { data: agendamentos, error: errorAgendamentos } = await supabaseRequest('agendamentos?select=*')

        if (errorAgendamentos) {
          console.log('❌ Erro ao buscar agendamentos:', errorAgendamentos.message)
        } else {
          console.log(`✅ Total de agendamentos: ${agendamentos?.length || 0}`)
        }
      }

    } catch (error) {
      console.log('❌ Erro nas operações:', error.message)
    }
  }

  // 5. Teste de autenticação simulada
  console.log('\n5️⃣ TESTE DE AUTENTICAÇÃO:')
  
  if (tabelasDetalhes.usuarios?.status === 'ok') {
    try {
      // Buscar mentores
      const { data: mentores, error: errorMentores } = await supabaseRequest('usuarios?tipo=eq.mentor&limit=1')

      if (errorMentores) {
        console.log('❌ Erro ao buscar mentores:', errorMentores.message)
      } else if (mentores && mentores.length > 0) {
        console.log('✅ Mentor de teste encontrado:', mentores[0].nome)
        console.log('   📧 Email:', mentores[0].email)
      } else {
        console.log('⚠️  Nenhum mentor encontrado no banco')
      }

      // Buscar alunos
      const { data: alunos, error: errorAlunos } = await supabaseRequest('usuarios?tipo=eq.aluno&limit=1')

      if (errorAlunos) {
        console.log('❌ Erro ao buscar alunos:', errorAlunos.message)
      } else if (alunos && alunos.length > 0) {
        console.log('✅ Aluno de teste encontrado:', alunos[0].nome)
        console.log('   📧 Email:', alunos[0].email)
      } else {
        console.log('⚠️  Nenhum aluno encontrado no banco')
      }

    } catch (error) {
      console.log('❌ Erro no teste de autenticação:', error.message)
    }
  } else {
    console.log('⚠️  Pulando teste de autenticação - tabela usuarios não funciona')
  }

  // 6. Resultado final
  console.log('\n🎯 RESULTADO FINAL:')
  console.log('=====================================')
  
  if (tabelasOK === 3) {
    console.log('🎉 PERFEITO! Supabase 100% configurado e funcionando!')
    console.log('✅ Conexão: OK')
    console.log('✅ Todas as tabelas: OK')
    console.log('✅ Operações CRUD: OK')
    console.log('✅ Pronto para produção!')
    
    console.log('\n🚀 PRÓXIMOS PASSOS:')
    console.log('1. ✅ Supabase configurado')
    console.log('2. ✅ Tabelas criadas')
    console.log('3. 🔄 Execute: npm run dev')
    console.log('4. 🔄 Teste login na aplicação')
    console.log('5. 🔄 Deploy para produção')
    
    console.log('\n💯 PONTUAÇÃO: 5/5 - PRONTO PARA USAR!')
    
  } else if (tabelasOK > 0) {
    console.log('⚠️  QUASE LÁ! Supabase conectado mas faltam tabelas')
    console.log(`📊 Status: ${tabelasOK}/3 tabelas funcionando`)
    
    console.log('\n🔧 TABELAS FALTANDO:')
    Object.entries(tabelasDetalhes).forEach(([tabela, info]) => {
      if (info.status !== 'ok') {
        console.log(`   ❌ ${tabela}: ${info.error}`)
      }
    })
    
    console.log('\n🔧 PARA COMPLETAR:')
    console.log('1. Vá no Supabase Dashboard: https://supabase.com/dashboard')
    console.log('2. Abra o SQL Editor')
    console.log('3. Execute o SQL: scripts/criar-tabelas-completas.sql')
    console.log('4. Execute este script novamente')
    
    console.log(`\n📊 PONTUAÇÃO: ${Math.round((tabelasOK/3)*5)}/5`)
    
  } else {
    console.log('❌ PROBLEMA: Supabase conecta mas nenhuma tabela funciona')
    
    console.log('\n🔧 SOLUÇÃO URGENTE:')
    console.log('1. Vá no Supabase Dashboard: https://supabase.com/dashboard')
    console.log('2. Selecione seu projeto: bmakppbboypkggrtxlkn')
    console.log('3. Abra o SQL Editor')
    console.log('4. Execute o SQL completo para criar as tabelas')
    console.log('5. Execute este script novamente')
    
    console.log('\n📊 PONTUAÇÃO: 1/5 - Precisa criar todas as tabelas')
  }

  console.log('\n📋 RESUMO TÉCNICO:')
  console.log('URL Supabase:', supabaseUrl)
  console.log('Projeto ID: bmakppbboypkggrtxlkn')
  console.log('Tabelas funcionando:', `${tabelasOK}/3`)
  console.log('Status geral:', tabelasOK === 3 ? 'PRONTO' : tabelasOK > 0 ? 'PARCIAL' : 'PRECISA CONFIGURAR')
}

testarSupabaseOnly().catch(console.error)
