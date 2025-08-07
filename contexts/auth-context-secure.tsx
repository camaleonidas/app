"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { autenticarUsuario } from "@/lib/supabase-service-secure"
import { checkRateLimit, resetRateLimit, isValidEmail } from "@/lib/auth-utils"
import { isSupabaseConfigured } from "@/lib/supabase"
import type { Usuario } from "@/lib/supabase-service-secure"

interface AuthContextType {
  user: Usuario | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
  isLoggingOut: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Carregar usuário do localStorage na inicialização
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        console.log("✅ Usuário carregado:", userData.nome)
      } catch (error) {
        console.error("❌ Erro ao carregar usuário:", error)
        localStorage.removeItem("currentUser")
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    console.log("🔄 Tentando fazer login:", email)

    try {
      // Validações básicas
      if (!email || !password) {
        return { success: false, error: "Email e senha são obrigatórios" }
      }

      if (!isValidEmail(email)) {
        return { success: false, error: "Email inválido" }
      }

      // Rate limiting
      const rateCheck = checkRateLimit(email)
      if (!rateCheck.allowed) {
        return {
          success: false,
          error: `Muitas tentativas. Tente novamente em ${rateCheck.remainingTime} segundos.`,
        }
      }

      // Tentar autenticar com Supabase
      if (isSupabaseConfigured) {
        const { user: foundUser, error } = await autenticarUsuario(email, password)

        if (error) {
          return { success: false, error }
        }

        if (foundUser) {
          setUser(foundUser)
          localStorage.setItem("currentUser", JSON.stringify(foundUser))
          resetRateLimit(email) // Reset rate limit em login bem-sucedido
          console.log("✅ Login realizado com segurança:", foundUser.nome)
          return { success: true }
        }
      }

      return { success: false, error: "Email ou senha incorretos" }
    } catch (error) {
      console.error("❌ Erro no login:", error)
      return { success: false, error: "Erro interno. Tente novamente." }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log("🚪 Iniciando logout seguro...")
    setIsLoggingOut(true)

    // Limpar estado imediatamente
    setUser(null)
    localStorage.removeItem("currentUser")

    // Feedback visual
    setTimeout(() => {
      setIsLoggingOut(false)
      console.log("✅ Logout seguro concluído")
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
