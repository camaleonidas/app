"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, GraduationCap, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleLogin = async (tipo: "aluno" | "mentor") => {
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, senha, tipo)
      if (!success) {
        setError("Email ou senha incorretos")
      }
    } catch (err) {
      setError("Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Entrar na Plataforma</CardTitle>
          <CardDescription>Acesse sua conta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="aluno" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="aluno" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Aluno
              </TabsTrigger>
              <TabsTrigger value="mentor" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Mentor
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="aluno" className="mt-4">
                <Button
                  onClick={() => handleLogin("aluno")}
                  disabled={isLoading || !email || !senha}
                  className="w-full"
                >
                  {isLoading ? "Entrando..." : "Entrar como Aluno"}
                </Button>
              </TabsContent>

              <TabsContent value="mentor" className="mt-4">
                <Button
                  onClick={() => handleLogin("mentor")}
                  disabled={isLoading || !email || !senha}
                  className="w-full"
                >
                  {isLoading ? "Entrando..." : "Entrar como Mentor"}
                </Button>
              </TabsContent>
            </div>
          </Tabs>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium mb-2">Contas de teste:</p>
            <p>
              <strong>Mentor:</strong> mentor@email.com / 123456
            </p>
            <p>
              <strong>Aluno:</strong> aluno@email.com / 123456
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
