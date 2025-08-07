"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { Header } from "@/components/header"
import { ConfiguracoesMentor } from "@/components/configuracoes-mentor"
import { AnalisarSolicitacoes } from "@/components/analisar-solicitacoes"
import { TodosAgendamentos } from "@/components/todos-agendamentos"
import { AgendamentoAlunoCorrigido } from "@/components/agendamento-aluno-corrigido"
import { DashboardMentor } from "@/components/dashboard-mentor"
import { GerenciarUsuarios } from "@/components/gerenciar-usuarios"
import { CallsFeitas } from "@/components/calls-feitas"
import { AgendamentosAprovados } from "@/components/agendamentos-aprovados"
import { AgendamentosRecusados } from "@/components/agendamentos-recusados"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { DebugAgendamentosDetalhado } from "@/components/debug-agendamentos-detalhado"

function AppContent() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState("dashboard")

  const handleNavigate = (page: string) => {
    console.log("🔄 [NAVEGAÇÃO] Mudando para página:", page)
    setCurrentPage(page)
  }

  const renderContent = () => {
    if (user?.tipo === "mentor") {
      switch (currentPage) {
        case "usuarios":
          return (
            <div className="space-y-6">
              <GerenciarUsuarios />
              <DebugAgendamentosDetalhado />
            </div>
          )
        case "configuracoes":
          return (
            <div className="space-y-6">
              <ConfiguracoesMentor />
              <DebugAgendamentosDetalhado />
            </div>
          )
        case "solicitacoes":
          return (
            <div className="space-y-6">
              <AnalisarSolicitacoes onVoltar={() => setCurrentPage("dashboard")} />
              <DebugAgendamentosDetalhado />
            </div>
          )
        case "todos-agendamentos":
          return <TodosAgendamentos onNavigate={handleNavigate} />
        case "calls-feitas":
          return <CallsFeitas onVoltar={() => setCurrentPage("dashboard")} />
        case "agendamentos-aprovados":
          return <AgendamentosAprovados onVoltar={() => setCurrentPage("dashboard")} />
        case "agendamentos-recusados":
          return <AgendamentosRecusados onVoltar={() => setCurrentPage("dashboard")} />
        case "agenda":
        default:
          return (
            <div className="space-y-6">
              <DashboardMentor onNavigate={handleNavigate} />
              <DebugAgendamentosDetalhado />
            </div>
          )
      }
    } else {
      return (
        <div className="space-y-6">
          <AgendamentoAlunoCorrigido />
          <DebugAgendamentosDetalhado />
        </div>
      )
    }
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      <main className="max-w-6xl mx-auto p-6">{renderContent()}</main>
    </div>
  )
}

export default function MentoriaApp() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
