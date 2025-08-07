"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Copy, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react'

export default function RecuperarSupabase() {
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')
  const [copiado, setCopiado] = useState(false)

  const gerarArquivoEnv = () => {
    const conteudo = `# Configuração do Supabase
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}

# Opcional: Chave de serviço (para operações administrativas)
# SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico-aqui
`
    return conteudo
  }

  const copiarParaClipboard = async () => {
    try {
      await navigator.clipboard.writeText(gerarArquivoEnv())
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const validarUrl = (url: string) => {
    return url.includes('supabase.co') && url.startsWith('https://')
  }

  const validarKey = (key: string) => {
    return key.length > 50 && key.includes('.')
  }

  const configuracaoValida = validarUrl(supabaseUrl) && validarKey(supabaseKey)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Recuperar Configuração do Supabase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Alerta sobre o problema */}
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Problema detectado:</strong> A variável NEXT_PUBLIC_SUPABASE_URL foi deletada acidentalmente.
              Vamos recuperar suas credenciais do Supabase.
            </AlertDescription>
          </Alert>

          {/* Instruções para recuperar credenciais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">📋 Como recuperar suas credenciais:</h3>
            
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
                <span>Selecione seu projeto</span>
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
          </div>

          {/* Formulário para inserir credenciais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">🔑 Inserir credenciais:</h3>
            
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
          </div>

          {/* Preview do arquivo .env.local */}
          {configuracaoValida && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">📄 Conteúdo do arquivo .env.local:</h3>
              
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  {gerarArquivoEnv()}
                </pre>
                <Button
                  onClick={copiarParaClipboard}
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
                  <strong>Próximos passos:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Copie o conteúdo acima</li>
                    <li>Crie um arquivo chamado <code className="bg-green-100 px-1 rounded">.env.local</code> na raiz do projeto</li>
                    <li>Cole o conteúdo no arquivo</li>
                    <li>Salve o arquivo</li>
                    <li>Reinicie o servidor (npm run dev)</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Botão para testar após configurar */}
          {configuracaoValida && (
            <div className="pt-4 border-t">
              <Button 
                onClick={() => window.location.href = '/teste-conexao'}
                className="w-full"
              >
                🧪 Testar Conexão Após Configurar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
