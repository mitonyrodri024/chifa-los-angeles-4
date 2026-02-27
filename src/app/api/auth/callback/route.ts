import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Manejar errores de OAuth
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // En producción, aquí intercambiarías el código por tokens
    // con el proveedor de OAuth (Google, Facebook, etc.)
    
    // Simulación: Redirigir al home con sesión
    const response = NextResponse.redirect(new URL('/', request.url));
    
    // Set session cookie (en producción usar token real)
    response.cookies.set('session', 'oauth-demo-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });
    
    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, token } = body;

    // En producción, verificarías el token con el proveedor
    // y crearías/actualizarías el usuario en Firebase
    
    if (!provider || !token) {
      return NextResponse.json(
        { error: 'Datos de autenticación inválidos' },
        { status: 400 }
      );
    }

    // Simular autenticación exitosa
    return NextResponse.json({
      success: true,
      user: {
        id: 'oauth-user-id',
        email: 'user@example.com',
        name: 'Usuario OAuth',
        provider: provider
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en autenticación OAuth' },
      { status: 500 }
    );
  }
}