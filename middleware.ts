import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { logger } from '@/lib/logger'

const PUBLIC_ROUTES = ['/login', '/registro', '/recuperar-senha']
const API_ROUTES = ['/api']

export async function middleware(req: NextRequest) {
  try {
    // Criar cliente Supabase no middleware
    const supabase = createMiddlewareClient({ req, res: NextResponse.next() })
    
    // Verificar se é rota pública
    const isPublicRoute = PUBLIC_ROUTES.some(route => req.nextUrl.pathname.startsWith(route))
    const isApiRoute = API_ROUTES.some(route => req.nextUrl.pathname.startsWith(route))
    
    // Se for rota pública ou API, permite acesso
    if (isPublicRoute || isApiRoute) {
      return NextResponse.next()
    }
    
    // Verificar sessão
    const { data: { session } } = await supabase.auth.getSession()
    
    // Se não houver sessão, redirecionar para login
    if (!session) {
      logger.warn('Tentativa de acesso sem autenticação', {
        path: req.nextUrl.pathname,
        ip: req.ip,
      })
      
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Adicionar user-role no header para uso na aplicação
    const response = NextResponse.next()
    response.headers.set('x-user-role', session.user.user_metadata.role || 'aluno')
    
    // Log de acesso em produção
    if (process.env.NODE_ENV === 'production') {
      logger.info('Acesso autenticado', {
        userId: session.user.id,
        path: req.nextUrl.pathname,
        role: session.user.user_metadata.role,
      })
    }
    
    return response
  } catch (error) {
    logger.error('Erro no middleware de autenticação', error as Error)
    
    // Em caso de erro, redirecionar para login por segurança
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('error', 'auth_error')
    return NextResponse.redirect(redirectUrl)
  }
}

// Configurar em quais rotas o middleware será executado
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
