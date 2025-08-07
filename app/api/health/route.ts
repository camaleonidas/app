import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Verificar conexão com Supabase
    const { data, error } = await supabase
      .from('usuarios')
      .select('count')
      .single()

    if (error) {
      logger.error('Erro na verificação de saúde do Supabase', error)
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Database connection failed',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      )
    }

    // Verificar outros serviços essenciais aqui
    // ...

    return NextResponse.json(
      {
        status: 'healthy',
        services: {
          database: 'up',
          api: 'up',
        },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (error) {
    logger.error('Erro crítico no health check', error as Error)
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Critical service error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
