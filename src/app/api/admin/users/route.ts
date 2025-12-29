import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin-auth';
import clientPromise from '@/lib/mongo-client';
import { ObjectId } from 'mongodb';

// GET: ユーザー一覧取得
export async function GET(request: NextRequest) {
  try {
    // 管理者権限チェック
    const authResult = await checkAdminAuth();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const client = await clientPromise;
    const db = client.db();

    // クエリパラメータを取得
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 検索条件を構築
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // ソート条件を構築
    const sort: any = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;

    // 総件数を取得
    const total = await db.collection('users').countDocuments(query);

    // ユーザー一覧を取得
    const users = await db
      .collection('users')
      .find(query)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return NextResponse.json({
      users: users.map((user: any) => {
        // createdAtとupdatedAtを適切に処理
        // MongoDBから取得した日付はDateオブジェクトまたはISODateオブジェクトの可能性がある
        let createdAt: string;
        let updatedAt: string;
        
        try {
          if (user.createdAt) {
            createdAt = user.createdAt instanceof Date 
              ? user.createdAt.toISOString() 
              : new Date(user.createdAt).toISOString();
          } else {
            // createdAtが存在しない場合は、_idからタイムスタンプを推定（MongoDBのObjectIdには作成時刻が含まれる）
            const userId = user._id instanceof ObjectId ? user._id : new ObjectId(user._id);
            createdAt = userId.getTimestamp().toISOString();
            console.warn(`ユーザー ${user.email} のcreatedAtが存在しないため、_idから推定: ${createdAt}`);
          }
        } catch (error) {
          console.error(`createdAt処理エラー (${user.email}):`, error);
          createdAt = new Date().toISOString();
        }
        
        try {
          if (user.updatedAt) {
            updatedAt = user.updatedAt instanceof Date 
              ? user.updatedAt.toISOString() 
              : new Date(user.updatedAt).toISOString();
          } else {
            // updatedAtが存在しない場合はcreatedAtと同じにする
            updatedAt = createdAt;
            console.warn(`ユーザー ${user.email} のupdatedAtが存在しないため、createdAtを使用: ${updatedAt}`);
          }
        } catch (error) {
          console.error(`updatedAt処理エラー (${user.email}):`, error);
          updatedAt = createdAt || new Date().toISOString();
        }
        
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          image: user.image || null,
          createdAt,
          updatedAt,
        };
      }),
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('ユーザー一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'ユーザー一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// PATCH: ユーザー権限変更
export async function PATCH(request: NextRequest) {
  try {
    // 管理者権限チェック
    const authResult = await checkAdminAuth();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const { userId, role } = body;

    // バリデーション
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'ユーザーIDとロールが必要です' },
        { status: 400 }
      );
    }

    if (role !== 'user' && role !== 'admin') {
      return NextResponse.json(
        { error: '無効なロールです' },
        { status: 400 }
      );
    }

    // 自分自身の権限変更を防ぐ
    const currentUserId = authResult.user?.id;
    if (currentUserId && currentUserId === userId) {
      return NextResponse.json(
        { error: '自分自身の権限は変更できません' },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // ユーザーのロールを更新
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりませんでした' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ユーザー権限変更エラー:', error);
    return NextResponse.json(
      { error: 'ユーザー権限の変更に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: ユーザー削除
export async function DELETE(request: NextRequest) {
  try {
    // 管理者権限チェック
    const authResult = await checkAdminAuth();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const { userId } = body;

    // バリデーション
    if (!userId) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    // 自分自身の削除を防ぐ
    const currentUserId = authResult.user?.id;
    if (currentUserId && currentUserId === userId) {
      return NextResponse.json(
        { error: '自分自身は削除できません' },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // ユーザーを削除
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりませんでした' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('ユーザー削除エラー:', error);
    return NextResponse.json(
      { error: 'ユーザーの削除に失敗しました' },
      { status: 500 }
    );
  }
}
