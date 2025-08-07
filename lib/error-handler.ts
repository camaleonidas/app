// Sistema centralizado de tratamento de erros

export enum ErrorType {
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  VALIDATION = "VALIDATION",
  DATABASE = "DATABASE",
  NETWORK = "NETWORK",
  UNKNOWN = "UNKNOWN",
}

export interface AppError {
  type: ErrorType
  message: string
  details?: string
  code?: string
}

export class AuthenticationError extends Error {
  type = ErrorType.AUTHENTICATION

  constructor(
    message: string,
    public details?: string,
  ) {
    super(message)
    this.name = "AuthenticationError"
  }
}

export class ValidationError extends Error {
  type = ErrorType.VALIDATION

  constructor(
    message: string,
    public details?: string,
  ) {
    super(message)
    this.name = "ValidationError"
  }
}

export class DatabaseError extends Error {
  type = ErrorType.DATABASE

  constructor(
    message: string,
    public details?: string,
  ) {
    super(message)
    this.name = "DatabaseError"
  }
}

export function handleSupabaseError(error: any): AppError {
  console.error("Supabase Error:", error)

  // Erros específicos do Supabase
  if (error.code === "PGRST116") {
    return {
      type: ErrorType.DATABASE,
      message: "Tabela não encontrada",
      details: error.message,
      code: error.code,
    }
  }

  if (error.code === "23505") {
    return {
      type: ErrorType.VALIDATION,
      message: "Este email já está em uso",
      details: error.message,
      code: error.code,
    }
  }

  if (error.message?.includes("JWT")) {
    return {
      type: ErrorType.AUTHENTICATION,
      message: "Sessão expirada. Faça login novamente.",
      details: error.message,
    }
  }

  return {
    type: ErrorType.DATABASE,
    message: "Erro no banco de dados",
    details: error.message,
  }
}

export function getErrorMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.AUTHENTICATION:
      return error.message || "Erro de autenticação"
    case ErrorType.VALIDATION:
      return error.message || "Dados inválidos"
    case ErrorType.DATABASE:
      return "Erro interno. Tente novamente."
    case ErrorType.NETWORK:
      return "Erro de conexão. Verifique sua internet."
    default:
      return "Erro inesperado. Tente novamente."
  }
}
