// Vamos verificar se o Supabase já está instalado
try {
  // Tentativa de importar o Supabase
  const { createClient } = await import("@supabase/supabase-js")
  console.log("✅ Supabase já está instalado!")
  console.log("Versão encontrada:", createClient ? "Disponível" : "Não disponível")
} catch (error) {
  console.log("❌ Supabase NÃO está instalado")
  console.log("Erro:", error.message)
  console.log("\n📦 Você precisa instalar o Supabase primeiro!")
}

// Vamos também verificar outras dependências relacionadas
const dependenciasParaVerificar = ["@supabase/supabase-js", "@supabase/auth-helpers-nextjs", "@supabase/auth-ui-react"]

console.log("\n🔍 Verificando dependências do Supabase...")

for (const dep of dependenciasParaVerificar) {
  try {
    await import(dep)
    console.log(`✅ ${dep} - Instalado`)
  } catch (error) {
    console.log(`❌ ${dep} - NÃO instalado`)
  }
}
