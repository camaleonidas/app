// 🔍 VERIFICAR SE O SUPABASE ESTÁ INSTALADO

console.log("🔍 VERIFICANDO INSTALAÇÃO DO SUPABASE")
console.log("=".repeat(40))

try {
  // Tentar importar o Supabase
  console.log("1. 🔍 Tentando importar @supabase/supabase-js...")
  const { createClient } = await import("@supabase/supabase-js")

  console.log("   ✅ Supabase importado com sucesso!")
  console.log("   Função createClient:", typeof createClient)

  // Testar criação do cliente
  console.log("2. 🔍 Testando criação do cliente...")
  const supabase = createClient("https://test.supabase.co", "test-key")
  console.log("   ✅ Cliente criado com sucesso!")

  console.log("\n🎉 SUPABASE ESTÁ INSTALADO E FUNCIONANDO!")
} catch (error) {
  console.log("   ❌ Erro ao importar Supabase:", error.message)

  if (error.message.includes("Cannot resolve")) {
    console.log("\n❌ SUPABASE NÃO ESTÁ INSTALADO")
    console.log("\n📦 COMO INSTALAR:")
    console.log("1. Abra o terminal")
    console.log("2. Execute: npm install @supabase/supabase-js")
    console.log("3. Aguarde a instalação")
    console.log("4. Execute este script novamente")
  } else {
    console.log("\n❌ Outro erro:", error.stack)
  }
}

console.log("\n📋 INFORMAÇÕES DO SISTEMA:")
console.log("Node.js:", process.version)
console.log("Plataforma:", process.platform)
