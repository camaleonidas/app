"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

interface TesteResultado {
  nome: string
  status: 'sucesso' | 'erro' | 'aviso' | 'carregando'
  mensagem: string
  detalhes?: string
}

export default function TesteConexaoVisual() {
  const [testes, setTestes] = useState<TesteResultado[]>([])
  const [testando, setTestando] = useState(false)

  const executarTestes = async () => {
    setTestando(true)
    setTestes([])

    // TESTE 1 - Variáveis de ambiente
    adicionarTeste({
      nome: "Variáveis de Ambiente",
      status: "carregando",
      mensagem: "Verificando configuração..."
    })

    await delay(500)

    const temUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const temKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    atualizarTeste(0, {
      nome: "Variáveis de Ambiente",
      status: temUrl && temKey ? "sucesso" : "erro",
      mensagem: temUrl && temKey ? "Configuração OK" : "Variáveis não configuradas",
      detalhes: `URL: ${temUrl ? "✓" : "✗"} | Key: ${temKey ? "✓" : "✗"}`
    })

    if (!temUrl || !temKey) {
      setTestando(false)
      return
    }

    // TESTE 2 - Ping Supabase
    adicionarTeste({
      nome: "Conexão Supabase",
      status: "carregando",
      mensagem: "Testando conexão..."
    })

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/', {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        }
      })

      atualizarTeste(1, {
        nome: "Conexão Supabase",
        status: response.ok ? "sucesso" : "erro",
        mensagem: response.ok ? "Conexão estabelecida" : "Falha na conexão",
        detalhes: `Status: ${response.status}`
      })

      if (!response.ok) {
        setTestando(false)
        return
      }

    } catch (error) {
      atualizarTeste(1, {
        nome: "Conexão Supabase",
        status: "erro",
        mensagem: "Erro de rede",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido"
      })
      setTestando(false)
      return
    }

    // TESTE 3 - Tabelas
    const tabelas = ['usuarios', 'agendamentos', 'configuracoes_mentor']
    
    for (let i = 0; i < tabelas.length; i++) {
      const tabela = tabelas[i]
      
      adicionarTeste({
        nome: `Tabela ${tabela}`,
        status: "carregando",
        mensagem: "Verificando acesso..."
      })

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${tabela}?select=*&limit=1`,
          {
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          atualizarTeste(2 + i, {
            nome: `Tabela ${tabela}`,
            status: "sucesso",
            mensagem: "Acesso OK",
            detalhes: `${data.length} registros encontrados`
          })
        } else {
          atualizarTeste(2 + i, {
            nome: `Tabela ${tabela}`,
            status: "erro",
            mensagem: "Erro de acesso",
            detalhes: `Status: ${response.status}`
          })
        }
      } catch (error) {
        atualizarTeste(2 + i, {
          nome: `Tabela ${tabela}`,
          status: "erro",
          mensagem: "Erro na consulta",
          detalhes: error instanceof Error ? error.message : "Erro desconhecido"
        })
      }

      await delay(300)
    }

    // TESTE 4 - Cliente Supabase
    adicionarTeste({
      nome: "Cliente Supabase",
      status: "carregando",
      mensagem: "Testando SDK..."
    })

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error } = await supabase
        .from('usuarios')
        .select('nome, email, tipo')
        .limit(1)

      atualizarTeste(5, {
        nome: "Cliente Supabase",
        status: error ? "erro" : "sucesso",
        mensagem: error ? "Erro no SDK" : "SDK funcionando",
        detalhes: error ? error.message : `${data?.length || 0} usuários encontrados`
      })

    } catch (error) {
      atualizarTeste(5, {
        nome: "Cliente Supabase",
        status: "erro",
        mensagem: "Erro ao carregar SDK",
        detalhes: error instanceof Error ? error.message : "Erro desconhecido"
      })
    }

    setTestando(false)
  }

  const adicionarTeste = (teste: TesteResultado) => {
    setTestes(prev => [...prev, teste])
  }

  const atualizarTeste = (index: number, teste: TesteResultado) => {
    setTestes(prev => prev.map((t, i) => i === index ? teste : t))
  }

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const getIcon = (status: TesteResultado['status']) => {
    switch (status) {
      case 'sucesso': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'erro': return <XCircle className="h-5 w-5 text-red-500" />
      case 'aviso': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'carregando': return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const getStatusColor = (status: TesteResultado['status']) => {
    switch (status) {
      case 'sucesso': return 'bg-green-100 text-green-800'
      case 'erro': return 'bg-red-100 text-red-800'
      case 'aviso': return 'bg-yellow-100 text-yellow-800'
      case 'carregando': return 'bg-blue-100 text-blue-800'
    }
  }

  useEffect(() => {
    executarTestes()
  }, [])

  const todosOk = testes.length > 0 && testes.every(t => t.status === 'sucesso')
  const temErros = testes.some(t => t.status === 'erro')

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Teste de Conexão Supabase
            {testando && <Loader2 className="h-5 w-5 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={executarTestes} 
              disabled={testando}
              variant="outline"
            >
              {testando ? "Testando..." : "Executar Testes"}
            </Button>
            
            {!testando && (
              <Badge variant={todosOk ? "default" : temErros ? "destructive" : "secondary"}>
                {todosOk ? "Tudo OK!" : temErros ? "Problemas encontrados" : "Aguardando..."}
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            {testes.map((teste, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                {getIcon(teste.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{teste.nome}</span>
                    <Badge variant="outline" className={getStatusColor(teste.status)}>
                      {teste.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{teste.mensagem}</p>
                  {teste.detalhes && (
                    <p className="text-xs text-gray-500 mt-1">{teste.detalhes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!testando && todosOk && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🎉 Conexão Perfeita!</h3>
              <p className="text-green-700">
                Todos os testes passaram! Seu Supabase está configurado corretamente e pronto para uso.
              </p>
            </div>
          )}

          {!testando && temErros && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2">❌ Problemas Encontrados</h3>
              <p className="text-red-700">
                Alguns testes falharam. Verifique as configurações do Supabase e as variáveis de ambiente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
