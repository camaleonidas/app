"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Settings, Calendar, Users, Loader2, ChevronDown } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"

interface HeaderProps {
  onNavigate?: (page: string) => void
  currentPage?: string
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const { user, logout, isLoggingOut } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  if (!user) return null

  const handleLogout = () => {
    console.log("🔄 Fazendo logout...")
    setShowDropdown(false)
    logout()
  }

  const toggleDropdown = () => {
    if (!isLoggingOut) {
      setShowDropdown(!showDropdown)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Mentoria App</h1>

          {user.tipo === "mentor" && onNavigate && !isLoggingOut && (
            <nav className="flex gap-2">
              <Button
                variant={currentPage === "agenda" ? "default" : "ghost"}
                size="sm"
                onClick={() => onNavigate("agenda")}
                disabled={isLoggingOut}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Agenda
              </Button>
              <Button
                variant={currentPage === "usuarios" ? "default" : "ghost"}
                size="sm"
                onClick={() => onNavigate("usuarios")}
                disabled={isLoggingOut}
              >
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </Button>
              <Button
                variant={currentPage === "configuracoes" ? "default" : "ghost"}
                size="sm"
                onClick={() => onNavigate("configuracoes")}
                disabled={isLoggingOut}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </nav>
          )}
        </div>

        <div className="relative">
          <Button
            variant="outline"
            className="flex items-center gap-2 px-3 py-2"
            onClick={toggleDropdown}
            disabled={isLoggingOut}
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {isLoggingOut ? <Loader2 className="h-3 w-3 animate-spin" /> : user.nome.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{isLoggingOut ? "Saindo..." : user.nome}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {showDropdown && !isLoggingOut && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-md"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}

          {/* Overlay para fechar dropdown */}
          {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />}
        </div>
      </div>
    </header>
  )
}
