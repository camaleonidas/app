// 🔍 DIAGNOSTICAR PROBLEMA DO BANCO

import { supabase } from "../lib/supabase.js"

console.log("🔍 DIAGNÓSTICO COMPLETO DO BANCO")
console.log("=".repeat(50))

try {
  // 1. Testar conexão básica
  console.log("1. 🔍 Testando conexão básica...")
  const { data: testBasico, error: errorBasico } = await supabase.from("usuarios").select("count").limit(1)

  if (errorBasico) {
    console.log("❌ Erro na conexão básica:", errorBasico.message)
    console.log("Código:", errorBasico.code)
    console.log("Detalhes:", errorBasico.details)
  } else {
    console.log("✅ Conexão básica funcionando")
  }

  // 2. Verificar estrutura da tabela usuarios
  console.log("\n2. 🔍 Verificando estrutura da tabela usuarios...")
  const { data: estrutura, error: errorEstrutura } = await supabase
    .from("information_schema.columns")
    .select("column_name, data_type, is_nullable")
    .eq("table_name", "usuarios")

  if (errorEstrutura) {
    console.log("❌ Não foi possível verificar estrutura:", errorEstrutura.message)
  } else {
    console.log("✅ Colunas da tabela usuarios:")
    estrutura?.forEach((col) => {
      console.log(`   - ${col.column_name}: ${col.data_type}`)
    })
  }

  // 3. Testar consulta simples
  console.log("\n3. 🔍 Testando consulta simples...")
  const { data: usuarios, error: errorUsuarios } = await supabase
    .from("usuarios")
    .select("id, nome, email, tipo")
    .limit(3)

  if (errorUsuarios) {
    console.log("❌ Erro na consulta:", errorUsuarios.message)
  } else {
    console.log("✅ Consulta funcionando:")
    usuarios?.forEach((user) => {
      console.log(`   - ${user.nome} (${user.email})`)
    })
  }

  // 4. Testar consulta com status
  console.log("\n4. 🔍 Testando consulta com coluna status...")
  const { data: usuariosComStatus, error: errorStatus } = await supabase
    .from("usuarios")
    .select("id, nome, email, tipo, status")
    .limit(1)

  if (errorStatus) {
    console.log("❌ Coluna status não existe:", errorStatus.message)
    console.log("🔧 SOLUÇÃO: Execute o script 'corrigir-tabela-usuarios.sql'")
  } else {
    console.log("✅ Coluna status existe e funciona")
    console.log("Status dos usuários:", usuariosComStatus)
  }

  // 5. Verificar outras tabelas
  console.log("\n5. 🔍 Verificando outras tabelas...")
  const tabelas = ["agendamentos", "configuracoes_mentor"]

  for (const tabela of tabelas) {
    try {
      const { data, error } = await supabase.from(tabela).select("id").limit(1)
      if (error) {
        console.log(`❌ Tabela ${tabela}:`, error.message)
      } else {
        console.log(`✅ Tabela ${tabela}: OK`)
      }
    } catch (err) {
      console.log(`❌ Erro na tabela ${tabela}:`, err.message)
    }
  }

  console.log("\n🎯 RESUMO DO DIAGNÓSTICO:")
  console.log("1. Se a coluna 'status' não existe → Execute 'corrigir-tabela-usuarios.sql'")
  console.log("2. Se as tabelas não existem → Execute 'recriar-tabelas-completas.sql'")
  console.log("3. Se tudo estiver OK → O problema foi resolvido!")
} catch (error) {
  console.log("❌ ERRO CRÍTICO:", error.message)
  console.log("Stack:", error.stack)
}
