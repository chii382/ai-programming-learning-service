import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin-auth';
import clientPromise from '@/lib/mongo-client';
import { ObjectId } from 'mongodb';

// PUT: ユーザー権限の一括更新
export async function PUT(request: NextRequest) {
  try {
    // 管理者権限チェック
    const authResult = await checkAdminAuth();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const { changes } = body;

    // バリデーション
    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      return NextResponse.json(
        { error: '変更内容が必要です' },
        { status: 400 }
      );
    }

    // 各変更を検証
    for (const change of changes) {
      if (!change.userId || !change.role) {
        return NextResponse.json(
          { error: 'ユーザーIDとロールが必要です' },
          { status: 400 }
        );
      }

      if (change.role !== 'user' && change.role !== 'admin') {
        return NextResponse.json(
          { error: '無効なロールです' },
          { status: 400 }
        );
      }
    }

    const client = await clientPromise;
    const db = client.db();
    
    // 現在のログインユーザーIDを取得
    const currentUserId = authResult.user?.id;
    
    // 現在の管理者数を取得
    const adminCount = await db.collection('users').countDocuments({ role: 'admin' });

    // 一括更新を実行（権限変更後、該当ユーザーのセッションを無効化）
    const updatePromises = changes.map(async (change: { userId: string; role: string }) => {
      // 自分自身の権限変更を防ぐ
      if (change.userId === currentUserId) {
        return {
          userId: change.userId,
          success: false,
          modified: false,
          error: '自分自身の権限は変更できません',
        };
      }
      
      // 変更前のユーザー情報を取得
      const userBefore = await db.collection('users').findOne({ _id: new ObjectId(change.userId) });
      
      if (!userBefore) {
        return {
          userId: change.userId,
          success: false,
          modified: false,
          error: 'ユーザーが見つかりませんでした',
        };
      }
      
      // 最後の管理者をuserに変更しようとしている場合を防ぐ
      if (userBefore.role === 'admin' && change.role === 'user' && adminCount === 1) {
        return {
          userId: change.userId,
          success: false,
          modified: false,
          error: '最後の管理者の権限は変更できません',
        };
      }
      
      try {
        
        const result = await db.collection('users').updateOne(
          { _id: new ObjectId(change.userId) },
          { $set: { role: change.role, updatedAt: new Date() } }
        );
        
        // 更新後の確認
        const userAfter = await db.collection('users').findOne({ _id: new ObjectId(change.userId) });
        
        // 権限が変更された場合、該当ユーザーのセッションを無効化（強制的に再ログインを促す）
        if (result.modifiedCount > 0 && userBefore?.role !== change.role) {
          try {
            // 該当ユーザーのセッションを全て削除
            const deleteSessionsResult = await db.collection('sessions').deleteMany({
              userId: change.userId,
            });
            console.log(`🔄 セッション無効化: ${userBefore?.email}, 削除セッション数: ${deleteSessionsResult.deletedCount}`);
          } catch (sessionError) {
            console.error(`⚠️ セッション削除エラー:`, sessionError);
            // セッション削除に失敗しても、ユーザー更新は成功しているので続行
          }
        }
        
        console.log(`✅ ユーザー権限更新:`, {
          userId: change.userId,
          email: userBefore?.email,
          roleBefore: userBefore?.role,
          roleAfter: userAfter?.role,
          requestedRole: change.role,
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          success: result.matchedCount > 0 && userAfter?.role === change.role,
        });
        
        return {
          userId: change.userId,
          email: userBefore?.email,
          success: result.matchedCount > 0 && userAfter?.role === change.role,
          modified: result.modifiedCount > 0,
          roleBefore: userBefore?.role,
          roleAfter: userAfter?.role,
        };
      } catch (error) {
        console.error(`❌ ユーザー権限更新エラー:`, {
          userId: change.userId,
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          userId: change.userId,
          success: false,
          modified: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    const results = await Promise.all(updatePromises);

    // 更新結果を確認
    const failedUpdates = results.filter((r) => !r.success);
    const successfulUpdates = results.filter((r) => r.success);
    
    console.log(`📊 一括更新結果:`, {
      total: results.length,
      success: successfulUpdates.length,
      failed: failedUpdates.length,
      details: results,
    });
    
    if (failedUpdates.length > 0) {
      console.error(`❌ 更新失敗詳細:`, failedUpdates);
      return NextResponse.json(
        {
          error: `${failedUpdates.length}件の更新に失敗しました`,
          failedUpdates: failedUpdates.map((r) => ({
            userId: r.userId,
            email: (r as any).email,
            error: (r as any).error,
          })),
          successfulUpdates: successfulUpdates.length,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updatedCount: results.length,
      results: results.map((r) => ({
        userId: r.userId,
        email: (r as any).email,
        roleBefore: (r as any).roleBefore,
        roleAfter: (r as any).roleAfter,
        success: r.success,
      })),
    });
  } catch (error) {
    console.error('ユーザー権限一括更新エラー:', error);
    return NextResponse.json(
      { error: 'ユーザー権限の一括更新に失敗しました' },
      { status: 500 }
    );
  }
}
