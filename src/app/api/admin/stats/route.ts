import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin-auth';
import clientPromise from '@/lib/mongo-client';

export async function GET(request: NextRequest) {
  try {
    // 管理者権限チェック
    const authResult = await checkAdminAuth();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const client = await clientPromise;
    const db = client.db();

    // 統計情報を取得
    const [userCount, contactCount] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('contacts').countDocuments(),
    ]);

    return NextResponse.json({
      userCount,
      contactCount,
    });
  } catch (error) {
    console.error('統計情報取得エラー:', error);
    return NextResponse.json(
      { error: '統計情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
