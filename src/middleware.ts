import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 保護対象のパス
  const protectedPaths = ['/dashboard'];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // 管理者専用パス
  const adminPaths = ['/admin'];
  const isAdminPath = adminPaths.some((path) =>
    pathname.startsWith(path)
  );

  // 管理者専用パスの場合
  if (isAdminPath) {
    // セッションクッキーを確認（Edge Runtime互換）
    const sessionToken = request.cookies.get('authjs.session-token')?.value ||
                        request.cookies.get('__Secure-authjs.session-token')?.value;

    // セッションがない場合、ログイン画面にリダイレクト
    if (!sessionToken) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // 管理者権限チェックはページレベルで行う
    // （Edge RuntimeではMongoDBアダプターが使用できないため）
    // ここではセッションの存在のみを確認し、権限チェックは各ページで行う
  }

  // 保護対象のパスの場合のみ認証チェック
  if (isProtectedPath) {
    // セッションクッキーを確認
    const sessionToken = request.cookies.get('authjs.session-token')?.value ||
                        request.cookies.get('__Secure-authjs.session-token')?.value;

    // セッションがない場合、ログイン画面にリダイレクト
    if (!sessionToken) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};




