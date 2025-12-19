import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 保護対象のパス
  const protectedPaths = ['/dashboard'];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // 保護対象のパスの場合のみ認証チェック
  if (isProtectedPath) {
    // セッションクッキーを確認
    const sessionToken = request.cookies.get('authjs.session-token')?.value ||
                        request.cookies.get('__Secure-authjs.session-token')?.value;

    // セッションがない場合、ログイン画面にリダイレクト
    if (!sessionToken) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};


