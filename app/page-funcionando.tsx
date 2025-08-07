"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

// Dados mock temporários (até o Supabase funcionar)
const usuariosMock = [
  { id: "1", nome: "João Mentor Silva", email: "mentor@email.com", senha: "123456", tipo: "mentor" },
  { id: "2", nome: "Maria Aluna Santos", email: "aluno@email.com", senha: "123456", tipo: "aluno" },
]

export default function AppFuncionando() {
  const [status, setStatus] = useState("Carregando...")
  const [usuarios, setUsuarios] = useState([])
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [usuarioLogado, setUsuarioLogado] = useState(null)

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setUsuarios(usuariosMock)
      setStatus("✅ App funcionando! (usando dados mock)")
    }, 1000)
  }, [])

  const fazerLogin = () => {
    const usuario = usuariosMock.find((u) => u.email === email && u.senha === senha)
    if (usuario) {
      setUsuarioLogado(usuario)
      alert(`✅ Login realizado! Bem-vindo, ${usuario.nome}`)
    } else {
      alert("❌ Email ou senha incorretos")
    }
  }

  const logout = () => {
    setUsuarioLogado(null)
    setEmail("")
    setSenha("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">🎯 Teste do App de Mentoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Badge variant={status.includes("✅") ? "default" : "secondary"}>{status}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Login */}
        {!usuarioLogado ? (
          <Card>
            <CardHeader>
              <CardTitle>🔐 Login</CardTitle>
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
              <Button onClick={fazerLogin} className="w-full">
                Entrar
              </Button>

              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="text-sm font-medium mb-2">Contas de teste:</p>
                <p className="text-sm">Mentor: mentor@email.com / 123456</p>
                <p className="text-sm">Aluno: aluno@email.com / 123456</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Dashboard do usuário logado
          <Card>
            <CardHeader>
              <CardTitle>👋 Bem-vindo, {usuarioLogado.nome}!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Badge variant="default">{usuarioLogado.tipo}</Badge>
                  <p className="text-sm text-gray-600 mt-2">{usuarioLogado.email}</p>
                </div>

                <div className="p-4 bg-green-50 rounded border border-green-200">
                  <p className="text-green-800 font-medium">✅ Login funcionando perfeitamente!</p>
                  <p className="text-green-600 text-sm mt-1">
                    O app está funcionando. Agora só precisamos conectar o Supabase.
                  </p>
                </div>

                <Button onClick={logout} variant="outline">
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Usuários disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle>👥 Usuários Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {usuarios.map((user) => (
                <div key={user.id} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                  <div>
                    <p className="font-medium">{user.nome}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <Badge variant={user.tipo === "mentor" ? "default" : "secondary"}>{user.tipo}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status da conexão */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Status da Conexão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>✅ React: Funcionando</p>
              <p>✅ Next.js: Funcionando</p>
              <p>✅ Componentes UI: Funcionando</p>
              <p>✅ Login Mock: Funcionando</p>
              <p>⏳ Supabase: Aguardando instalação</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
