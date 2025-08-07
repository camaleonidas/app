import bcrypt from "bcryptjs"

// Constantes para tipos de usuário
export const USER_TYPES = {
  MENTOR: "mentor",
  ALUNO: "aluno",
} as const

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES]

// Constantes para status de agendamento
export const AGENDAMENTO_STATUS = {
  PENDENTE: "pendente",
  CONFIRMADO: "confirmado",
  RECUSADO: "recusado",
  CANCELADO: "cancelado",
} as const

export type AgendamentoStatus = (typeof AGENDAMENTO_STATUS)[keyof typeof AGENDAMENTO_STATUS]

// Utilitários de hash de senha
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Validação de email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validação de senha forte
export function isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push("Senha deve ter pelo menos 8 caracteres")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Senha deve conter pelo menos uma letra maiúscula")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Senha deve conter pelo menos uma letra minúscula")
  }

  if (!/\d/.test(password)) {
    errors.push("Senha deve conter pelo menos um número")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Rate limiting simples (em produção usar Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function checkRateLimit(email: string): { allowed: boolean; remainingTime?: number } {
  const now = Date.now()
  const attempts = loginAttempts.get(email)

  if (!attempts) {
    loginAttempts.set(email, { count: 1, lastAttempt: now })
    return { allowed: true }
  }

  // Reset após 15 minutos
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(email, { count: 1, lastAttempt: now })
    return { allowed: true }
  }

  // Máximo 5 tentativas
  if (attempts.count >= 5) {
    const remainingTime = Math.ceil((15 * 60 * 1000 - (now - attempts.lastAttempt)) / 1000)
    return { allowed: false, remainingTime }
  }

  attempts.count++
  attempts.lastAttempt = now
  return { allowed: true }
}

export function resetRateLimit(email: string): void {
  loginAttempts.delete(email)
}
