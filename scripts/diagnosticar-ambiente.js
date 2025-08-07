console.log('🔍 DIAGNÓSTICO COMPLETO DO AMBIENTE')
console.log('='.repeat(60))

// PASSO 1: Detectar onde está rodando
console.log('📍 PASSO 1 - Onde está rodando:')

// Verificar se está no Vercel
if (process.env.VERCEL) {
  console.log('🌐 A) VERCEL - Deploy online detectado!')
  console.log('   - VERCEL_ENV:', process.env.VERCEL_ENV)
  console.log('   - VERCEL_URL:', process.env.VERCEL_URL)
  console.log('   - VERCEL_GIT_COMMIT_SHA:', process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 8))
}
// Verificar se está no Netlify
else if (process.env.NETLIFY) {
  console.log('🌐 A) NETLIFY - Deploy online detectado!')
  console.log('   - NETLIFY_SITE_NAME:', process.env.NETLIFY_SITE_NAME)
  console.log('   - DEPLOY_URL:', process.env.DEPLOY_URL)
}
// Verificar outros serviços
else if (process.env.RAILWAY_ENVIRONMENT) {
  console.log('🔧 C) RAILWAY - Outro serviço detectado!')
}
else if (process.env.RENDER) {
  console.log('🔧 C) RENDER - Outro serviço detectado!')
}
else if (process.env.HEROKU_APP_NAME) {
  console.log('🔧 C) HEROKU - Outro serviço detectado!')
}
// Provavelmente local
else {
  console.log('💻 B) LOCAL - Rodando no seu computador (localhost)')
  console.log('   - NODE_ENV:', process.env.NODE_ENV || 'não definido')
  console.log('   - PORT:', process.env.PORT || '3000 (padrão)')
}

console.log('\n' + '-'.repeat(60))

// PASSO 2: Verificar arquivos de ambiente
console.log('📁 PASSO 2 - Arquivos de ambiente:')

const fs = require('fs')
const path = require('path')

// Lista de arquivos .env possíveis
const envFiles = [
  '.env',
  '.env.local', 
  '.env.development',
  '.env.development.local',
  '.env.production',
  '.env.production.local',
  '.env.test',
  '.env.test.local'
]

let encontrouArquivos = false

envFiles.forEach(file => {
  try {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      console.log(`✅ Encontrado: ${file}`)
      encontrouArquivos = true
      
      // Ler o arquivo e mostrar as chaves (sem valores)
      const content = fs.readFileSync(path.join(process.cwd(), file), 'utf8')
      const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'))
      
      if (lines.length > 0) {
        console.log(`   Variáveis encontradas:`)
        lines.forEach(line => {
          const [key] = line.split('=')
          if (key) {
            console.log(`   - ${key.trim()}`)
          }
        })
      }
    }
  } catch (error) {
    // Arquivo não existe ou erro de leitura
  }
})

if (!encontrouArquivos) {
  console.log('❌ Nenhum arquivo .env encontrado!')
  console.log('   Você precisa criar um arquivo .env.local com suas credenciais do Supabase')
}

console.log('\n' + '-'.repeat(60))

// PASSO 3: Verificar variáveis de ambiente atuais
console.log('🔑 PASSO 3 - Variáveis de ambiente carregadas:')

const supabaseVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET'
]

supabaseVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`❌ ${varName}: NÃO DEFINIDA`)
  }
})

console.log('\n' + '='.repeat(60))

// RESUMO E PRÓXIMOS PASSOS
console.log('📋 RESUMO:')

if (process.env.VERCEL || process.env.NETLIFY) {
  console.log('🌐 Você está em PRODUÇÃO (deploy online)')
  console.log('   → Configure as variáveis no painel do seu provedor')
  console.log('   → Vercel: Settings → Environment Variables')
  console.log('   → Netlify: Site Settings → Environment Variables')
} else {
  console.log('💻 Você está em DESENVOLVIMENTO (local)')
  console.log('   → Crie um arquivo .env.local na raiz do projeto')
  console.log('   → Adicione suas credenciais do Supabase')
}

const temSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
const temSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (temSupabaseUrl && temSupabaseKey) {
  console.log('✅ Variáveis do Supabase estão configuradas!')
} else {
  console.log('❌ Variáveis do Supabase estão FALTANDO!')
  console.log('   → NEXT_PUBLIC_SUPABASE_URL')
  console.log('   → NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

console.log('='.repeat(60))

// Execute o script para ver os resultados do diagnóstico completo do ambiente.
