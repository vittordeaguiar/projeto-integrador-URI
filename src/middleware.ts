import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rotas que NÃO precisam de autenticação
  const publicRoutes = ['/', '/login', '/novo-ticket']

  // Verificar se a rota atual é pública
  const isPublicRoute = publicRoutes.some(route =>
    req.nextUrl.pathname === route ||
    req.nextUrl.pathname.startsWith('/novo-ticket')
  )

  // Se não estiver autenticado e tentar acessar rota protegida
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Se estiver autenticado e tentar acessar login
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
