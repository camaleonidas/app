console.log('🔧 RECUPERANDO CONFIGURAÇÃO DO SUPABASE')
console.log('='.repeat(60))

const fs = require('fs')
const path = require('path')

// Verificar se existe arquivo .env.local
const envLocalPath = path.join(process.cwd(), '.env.local')
const envPath = path.join(process.cwd(), '.env')

console.log('📁 Verificando arquivos de ambiente existentes...')

let arquivoEncontrado = null
let conteudoAtual = ''

if (fs.existsSync(envLocalPath)) {
  arquivoEncontrado = '.env.local'
  conteudoAtual = fs.readFileSync(envLocalPath, 'utf8')
  console.log('✅ Encontrado: .env.local')
} else if (fs.existsSync(envPath)) {
  arquivoEncontrado = '.env'
  conteudoAtual = fs.readFileSync(envPath, 'utf8')
  console.log('✅ Encontrado: .env')
} else {
  console.log('❌ Nenhum arquivo .env encontrado')
}

console.log('\n' + '-'.repeat(60))

// Analisar conteúdo atual
console.log('🔍 Analisando configuração atual:')

const linhas = conteudoAtual.split('\n')
let temSupabaseUrl = false
let temSupabaseKey = false
let supabaseKeyValue = ''

linhas.forEach(linha => {
  if (linha.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    temSupabaseUrl = true
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL encontrada')
  }
  if (linha.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    temSupabaseKey = true
    const [, value] = linha.split('=')
    supabaseKeyValue = value?.trim() || ''
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY encontrada')
  }
})

if (!temSupabaseUrl) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL está FALTANDO')
}

if (!temSupabaseKey) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY está FALTANDO')
}

console.log('\n' + '-'.repeat(60))

// Tentar recuperar URL do Supabase baseado na chave
console.log('🔍 Tentando recuperar URL do Supabase...')

if (supabaseKeyValue && supabaseKeyValue.length > 20) {
  // A chave do Supabase geralmente contém informações sobre o projeto
  console.log('💡 Encontrei sua chave do Supabase!')
  console.log('   Chave (primeiros 20 chars):', supabaseKeyValue.substring(0, 20) + '...')
  
  // Instruções para recuperar a URL
  console.log('\n📋 COMO RECUPERAR SUA URL DO SUPABASE:')
  console.log('1. Acesse: https://supabase.com/dashboard')
  console.log('2. Faça login na sua conta')
  console.log('3. Selecione seu projeto')
  console.log('4. Vá em Settings → API')
  console.log('5. Copie a "Project URL"')
  console.log('6. A URL deve ser algo como: https://xxxxxxxxx.supabase.co')
} else {
  console.log('❌ Não encontrei a chave do Supabase também')
  console.log('\n📋 VOCÊ PRECISA RECUPERAR AMBAS AS CREDENCIAIS:')
  console.log('1. Acesse: https://supabase.com/dashboard')
  console.log('2. Faça login na sua conta')
  console.log('3. Selecione seu projeto')
  console.log('4. Vá em Settings → API')
  console.log('5. Copie a "Project URL" e "anon public key"')
}

console.log('\n' + '-'.repeat(60))

// Criar template do arquivo .env.local
console.log('📝 Criando template do arquivo .env.local...')

const templateEnv = `# Configuração do Supabase
# Substitua pelos valores reais do seu projeto

# URL do seu projeto Supabase (algo como: https://xxxxxxxxx.supabase.co)
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO-ID.supabase.co

# Chave pública anônima do Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKeyValue || 'sua-chave-anonima-aqui'}

# Opcional: Chave de serviço (para operações administrativas)
# SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico-aqui
`

// Salvar template
const templatePath = path.join(process.cwd(), '.env.local.template')
fs.writeFileSync(templatePath, templateEnv)

console.log('✅ Template criado: .env.local.template')
console.log('\n📋 PRÓXIMOS PASSOS:')
console.log('1. Abra o arquivo .env.local.template')
console.log('2. Substitua "SEU-PROJETO-ID" pela URL real do seu Supabase')
console.log('3. Renomeie o arquivo para .env.local')
console.log('4. Reinicie o servidor (npm run dev)')

console.log('\n' + '='.repeat(60))
console.log('🎯 RESUMO: Você precisa recuperar a URL do Supabase!')
console.log('   → Acesse https://supabase.com/dashboard')
console.log('   → Vá em Settings → API do seu projeto')
console.log('   → Copie a Project URL')
console.log('='.repeat(60))
