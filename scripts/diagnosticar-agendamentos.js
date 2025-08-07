const supabaseUrl = 'https://bmakppbboypkggrtxlkn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtYWtwcGJib3lwa2dncnR4bGtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjcwNjcsImV4cCI6MjA2NTg0MzA2N30.o9yvioEiGrLuGk239lG_lXIWGU6s_vzKPK0lPfV08vU'

async function supabaseRequest(endpoint, options = {}) {
  const url = `${supabaseUrl}/rest/v1/${endpoint}`
  const response = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText}`)
  }
  
  return response.json()
}

async function diagnosticarAgendamentos() {
  console.log('🔍 ==================== DIAGNÓSTICO DE AGENDAMENTOS ====================')
  
  try {
    // 1. Verificar estrutura da tabela agendamentos
    console.log('\n🏗️ 1. VERIFICANDO ESTRUTURA DA TABELA:')
    try {
      const agendamentos = await supabaseRequest('agendamentos?select=*&limit=1')
      if (agendamentos.length > 0) {
        console.log('✅ Tabela agendamentos existe!')
        console.log('📋 Colunas disponíveis:')
        Object.keys(agendamentos[0]).forEach(coluna => {
          console.log(`   - ${coluna}: ${typeof agendamentos[0][coluna]} = ${agendamentos[0][coluna]}`)
        })
      } else {
        console.log('⚠️ Tabela existe mas está vazia')
        console.log('   Tentando criar um agendamento de teste para ver a estrutura...')
      }
    } catch (error) {
      console.log('❌ Erro ao acessar tabela agendamentos:', error.message)
      return
    }
    
    // 2. Verificar todos os agendamentos
    console.log('\n📋 2. VERIFICANDO TODOS OS AGENDAMENTOS:')
    const todosAgendamentos = await supabaseRequest('agendamentos?select=*')
    console.log(`   Total de agendamentos: ${todosAgendamentos.length}`)
    
    if (todosAgendamentos.length === 0) {
      console.log('❌ PROBLEMA ENCONTRADO: Nenhum agendamento no banco!')
      console.log('   - Os agendamentos podem estar sendo salvos apenas no localStorage')
      console.log('   - A função criarAgendamento() pode não estar funcionando')
    } else {
      console.log('✅ Agendamentos encontrados:')
      todosAgendamentos.forEach((ag, index) => {
        console.log(`   ${index + 1}. ID: ${ag.id}`)
        console.log(`      Status: ${ag.status}`)
        console.log(`      Mentor ID: ${ag.mentor_id || 'NÃO DEFINIDO'}`)
        console.log(`      Aluno ID: ${ag.aluno_id || 'NÃO DEFINIDO'}`)
        
        // Verificar todos os campos de data possíveis
        const camposData = ['data', 'data_hora', 'data_agendamento', 'created_at']
        camposData.forEach(campo => {
          if (ag[campo]) {
            console.log(`      ${campo}: ${ag[campo]}`)
          }
        })
        
        // Verificar campo de horário
        if (ag.horario) console.log(`      horario: ${ag.horario}`)
        if (ag.assunto) console.log(`      assunto: ${ag.assunto}`)
        if (ag.observacoes) console.log(`      observacoes: ${ag.observacoes}`)
        if (ag.telefone) console.log(`      telefone: ${ag.telefone}`)
        
        console.log('')
      })
    }
    
    // 3. Analisar status dos agendamentos
    if (todosAgendamentos.length > 0) {
      console.log('\n📊 3. ANÁLISE POR STATUS:')
      const statusCount = {}
      todosAgendamentos.forEach(ag => {
        statusCount[ag.status] = (statusCount[ag.status] || 0) + 1
      })
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} agendamentos`)
      })
      
      // 4. Verificar agendamentos pendentes
      console.log('\n⏳ 4. AGENDAMENTOS PENDENTES:')
      const pendentes = todosAgendamentos.filter(ag => ag.status === 'pendente')
      
      if (pendentes.length === 0) {
        console.log('❌ PROBLEMA: Nenhum agendamento pendente encontrado!')
      } else {
        console.log(`✅ ${pendentes.length} agendamentos pendentes encontrados`)
      }
    }
    
    // 5. Verificar usuários mentores
    console.log('\n👨‍🏫 5. VERIFICANDO MENTORES:')
    const mentores = await supabaseRequest('usuarios?tipo=eq.mentor&select=*')
    console.log(`   Total de mentores: ${mentores.length}`)
    
    if (mentores.length === 0) {
      console.log('❌ PROBLEMA: Nenhum mentor encontrado!')
    } else {
      mentores.forEach((mentor, index) => {
        console.log(`   ${index + 1}. ${mentor.nome} (${mentor.email}) - ID: ${mentor.id}`)
      })
    }
    
    // 6. Verificar usuários alunos
    console.log('\n👨‍🎓 6. VERIFICANDO ALUNOS:')
    const alunos = await supabaseRequest('usuarios?tipo=eq.aluno&select=*')
    console.log(`   Total de alunos: ${alunos.length}`)
    
    if (alunos.length === 0) {
      console.log('❌ PROBLEMA: Nenhum aluno encontrado!')
    } else {
      alunos.forEach((aluno, index) => {
        console.log(`   ${index + 1}. ${aluno.nome} (${aluno.email}) - ID: ${aluno.id}`)
      })
    }
    
    // 7. Teste de criação de agendamento
    console.log('\n🧪 7. TESTE DE CRIAÇÃO DE AGENDAMENTO:')
    if (mentores.length > 0 && alunos.length > 0) {
      try {
        const mentor = mentores[0]
        const aluno = alunos[0]
        
        console.log(`   Tentando criar agendamento: ${aluno.nome} -> ${mentor.nome}`)
        
        const novoAgendamento = {
          mentor_id: mentor.id,
          aluno_id: aluno.id,
          data_agendamento: '2024-12-20',
          horario: '14:00',
          assunto: 'Teste de agendamento via diagnóstico',
          status: 'pendente'
        }
        
        console.log('   Dados do agendamento:', novoAgendamento)
        
        const resultado = await supabaseRequest('agendamentos', {
          method: 'POST',
          body: JSON.stringify(novoAgendamento)
        })
        
        console.log('✅ SUCESSO: Agendamento de teste criado!')
        console.log('   Resultado:', resultado)
        console.log('   ID:', resultado[0]?.id)
        console.log('   Isso significa que a tabela funciona, o problema está no componente React')
        
      } catch (error) {
        console.log('❌ ERRO ao criar agendamento de teste:', error.message)
        console.log('   Isso indica problema na estrutura da tabela ou permissões')
        
        // Tentar descobrir a estrutura correta
        console.log('\n🔍 Tentando descobrir estrutura da tabela...')
        try {
          const mentor = mentores[0]
          const aluno = alunos[0]
          
          // Tentar com diferentes estruturas
          const estruturas = [
            { data: '2024-12-20', horario: '14:00' },
            { data_hora: '2024-12-20T14:00:00' },
            { data_agendamento: '2024-12-20', hora: '14:00' },
            { data_sessao: '2024-12-20', horario_sessao: '14:00' }
          ]
          
          for (const estrutura of estruturas) {
            try {
              const teste = {
                mentor_id: mentor.id,
                aluno_id: aluno.id,
                ...estrutura,
                assunto: 'Teste estrutura',
                status: 'pendente'
              }
              
              console.log(`   Testando estrutura:`, teste)
              const resultado = await supabaseRequest('agendamentos', {
                method: 'POST',
                body: JSON.stringify(teste)
              })
              
              console.log('✅ ESTRUTURA CORRETA ENCONTRADA:', estrutura)
              console.log('   Resultado:', resultado)
              break
              
            } catch (err) {
              console.log(`   ❌ Estrutura ${JSON.stringify(estrutura)} falhou:`, err.message)
            }
          }
          
        } catch (err) {
          console.log('   ❌ Erro ao testar estruturas:', err.message)
        }
      }
    }
    
    // 8. Diagnóstico final
    console.log('\n🎯 8. DIAGNÓSTICO FINAL:')
    
    if (todosAgendamentos.length === 0) {
      console.log('❌ CRÍTICO: Agendamentos não estão sendo salvos no Supabase')
      console.log('   SOLUÇÃO: Verificar função criarAgendamento() no componente')
    } else if (todosAgendamentos.filter(ag => ag.status === 'pendente').length === 0) {
      console.log('⚠️ ATENÇÃO: Não há agendamentos pendentes')
      console.log('   POSSÍVEIS CAUSAS:')
      console.log('   - Todos foram processados')
      console.log('   - Status não está sendo definido como "pendente"')
    } else if (mentores.length === 0) {
      console.log('❌ CRÍTICO: Não há mentores cadastrados')
      console.log('   SOLUÇÃO: Cadastrar pelo menos um mentor')
    } else {
      console.log('✅ ESTRUTURA OK: Agendamentos e mentores existem')
      console.log('   VERIFICAR: Componente AnalisarSolicitacoes pode ter problema de filtro')
    }
    
  } catch (error) {
    console.error('❌ ERRO no diagnóstico:', error.message)
  }
  
  console.log('\n🔍 ==================== FIM DO DIAGNÓSTICO ====================')
}

// Executar diagnóstico
diagnosticarAgendamentos()
