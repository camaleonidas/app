"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { autenticarUsuario } from "@/lib/supabase-service"
import { isSupabaseConfigured } from "@/lib/supabase"

interface User {
  id: string
  email: string
  nome: string
  tipo: "mentor" | "aluno"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isLoggingOut: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Usuários de demonstração (fallback)
const DEMO_USERS = [
  {
    id: "1",
    email: "mentor@email.com",
    password: "123456",
    nome: "Dr. João Silva",
    tipo: "mentor" as const,
  },
  {
    id: "2",
    email: "aluno@email.com",
    password: "123456",
    nome: "Maria Santos",
    tipo: "aluno" as const,
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Carregar usuário do localStorage na inicialização
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        console.log("✅ Usuário carregado do localStorage:", userData.nome)
      } catch (error) {
        console.error("❌ Erro ao carregar usuário:", error)
        localStorage.removeItem("currentUser")
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    console.log("🔄 Tentando fazer login com:", email)

    try {
      // Simular delay de autenticação
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let foundUser = null

      // Tentar autenticar com Supabase primeiro
      if (isSupabaseConfigured) {
        try {
          const tipoUsuario = email.includes("mentor") ? "mentor" : "aluno"
          foundUser = await autenticarUsuario(email, password, tipoUsuario)
        } catch (error) {
          console.warn("Erro na autenticação Supabase, usando dados locais:", error)
        }
      }

      // Fallback para usuários demo se Supabase falhar
      if (!foundUser) {
        const demoUser = DEMO_USERS.find((u) => u.email === email && u.password === password)
        if (demoUser) {
          foundUser = {
            id: demoUser.id,
            email: demoUser.email,
            nome: demoUser.nome,
            tipo: demoUser.tipo,
          }
        }
      }

      if (foundUser) {
        const userData = {
          id: foundUser.id,
          email: foundUser.email,
          nome: foundUser.nome,
          tipo: foundUser.tipo as "mentor" | "aluno",
        }

        setUser(userData)
        localStorage.setItem("currentUser", JSON.stringify(userData))
        console.log("✅ Login realizado com sucesso:", userData.nome)
        return true
      }

      console.log("❌ Credenciais inválidas")
      return false
    } catch (error) {
      console.error("❌ Erro no login:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log("🚪 Iniciando logout...")
    setIsLoggingOut(true)

    // Limpar estado imediatamente
    setUser(null)
    localStorage.removeItem("currentUser")

    // Pequeno delay para feedback visual
    setTimeout(() => {
      setIsLoggingOut(false)
      console.log("✅ Logout concluído - pronto para novo login")
    }, 800)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isLoggingOut }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
