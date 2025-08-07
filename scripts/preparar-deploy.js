const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando projeto para deploy...\n');

// Funções auxiliares
function executarComando(comando, mensagem) {
    console.log(`👉 ${mensagem}...`);
    try {
        execSync(comando, { stdio: 'inherit' });
        console.log('✅ Sucesso!\n');
        return true;
    } catch (error) {
        console.error('❌ Erro:', error.message);
        return false;
    }
}

function verificarArquivo(arquivo, mensagem) {
    console.log(`👉 Verificando ${mensagem}...`);
    const existe = fs.existsSync(path.join(process.cwd(), arquivo));
    console.log(existe ? '✅ Encontrado!' : '❌ Não encontrado!');
    return existe;
}

// 1. Verificar arquivos essenciais
console.log('1️⃣ Verificando arquivos essenciais:');
const arquivosEssenciais = [
    { arquivo: 'next.config.mjs', mensagem: 'configuração Next.js' },
    { arquivo: 'package.json', mensagem: 'package.json' },
    { arquivo: 'tsconfig.json', mensagem: 'configuração TypeScript' }
];

let todosArquivosExistem = true;
for (const { arquivo, mensagem } of arquivosEssenciais) {
    if (!verificarArquivo(arquivo, mensagem)) {
        todosArquivosExistem = false;
    }
}

if (!todosArquivosExistem) {
    console.error('\n❌ Arquivos essenciais faltando. Corrija antes de continuar.');
    process.exit(1);
}

// 2. Limpar e instalar dependências
console.log('\n2️⃣ Preparando dependências:');
executarComando('rm -rf node_modules .next', 'Limpando instalação anterior');
executarComando('npm install', 'Instalando dependências');

// 3. Verificar tipos e lint
console.log('\n3️⃣ Verificando qualidade do código:');
executarComando('npm run typecheck', 'Verificando tipos');
executarComando('npm run lint', 'Executando linter');

// 4. Fazer build de teste
console.log('\n4️⃣ Testando build:');
executarComando('npm run build', 'Criando build de teste');

// 5. Criar arquivo vercel.json se não existir
console.log('\n5️⃣ Configurando Vercel:');
if (!verificarArquivo('vercel.json', 'configuração Vercel')) {
    console.log('👉 Criando vercel.json...');
    const vercelConfig = {
        "version": 2,
        "builds": [
            {
                "src": "package.json",
                "use": "@vercel/next"
            }
        ],
        "routes": [
            {
                "src": "/(.*)",
                "dest": "/"
            }
        ],
        "env": {
            "NEXT_PUBLIC_SITE_URL": "@site_url"
        }
    };

    fs.writeFileSync(
        path.join(process.cwd(), 'vercel.json'),
        JSON.stringify(vercelConfig, null, 2)
    );
    console.log('✅ vercel.json criado!\n');
}

console.log(`
🎉 Projeto pronto para deploy!

Próximos passos:

1. Execute: vercel login
2. Execute: vercel
3. Siga as instruções na tela

Para fazer deploy em produção depois:
- Execute: vercel --prod

Lembre-se de configurar as variáveis de ambiente na Vercel:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_SITE_URL
- NEXT_PUBLIC_SENTRY_DSN (se estiver usando Sentry)
`);
