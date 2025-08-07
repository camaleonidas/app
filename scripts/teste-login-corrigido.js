// 🧪 TESTE DE LOGIN CORRIGIDO

import { autenticarUsuario } from "../lib/supabase-service.js"

console.log("🧪 TESTE DE LOGIN CORRIGIDO")
console.log("=".repeat(40))

async function testarLogin() {
  try {
    console.log("1. 🔍 Testando login do mentor...")
    const mentor = await autenticarUsuario("mentor@email.com", "123456", "mentor")

    if (mentor) {
      console.log("✅ Login do mentor funcionou!")
      console.log("Dados:", {
        id: mentor.id,
        nome: mentor.nome,
        email: mentor.email,
        tipo: mentor.tipo,
        status: mentor.status || "não definido",
      })
    } else {
      console.log("❌ Login do mentor falhou")
    }

    console.log("\n2. 🔍 Testando login do aluno...")
    const aluno = await autenticarUsuario("aluno@email.com", "123456", "aluno")

    if (aluno) {
      console.log("✅ Login do aluno funcionou!")
      console.log("Dados:", {
        id: aluno.id,
        nome: aluno.nome,
        email: aluno.email,
        tipo: aluno.tipo,
        status: aluno.status || "não definido",
      })
    } else {
      console.log("❌ Login do aluno falhou")
    }

    console.log("\n3. 🔍 Testando login inválido...")
    const invalido = await autenticarUsuario("inexistente@email.com", "senha_errada", "aluno")

    if (!invalido) {
      console.log("✅ Login inválido rejeitado corretamente")
    } else {
      console.log("❌ Login inválido foi aceito (problema!)")
    }

    console.log("\n🎉 TESTE DE LOGIN CONCLUÍDO!")
  } catch (error) {
    console.log("❌ Erro no teste:", error.message)
  }
}

testarLogin()
