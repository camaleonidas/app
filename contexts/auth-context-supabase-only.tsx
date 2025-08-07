'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usuarioService, type Usuario } from '@/lib/supabase-only'

interface AuthContextType {
  usuario: Usuario | null
  login: (email: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar se há usuário logado no sessionStorage
  useEffect(() => {
    const usuarioSalvo = sessionStorage.getItem('usuario')
    if (usuarioSalvo) {
      try {
        const usuarioData = JSON.parse(usuarioSalvo)
        setUsuario(usuarioData)
      } catch (error) {
        console.error('Erro ao recuperar usuário do sessionStorage:', error)
        sessionStorage.removeItem('usuario')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const usuarioEncontrado = await usuarioService.buscarPorEmail(email)
      
      if (usuarioEncontrado) {
        setUsuario(usuarioEncontrado)
        sessionStorage.setItem('usuario', JSON.stringify(usuarioEncontrado))
        setIsLoading(false)
        return true
      } else {
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error('Erro no login:', error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUsuario(null)
    sessionStorage.removeItem('usuario')
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
