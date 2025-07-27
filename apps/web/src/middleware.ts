import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
const authPaths = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Pega tokens dos cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  
  let isAuthenticated = false;
  
  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || ''
      );
      await jwtVerify(accessToken, secret);
      isAuthenticated = true;
    } catch (error) {
      // Token expirado ou inválido
      if (refreshToken) {
        // Tenta renovar o token
        try {
          const response = await fetch(`http://localhost:3001/auth/refresh`, {
            method: 'POST',
            headers: {
              Cookie: `refreshToken=${refreshToken}`,
            },
            credentials: 'include',
          });
          
          if (response.ok) {
            // Pega os novos cookies da resposta
            const setCookieHeader = response.headers.get('set-cookie');
            if (setCookieHeader) {
              const nextResponse = NextResponse.next();
              nextResponse.headers.set('set-cookie', setCookieHeader);
              return nextResponse;
            }
            isAuthenticated = true;
          }
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }
    }
  }
  
  // Redireciona usuários não autenticados tentando acessar rotas protegidas
  if (!isAuthenticated && !publicPaths.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // Redireciona usuários autenticados tentando acessar rotas de auth
  if (isAuthenticated && authPaths.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};