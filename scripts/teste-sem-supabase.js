// 🧪 TESTE SEM SUPABASE - Vamos ver se o problema é só o Supabase

console.log("🧪 TESTE BÁSICO SEM SUPABASE")
console.log("=".repeat(40))

// Teste básico de JavaScript
console.log("1. ✅ JavaScript funcionando!")

// Teste de fetch (para HTTP)
try {
  console.log("2. 🔍 Testando fetch...")
  const response = await fetch("https://jsonplaceholder.typicode.com/posts/1")
  const data = await response.json()
  console.log("   ✅ Fetch funcionando!")
  console.log("   Título do post:", data.title)
} catch (error) {
  console.log("   ❌ Erro no fetch:", error.message)
}

// Teste de conexão direta com Supabase (sem biblioteca)
try {
  console.log("3. 🔍 Testando conexão direta com Supabase...")
  const supabaseUrl = "https://gxnrytchaznueqrrjsph.supabase.co"
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bnJ5dGNoYXpudWVxcnJqc3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNjc2MjgsImV4cCI6MjA2NTg0MzYyOH0.XRgx9Ie8Qbu2x_u0w8M6oH3LiYX_DJwd9T2IecfvZXY"

  const response = await fetch(`${supabaseUrl}/rest/v1/usuarios?select=nome,email`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    },
  })

  if (response.ok) {
    const usuarios = await response.json()
    console.log("   ✅ Conexão direta funcionando!")
    console.log("   Usuários encontrados:", usuarios.length)
    usuarios.forEach((user) => {
      console.log(`      - ${user.nome} (${user.email})`)
    })
  } else {
    console.log("   ❌ Erro na conexão:", response.status, response.statusText)
  }
} catch (error) {
  console.log("   ❌ Erro na conexão direta:", error.message)
}

console.log("\n🎯 CONCLUSÃO:")
console.log("Se chegou até aqui, o problema é só a instalação do Supabase!")
