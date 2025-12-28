import { auth } from './auth';
import { NextResponse } from 'next/server';

/**
 * 管理者権限をチェックするヘルパー関数
 * API Routeで使用
 */
export async function checkAdminAuth() {
  const session = await auth();

  // セッションがない場合
  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      ),
    };
  }

  // 管理者権限がない場合
  if (session.user.role !== 'admin') {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: session.user,
  };
}
