console.log("🚀 TESTE FINAL DE CONEXÃO SUPABASE")

async function testarTudo() {
  try {
    // Importar serviços
    const { testarConexaoCompleta, buscarUsuarios, buscarAgendamentos } = await import("../lib/supabase-service.js")

    console.log("\n1️⃣ Testando conexão básica...")
    const conexaoOk = await testarConexaoCompleta()

    if (!conexaoOk) {
      console.log("❌ Conexão falhou - verifique as credenciais")
      return
    }

    console.log("\n2️⃣ Buscando usuários...")
    const usuarios = await buscarUsuarios()
    console.log(`✅ Encontrados ${usuarios.length} usuários`)
    usuarios.forEach((u) => console.log(`  - ${u.nome} (${u.email}) - ${u.tipo}`))

    console.log("\n3️⃣ Buscando agendamentos...")
    const agendamentos = await buscarAgendamentos()
    console.log(`✅ Encontrados ${agendamentos.length} agendamentos`)
    agendamentos.forEach((a) => console.log(`  - ${a.data_agendamento} ${a.horario} - ${a.status}`))

    console.log("\n🎉 TUDO FUNCIONANDO PERFEITAMENTE!")
  } catch (error) {
    console.log("❌ ERRO NO TESTE:", error.message)
  }
}

testarTudo()
