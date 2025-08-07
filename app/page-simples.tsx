"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function AppSimples() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")

  // Testar conexão ao carregar
  useEffect(() => {
    testarConexao()
  }, [])

  const testarConexao = async () => {
    try {
      console.log("🔍 Testando conexão...")
      const { data, error } = await supabase.from("usuarios").select("nome, email, tipo")

      if (error) {
        setError(`Erro: ${error.message}`)
        console.log("❌ Erro:", error)
      } else {
        setUsuarios(data || [])
        console.log("✅ Sucesso! Usuários:", data)
      }
    } catch (err) {
      setError(`Erro crítico: ${err.message}`)
      console.log("❌ Erro crítico:", err)
    } finally {
      setLoading(false)
    }
  }

  const testarLogin = async () => {
    try {
      console.log("🔍 Testando login...")
      const { data, error } = await supabase.from("usuarios").select("*").eq("email", email).eq("senha", senha).limit(1)

      if (error) {
        alert(`Erro no login: ${error.message}`)
      } else if (data && data.length > 0) {
        alert(`Login OK! Bem-vindo, ${data[0].nome}`)
      } else {
        alert("Email ou senha incorretos")
      }
    } catch (err) {
      alert(`Erro: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Teste de Conexão com Supabase</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando...</p>
            ) : error ? (
              <div className="text-red-600">
                <p className="font-bold">❌ Erro encontrado:</p>
                <p>{error}</p>
              </div>
            ) : (
              <div className="text-green-600">
                <p className="font-bold">✅ Conexão funcionando!</p>
                <p>Usuários encontrados: {usuarios.length}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>👥 Usuários no Banco</CardTitle>
          </CardHeader>
          <CardContent>
            {usuarios.length === 0 ? (
              <p>Nenhum usuário encontrado</p>
            ) : (
              <div className="space-y-2">
                {usuarios.map((user, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <p className="font-medium">{user.nome}</p>
                    <p className="text-sm text-gray-600">
                      {user.email} - {user.tipo}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔐 Teste de Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mentor@email.com ou aluno@email.com"
              />
            </div>
            <div>
              <Label>Senha</Label>
              <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="123456" />
            </div>
            <Button onClick={testarLogin}>Testar Login</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔧 Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <p>URL: https://gxnrytchaznueqrrjsph.supabase.co</p>
              <p>Status: {loading ? "Carregando..." : error ? "Erro" : "OK"}</p>
              <p>Usuários: {usuarios.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
