"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, UserPlus, Edit, Trash2, Eye, EyeOff, Save, AlertTriangle, Search } from 'lucide-react'
import { supabase } from "@/lib/supabase-only"

interface Usuario {
  id: string
  nome: string
  email: string
  senha: string
  tipo: "mentor" | "aluno"
  telefone?: string
  created_at: string
  updated_at?: string
}

export function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "mentor" | "aluno">("todos")
  const [filtroStatus, setFiltroStatus] = useState<"todos" | "ativo" | "inativo">("todos")
  const [busca, setBusca] = useState("")
  const [modalAberto, setModalAberto] = useState(false)
  const [modalTipo, setModalTipo] = useState<"criar" | "editar">("criar")
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null)
  const [mostrarSenhas, setMostrarSenhas] = useState<{ [key: string]: boolean }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo: "aluno" as "mentor" | "aluno",
    telefone: "",
  })

  // Carregar usuários do Supabase
  useEffect(() => {
    carregarUsuarios()
  }, [])

  const carregarUsuarios = async () => {
    console.log("🔍 [USUARIOS] Carregando usuários do Supabase...")
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [USUARIOS] Erro ao carregar:', error)
        alert('❌ Erro ao carregar usuários do banco de dados')
        
        // Se não conseguir carregar do Supabase, criar usuários padrão
        await criarUsuariosPadrao()
      } else {
        console.log('✅ [USUARIOS] Carregados do Supabase:', data?.length || 0)
        setUsuarios(data || [])
        
        // Se não há usuários, criar os padrão
        if (!data || data.length === 0) {
          await criarUsuariosPadrao()
        }
      }
    } catch (error) {
      console.error('❌ [USUARIOS] Erro crítico:', error)
      alert('❌ Erro crítico ao conectar com o banco')
    } finally {
      setIsLoading(false)
    }
  }

  const criarUsuariosPadrao = async () => {
    console.log("📝 [USUARIOS] Criando usuários padrão no Supabase...")

    const usuariosPadrao = [
      {
        nome: "João Mentor Silva",
        email: "mentor@email.com",
        senha: "123456",
        tipo: "mentor" as const,
        telefone: "(11) 99999-1234",
      },
      {
        nome: "Maria Aluna Santos",
        email: "aluno@email.com",
        senha: "123456",
        tipo: "aluno" as const,
        telefone: "(11) 99999-5678",
      },
      {
        nome: "Pedro Aluno Costa",
        email: "pedro@email.com",
        senha: "123456",
        tipo: "aluno" as const,
        telefone: "(11) 99999-9999",
      },
    ]

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert(usuariosPadrao)
        .select()

      if (error) {
        console.error('❌ [USUARIOS] Erro ao criar padrão:', error)
      } else {
        console.log('✅ [USUARIOS] Usuários padrão criados:', data?.length)
        setUsuarios(data || [])
      }
    } catch (error) {
      console.error('❌ [USUARIOS] Erro crítico ao criar padrão:', error)
    }
  }

  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      alert("❌ Nome é obrigatório")
      return false
    }
    if (!formData.email.trim()) {
      alert("❌ Email é obrigatório")
      return false
    }
    if (!formData.senha.trim()) {
      alert("❌ Senha é obrigatória")
      return false
    }
    if (formData.senha.length < 6) {
      alert("❌ Senha deve ter pelo menos 6 caracteres")
      return false
    }

    // Verificar email duplicado
    const emailExiste = usuarios.some(
      (user) => user.email.toLowerCase() === formData.email.toLowerCase() && user.id !== usuarioEditando?.id,
    )
    if (emailExiste) {
      alert("❌ Este email já está em uso")
      return false
    }

    return true
  }

  const criarUsuario = async () => {
    if (!validarFormulario()) return

    setIsLoading(true)
    console.log("🔄 [USUARIOS] Criando usuário no Supabase...")

    try {
      const novoUsuario = {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha,
        tipo: formData.tipo,
        telefone: formData.telefone.trim() || null,
      }

      const { data, error } = await supabase
        .from('usuarios')
        .insert([novoUsuario])
        .select()
        .single()

      if (error) {
        console.error("❌ [USUARIOS] Erro ao criar:", error)
        alert(`❌ Erro ao criar usuário: ${error.message}`)
        return
      }

      console.log("✅ [USUARIOS] Usuário criado no Supabase:", data)
      
      // Atualizar lista local
      setUsuarios(prev => [data, ...prev])
      
      alert("✅ Usuário criado com sucesso no banco de dados!")
      fecharModal()

    } catch (error) {
      console.error("❌ [USUARIOS] Erro crítico:", error)
      alert("❌ Erro crítico ao criar usuário")
    } finally {
      setIsLoading(false)
    }
  }

  const editarUsuario = async () => {
    if (!validarFormulario() || !usuarioEditando) return

    setIsLoading(true)
    console.log("🔄 [USUARIOS] Editando usuário no Supabase...")

    try {
      const dadosAtualizados = {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha,
        tipo: formData.tipo,
        telefone: formData.telefone.trim() || null,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('usuarios')
        .update(dadosAtualizados)
        .eq('id', usuarioEditando.id)
        .select()
        .single()

      if (error) {
        console.error("❌ [USUARIOS] Erro ao editar:", error)
        alert(`❌ Erro ao editar usuário: ${error.message}`)
        return
      }

      console.log("✅ [USUARIOS] Usuário editado no Supabase:", data)
      
      // Atualizar lista local
      setUsuarios(prev => prev.map(user => user.id === usuarioEditando.id ? data : user))
      
      alert("✅ Usuário atualizado com sucesso!")
      fecharModal()

    } catch (error) {
      console.error("❌ [USUARIOS] Erro crítico:", error)
      alert("❌ Erro crítico ao editar usuário")
    } finally {
      setIsLoading(false)
    }
  }

  const excluirUsuario = async (id: string) => {
    const usuario = usuarios.find((u) => u.id === id)
    if (!usuario) return

    // Não permitir excluir o usuário mentor principal
    if (usuario.email === "mentor@email.com") {
      alert("❌ Não é possível excluir o usuário mentor principal")
      return
    }

    setIsLoading(true)
    console.log("🔄 [USUARIOS] Excluindo usuário do Supabase...")

    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id)

      if (error) {
        console.error("❌ [USUARIOS] Erro ao excluir:", error)
        alert(`❌ Erro ao excluir usuário: ${error.message}`)
        return
      }

      console.log("✅ [USUARIOS] Usuário excluído do Supabase:", id)
      
      // Atualizar lista local
      setUsuarios(prev => prev.filter(user => user.id !== id))
      
      alert("✅ Usuário excluído com sucesso!")
      setConfirmacaoExclusao(null)

    } catch (error) {
      console.error("❌ [USUARIOS] Erro crítico:", error)
      alert("❌ Erro crítico ao excluir usuário")
    } finally {
      setIsLoading(false)
    }
  }

  const abrirModalCriar = () => {
    setModalTipo("criar")
    setUsuarioEditando(null)
    setFormData({
      nome: "",
      email: "",
      senha: "",
      tipo: "aluno",
      telefone: "",
    })
    setModalAberto(true)
  }

  const abrirModalEditar = (usuario: Usuario) => {
    setModalTipo("editar")
    setUsuarioEditando(usuario)
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      tipo: usuario.tipo,
      telefone: usuario.telefone || "",
    })
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setUsuarioEditando(null)
    setFormData({
      nome: "",
      email: "",
      senha: "",
      tipo: "aluno",
      telefone: "",
    })
  }

  const toggleMostrarSenha = (userId: string) => {
    setMostrarSenhas((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  // Filtrar usuários
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchTipo = filtroTipo === "todos" || usuario.tipo === filtroTipo
    const matchBusca =
      busca === "" ||
      usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busca.toLowerCase())

    return matchTipo && matchBusca
  })

  const estatisticas = {
    total: usuarios.length,
    mentores: usuarios.filter((u) => u.tipo === "mentor").length,
    alunos: usuarios.filter((u) => u.tipo === "aluno").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
        <p className="text-gray-600">Administre todos os usuários do sistema (conectado ao Supabase)</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{estatisticas.mentores}</div>
            <div className="text-sm text-gray-600">Mentores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.alunos}</div>
            <div className="text-sm text-gray-600">Alunos</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários ({usuariosFiltrados.length})
              {isLoading && <span className="text-sm text-blue-600">Carregando...</span>}
            </span>
            <Button onClick={abrirModalCriar} disabled={isLoading}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroTipo} onValueChange={(value: any) => setFiltroTipo(value)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="mentor">Mentores</SelectItem>
                <SelectItem value="aluno">Alunos</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={carregarUsuarios} variant="outline" disabled={isLoading}>
              🔄 Atualizar
            </Button>
          </div>

          {/* Lista de Usuários */}
          <div className="space-y-4">
            {usuariosFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {isLoading ? "Carregando usuários..." : "Nenhum usuário encontrado"}
                </p>
                {!isLoading && (
                  <Button onClick={abrirModalCriar} className="mt-4">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar Primeiro Usuário
                  </Button>
                )}
              </div>
            ) : (
              usuariosFiltrados.map((usuario) => (
                <Card key={usuario.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{usuario.nome}</h3>
                          <Badge variant={usuario.tipo === "mentor" ? "default" : "secondary"}>{usuario.tipo}</Badge>
                          {usuario.email === "mentor@email.com" && (
                            <Badge variant="outline" className="text-xs">
                              Principal
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div>
                            <strong>Email:</strong> {usuario.email}
                          </div>
                          <div>
                            <strong>Senha:</strong>
                            <span className="ml-2">
                              {mostrarSenhas[usuario.id] ? usuario.senha : "••••••"}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleMostrarSenha(usuario.id)}
                                className="ml-1 h-6 w-6 p-0"
                              >
                                {mostrarSenhas[usuario.id] ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                            </span>
                          </div>
                          <div>
                            <strong>Telefone:</strong> {usuario.telefone || "Não informado"}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          <strong>ID:</strong> {usuario.id}
                        </div>
                        <div className="text-xs text-gray-500">
                          Criado em: {new Date(usuario.created_at).toLocaleDateString('pt-BR')} às {new Date(usuario.created_at).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => abrirModalEditar(usuario)} disabled={isLoading}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setConfirmacaoExclusao(usuario.id)}
                          disabled={usuario.email === "mentor@email.com" || isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Criar/Editar Usuário */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{modalTipo === "criar" ? "Criar Novo Usuário" : "Editar Usuário"}</DialogTitle>
            <DialogDescription>
              {modalTipo === "criar" ? "Preencha os dados para criar um novo usuário no Supabase" : "Modifique os dados do usuário"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="João Silva"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="joao@email.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="senha">Senha *</Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo de Usuário *</Label>
              <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aluno">Aluno</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(11) 99999-9999"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={fecharModal} className="flex-1" disabled={isLoading}>
                Cancelar
              </Button>
              <Button
                onClick={modalTipo === "criar" ? criarUsuario : editarUsuario}
                disabled={isLoading}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Salvando..." : modalTipo === "criar" ? "Criar no Supabase" : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={!!confirmacaoExclusao} onOpenChange={() => setConfirmacaoExclusao(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O usuário será permanentemente removido do Supabase.
            </DialogDescription>
          </DialogHeader>

          {confirmacaoExclusao && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Você está prestes a excluir o usuário:{" "}
                  <strong>{usuarios.find((u) => u.id === confirmacaoExclusao)?.nome}</strong>
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setConfirmacaoExclusao(null)} className="flex-1" disabled={isLoading}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => excluirUsuario(confirmacaoExclusao)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isLoading ? "Excluindo..." : "Excluir do Supabase"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
