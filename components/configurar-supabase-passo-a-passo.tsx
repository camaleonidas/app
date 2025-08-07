"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Copy, ExternalLink, CheckCircle, AlertTriangle, Database, Settings, Play } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ConfigurarSupabasePassoAPasso() {
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [passoAtual, setPassoAtual] = useState(1)

  const validarUrl = (url: string) => {
    return url.includes('supabase.co') && url.startsWith('https://')
  }

  const validarKey = (key: string) => {
    return key.length > 50 && key.includes('.')
  }

  const configuracaoValida = validarUrl(supabaseUrl) && validarKey(supabaseKey)

  const gerarArquivoEnv = () => {
    return `# Configurações do Supabase - MentoriaApp
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}

# Configuração completa! ✅
# Reinicie o servidor: npm run dev
`
  }

  const copiarParaClipboard = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const sqlCompleto = `-- 🚀 SCRIPT COMPLETO PARA MENTORIAAPP
-- Execute este SQL no Supabase Dashboard → SQL Editor

-- 1. Tabela de usuários (mentores e alunos)
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('mentor', 'aluno')) NOT NULL,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de configurações dos mentores
CREATE TABLE IF NOT EXISTS configuracoes_mentor (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  horarios_disponiveis JSONB DEFAULT '{}',
  preco_por_hora DECIMAL(10,2) DEFAULT 0,
  especialidades TEXT[] DEFAULT '{}',
  bio TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  data_agendamento DATE NOT NULL,
  horario TIME NOT NULL,
  assunto TEXT NOT NULL,
  status TEXT CHECK (status IN ('pendente', 'confirmado', 'recusado', 'cancelado', 'concluido')) DEFAULT 'pendente',
  motivo_recusa TEXT,
  observacoes TEXT,
  link_call TEXT,
  gravacao_url TEXT,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_agendamentos_mentor ON agendamentos(mentor_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_aluno ON agendamentos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- 5. Inserir dados de exemplo para teste
INSERT INTO usuarios (nome, email, senha, tipo, telefone) VALUES
('João Silva', 'joao.mentor@exemplo.com', 'senha123', 'mentor', '(11) 99999-1111'),
('Maria Santos', 'maria.aluna@exemplo.com', 'senha123', 'aluno', '(11) 99999-2222'),
('Pedro Oliveira', 'pedro.mentor@exemplo.com', 'senha123', 'mentor', '(11) 99999-3333'),
('Ana Costa', 'ana.aluna@exemplo.com', 'senha123', 'aluno', '(11) 99999-4444')
ON CONFLICT (email) DO NOTHING;

-- 6. Configurações iniciais para os mentores
INSERT INTO configuracoes_mentor (mentor_id, horarios_disponiveis, preco_por_hora, especialidades, bio)
SELECT 
  u.id,
  '{"segunda": ["09:00", "10:00", "14:00", "15:00"], "terca": ["09:00", "10:00", "14:00", "15:00"], "quarta": ["09:00", "10:00", "14:00", "15:00"]}',
  150.00,
  ARRAY['Programação', 'JavaScript', 'React'],
  'Mentor experiente em desenvolvimento web'
FROM usuarios u 
WHERE u.tipo = 'mentor'
ON CONFLICT DO NOTHING;

-- 7. Alguns agendamentos de exemplo
INSERT INTO agendamentos (aluno_id, mentor_id, data_agendamento, horario, assunto, status)
SELECT 
  (SELECT id FROM usuarios WHERE tipo = 'aluno' LIMIT 1),
  (SELECT id FROM usuarios WHERE tipo = 'mentor' LIMIT 1),
  CURRENT_DATE + INTERVAL '1 day',
  '10:00',
  'Revisão de código React',
  'pendente'
WHERE EXISTS (SELECT 1 FROM usuarios WHERE tipo = 'aluno') 
  AND EXISTS (SELECT 1 FROM usuarios WHERE tipo = 'mentor');

-- 8. Verificação final
SELECT 
  'Configuração completa! 🎉' as status,
  (SELECT COUNT(*) FROM usuarios) as total_usuarios,
  (SELECT COUNT(*) FROM usuarios WHERE tipo = 'mentor') as mentores,
  (SELECT COUNT(*) FROM usuarios WHERE tipo = 'aluno') as alunos,
  (SELECT COUNT(*) FROM agendamentos) as agendamentos,
  (SELECT COUNT(*) FROM configuracoes_mentor) as configuracoes_mentor;`

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Configuração Completa do Supabase - MentoriaApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-yellow-200 bg-yellow-50 mb-6">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Problemas identificados:</strong> Arquivo .env.local não configurado e tabelas do banco não existem.
              Vamos resolver tudo agora!
            </AlertDescription>
          </Alert>

          <Tabs value={`passo-${passoAtual}`} onValueChange={(value) => setPassoAtual(parseInt(value.split('-')[1]))}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="passo-1" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Passo 1: Credenciais
              </TabsTrigger>
              <TabsTrigger value="passo-2" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Passo 2: Banco de Dados
              </TabsTrigger>
              <TabsTrigger value="passo-3" className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Passo 3: Testar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="passo-1" className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">🔑 Configurar Credenciais do Supabase</h3>
                
                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                    <span>Acesse o painel do Supabase</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Abrir Dashboard
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                    <span>Selecione seu projeto (ou crie um novo)</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                    <span>Vá em <strong>Settings → API</strong></span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
                    <span>Copie a <strong>Project URL</strong> e <strong>anon public key</strong></span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="supabase-url">Project URL</Label>
                    <Input
                      id="supabase-url"
                      placeholder="https://seu-projeto-id.supabase.co"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      className={validarUrl(supabaseUrl) ? "border-green-500" : ""}
                    />
                    {supabaseUrl && !validarUrl(supabaseUrl) && (
                      <p className="text-sm text-red-600 mt-1">
                        URL deve começar com https:// e conter supabase.co
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="supabase-key">Anon Public Key</Label>
                    <Textarea
                      id="supabase-key"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      className={validarKey(supabaseKey) ? "border-green-500" : ""}
                      rows={3}
                    />
                    {supabaseKey && !validarKey(supabaseKey) && (
                      <p className="text-sm text-red-600 mt-1">
                        Chave deve ser um JWT longo (mais de 50 caracteres)
                      </p>
                    )}
                  </div>
                </div>

                {configuracaoValida && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">📄 Conteúdo do arquivo .env.local:</h4>
                    
                    <div className="relative">
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                        {gerarArquivoEnv()}
                      </pre>
                      <Button
                        onClick={() => copiarParaClipboard(gerarArquivoEnv())}
                        className="absolute top-2 right-2"
                        size="sm"
                        variant="secondary"
                      >
                        {copiado ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>

                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Instruções:</strong>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                          <li>Copie o conteúdo acima</li>
                          <li>Crie um arquivo chamado <code className="bg-green-100 px-1 rounded">.env.local</code> na raiz do projeto</li>
                          <li>Cole o conteúdo no arquivo</li>
                          <li>Salve o arquivo</li>
                          <li>Vá para o Passo 2</li>
                        </ol>
                      </AlertDescription>
                    </Alert>

                    <Button 
                      onClick={() => setPassoAtual(2)}
                      className="w-full"
                      size="lg"
                    >
                      ✅ Passo 1 Concluído - Ir para Passo 2
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="passo-2" className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">🗄️ Criar Tabelas no Banco de Dados</h3>
                
                <Alert className="border-blue-200 bg-blue-50">
                  <Database className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Agora vamos criar todas as tabelas necessárias para o MentoriaApp funcionar perfeitamente.
                  </AlertDescription>
                </Alert>

                <div className="bg-orange-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                    <span>No Supabase Dashboard, vá em <strong>SQL Editor</strong></span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                    <span>Clique em <strong>New Query</strong></span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                    <span>Cole o SQL abaixo e clique em <strong>Run</strong></span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">📝 SQL Completo para Executar:</h4>
                  
                  <div className="relative">
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                      {sqlCompleto}
                    </pre>
                    <Button
                      onClick={() => copiarParaClipboard(sqlCompleto)}
                      className="absolute top-2 right-2"
                      size="sm"
                      variant="secondary"
                    >
                      {copiado ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar SQL
                        </>
                      )}
                    </Button>
                  </div>

                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      <strong>Este SQL vai criar:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>✅ Tabela <code>usuarios</code> (mentores e alunos)</li>
                        <li>✅ Tabela <code>configuracoes_mentor</code> (horários e preços)</li>
                        <li>✅ Tabela <code>agendamentos</code> (sessões de mentoria)</li>
                        <li>✅ Índices para performance</li>
                        <li>✅ Dados de exemplo para teste</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={() => setPassoAtual(3)}
                    className="w-full"
                    size="lg"
                  >
                    ✅ Passo 2 Concluído - Ir para Passo 3
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="passo-3" className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">🧪 Testar Configuração</h3>
                
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Parabéns!</strong> Se você completou os passos 1 e 2, seu Supabase deve estar funcionando perfeitamente.
                  </AlertDescription>
                </Alert>

                <div className="bg-purple-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold">🚀 Comandos para executar no terminal:</h4>
                  
                  <div className="space-y-2">
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                      node scripts/corrigir-problemas-supabase.js
                    </div>
                    <p className="text-sm text-gray-600">↑ Para verificar se tudo está configurado</p>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                      node scripts/auditoria-completa-supabase.js
                    </div>
                    <p className="text-sm text-gray-600">↑ Para auditoria completa e resposta final</p>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                      npm run dev
                    </div>
                    <p className="text-sm text-gray-600">↑ Para reiniciar o servidor e testar a aplicação</p>
                  </div>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Resultado esperado:</strong> Após executar os comandos, você deve ver "5/5 (100%)" na auditoria, 
                    confirmando que seu Supabase está 100% pronto para produção!
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => window.location.href = '/teste-conexao'}
                    variant="outline"
                    className="w-full"
                  >
                    🔌 Testar Conexão Visual
                  </Button>
                  
                  <Button 
                    onClick={() => window.location.href = '/'}
                    className="w-full"
                  >
                    🏠 Ir para Aplicação
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
