"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Globe, Monitor, Settings, FileText, Key } from 'lucide-react'

interface DiagnosticoInfo {
  ambiente: 'vercel' | 'netlify' | 'local' | 'outro' | 'desconhecido'
  temVariaveis: boolean
  variaveisEncontradas: string[]
  variaveisFaltando: string[]
  recomendacoes: string[]
}

export default function DiagnosticoAmbiente() {
  const [diagnostico, setDiagnostico] = useState<DiagnosticoInfo | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    executarDiagnostico()
  }, [])

  const executarDiagnostico = async () => {
    setCarregando(true)
    
    // Simular delay para mostrar loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Detectar ambiente
    let ambiente: DiagnosticoInfo['ambiente'] = 'desconhecido'
    
    // Verificar se está no browser (client-side)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      
      if (hostname.includes('vercel.app') || hostname.includes('.vercel.app')) {
        ambiente = 'vercel'
      } else if (hostname.includes('netlify.app') || hostname.includes('.netlify.app')) {
        ambiente = 'netlify'
      } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        ambiente = 'local'
      } else if (hostname.includes('railway.app') || hostname.includes('render.com') || hostname.includes('herokuapp.com')) {
        ambiente = 'outro'
      }
    }
    
    // Verificar variáveis de ambiente
    const variaveisSupabase = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]
    
    const variaveisEncontradas: string[] = []
    const variaveisFaltando: string[] = []
    
    variaveisSupabase.forEach(varName => {
      // @ts-ignore - acessar process.env dinamicamente
      if (process.env[varName]) {
        variaveisEncontradas.push(varName)
      } else {
        variaveisFaltando.push(varName)
      }
    })
    
    const temVariaveis = variaveisFaltando.length === 0
    
    // Gerar recomendações
    const recomendacoes: string[] = []
    
    if (ambiente === 'local' && !temVariaveis) {
      recomendacoes.push('Crie um arquivo .env.local na raiz do projeto')
      recomendacoes.push('Adicione suas credenciais do Supabase no arquivo')
      recomendacoes.push('Reinicie o servidor de desenvolvimento (npm run dev)')
    } else if ((ambiente === 'vercel' || ambiente === 'netlify') && !temVariaveis) {
      recomendacoes.push('Configure as variáveis no painel do seu provedor')
      recomendacoes.push('Vercel: Settings → Environment Variables')
      recomendacoes.push('Netlify: Site Settings → Environment Variables')
      recomendacoes.push('Faça um novo deploy após configurar')
    } else if (temVariaveis) {
      recomendacoes.push('Configuração está correta!')
      recomendacoes.push('Execute o teste de conexão para verificar se funciona')
    }
    
    setDiagnostico({
      ambiente,
      temVariaveis,
      variaveisEncontradas,
      variaveisFaltando,
      recomendacoes
    })
    
    setCarregando(false)
  }

  const getAmbienteInfo = (ambiente: DiagnosticoInfo['ambiente']) => {
    switch (ambiente) {
      case 'vercel':
        return { icon: <Globe className="h-5 w-5" />, label: '🌐 Vercel (Deploy Online)', color: 'bg-blue-100 text-blue-800' }
      case 'netlify':
        return { icon: <Globe className="h-5 w-5" />, label: '🌐 Netlify (Deploy Online)', color: 'bg-green-100 text-green-800' }
      case 'local':
        return { icon: <Monitor className="h-5 w-5" />, label: '💻 Local (Localhost)', color: 'bg-gray-100 text-gray-800' }
      case 'outro':
        return { icon: <Settings className="h-5 w-5" />, label: '🔧 Outro Serviço', color: 'bg-purple-100 text-purple-800' }
      default:
        return { icon: <Settings className="h-5 w-5" />, label: '❓ Desconhecido', color: 'bg-yellow-100 text-yellow-800' }
    }
  }

  if (carregando) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Diagnosticando ambiente...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!diagnostico) return null

  const ambienteInfo = getAmbienteInfo(diagnostico.ambiente)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Diagnóstico do Ambiente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PASSO 1: Onde está rodando */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              📍 PASSO 1: Onde está rodando
            </h3>
            <div className="flex items-center gap-3">
              {ambienteInfo.icon}
              <Badge className={ambienteInfo.color}>
                {ambienteInfo.label}
              </Badge>
            </div>
          </div>

          {/* PASSO 2: Variáveis de ambiente */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              🔑 PASSO 2: Variáveis de ambiente
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Variáveis encontradas */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-700 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Configuradas ({diagnostico.variaveisEncontradas.length})
                </h4>
                {diagnostico.variaveisEncontradas.length > 0 ? (
                  <div className="space-y-1">
                    {diagnostico.variaveisEncontradas.map(varName => (
                      <div key={varName} className="text-sm bg-green-50 p-2 rounded border">
                        ✅ {varName}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma variável configurada</p>
                )}
              </div>

              {/* Variáveis faltando */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-700 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Faltando ({diagnostico.variaveisFaltando.length})
                </h4>
                {diagnostico.variaveisFaltando.length > 0 ? (
                  <div className="space-y-1">
                    {diagnostico.variaveisFaltando.map(varName => (
                      <div key={varName} className="text-sm bg-red-50 p-2 rounded border">
                        ❌ {varName}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-green-600">Todas as variáveis estão configuradas!</p>
                )}
              </div>
            </div>
          </div>

          {/* Status geral */}
          <Alert className={diagnostico.temVariaveis ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className="flex items-center gap-2">
              {diagnostico.temVariaveis ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-800">Configuração completa! Supabase está pronto para uso.</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-800">Configuração incompleta. Variáveis do Supabase estão faltando.</span>
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Recomendações */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              💡 Próximos passos
            </h3>
            <div className="space-y-2">
              {diagnostico.recomendacoes.map((recomendacao, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 font-bold">{index + 1}.</span>
                  <span>{recomendacao}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={executarDiagnostico} variant="outline">
              🔄 Executar Novamente
            </Button>
            
            {diagnostico.temVariaveis && (
              <Button onClick={() => window.location.href = '/teste-conexao'}>
                🧪 Testar Conexão
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exemplo de arquivo .env.local */}
      {diagnostico.ambiente === 'local' && !diagnostico.temVariaveis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Exemplo de arquivo .env.local
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
              <div className="text-gray-500"># Arquivo: .env.local</div>
              <div className="text-gray-500"># Coloque na raiz do projeto (mesmo nível do package.json)</div>
              <br />
              <div>NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co</div>
              <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui</div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Substitua os valores pelas suas credenciais reais do Supabase.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
