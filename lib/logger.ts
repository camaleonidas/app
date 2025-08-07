import * as Sentry from '@sentry/nextjs'

type LogLevel = 'info' | 'warn' | 'error'
type LogData = Record<string, any>

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: LogData
  error?: Error
}

class Logger {
  private isProd = process.env.NODE_ENV === 'production'
  private isLogsEnabled = process.env.NEXT_PUBLIC_ENABLE_LOGS === 'true'
  private isMonitoringEnabled = process.env.NEXT_PUBLIC_ENABLE_MONITORING === 'true'

  constructor() {
    if (this.isProd && this.isMonitoringEnabled) {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        tracesSampleRate: 1.0,
        environment: process.env.NODE_ENV,
      })
    }
  }

  private formatLog(level: LogLevel, message: string, data?: LogData, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error,
    }
  }

  private persistLog(entry: LogEntry) {
    if (this.isProd) {
      // Em produção, enviar para serviço de logs
      if (this.isLogsEnabled) {
        console.log(JSON.stringify(entry))
      }

      // Se for erro e monitoramento estiver ativo, enviar para Sentry
      if (entry.level === 'error' && this.isMonitoringEnabled) {
        Sentry.captureException(entry.error || new Error(entry.message), {
          extra: entry.data,
        })
      }
    } else {
      // Em desenvolvimento, mostrar logs coloridos no console
      const colors = {
        info: '\x1b[36m', // Ciano
        warn: '\x1b[33m', // Amarelo
        error: '\x1b[31m', // Vermelho
      }
      
      console.log(
        `${colors[entry.level]}[${entry.level.toUpperCase()}]\x1b[0m`,
        entry.timestamp,
        entry.message,
        entry.data || '',
        entry.error || ''
      )
    }
  }

  info(message: string, data?: LogData) {
    const entry = this.formatLog('info', message, data)
    this.persistLog(entry)
  }

  warn(message: string, data?: LogData) {
    const entry = this.formatLog('warn', message, data)
    this.persistLog(entry)
  }

  error(message: string, error?: Error, data?: LogData) {
    const entry = this.formatLog('error', message, data, error)
    this.persistLog(entry)
  }

  // Métodos específicos para monitoramento de performance
  startPerformanceMonitoring(name: string) {
    if (this.isProd && this.isMonitoringEnabled) {
      const transaction = Sentry.startTransaction({
        name,
      })
      return transaction
    }
    return null
  }

  // Métodos específicos para monitoramento de usuário
  setUserContext(userData: { id: string; email: string; tipo: string }) {
    if (this.isProd && this.isMonitoringEnabled) {
      Sentry.setUser(userData)
    }
  }

  // Métodos para métricas de negócio
  logMetric(name: string, value: number, tags?: Record<string, string>) {
    if (this.isProd) {
      const entry = this.formatLog('info', 'METRIC', { name, value, tags })
      this.persistLog(entry)
    }
  }
}

// Exportar instância única
export const logger = new Logger()

// Exemplos de uso:
/*
logger.info('Usuário logado', { userId: '123', email: 'user@example.com' })
logger.warn('Rate limit próximo do limite', { current: 95, limit: 100 })
logger.error('Falha ao processar agendamento', new Error('Timeout'), { agendamentoId: '456' })

const transaction = logger.startPerformanceMonitoring('Criar Agendamento')
// ... código ...
transaction?.finish()

logger.setUserContext({ id: '123', email: 'user@example.com', tipo: 'mentor' })
logger.logMetric('agendamentos_criados', 1, { tipo: 'mentor' })
*/
