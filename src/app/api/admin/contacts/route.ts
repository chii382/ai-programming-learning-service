import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin-auth';
import clientPromise from '@/lib/mongo-client';
import { ObjectId } from 'mongodb';

// GET: お問い合わせ一覧取得
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
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    // ソート条件を構築
    const sort: any = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;

    // 総件数を取得
    const total = await db.collection('contacts').countDocuments(query);

    // お問い合わせ一覧を取得
    const contacts = await db
      .collection('contacts')
      .find(query)
      .sort(sort)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return NextResponse.json({
      contacts: contacts.map((contact) => ({
        id: contact._id.toString(),
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        createdAt: contact.createdAt,
      })),
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('お問い合わせ一覧取得エラー:', error);
    return NextResponse.json(
      { error: 'お問い合わせ一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// DELETE: お問い合わせ削除
export async function DELETE(request: NextRequest) {
  try {
    // 管理者権限チェック
    const authResult = await checkAdminAuth();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const { contactId } = body;

    // バリデーション
    if (!contactId) {
      return NextResponse.json(
        { error: 'お問い合わせIDが必要です' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // お問い合わせを削除
    const result = await db.collection('contacts').deleteOne({ _id: new ObjectId(contactId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'お問い合わせが見つかりませんでした' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('お問い合わせ削除エラー:', error);
    return NextResponse.json(
      { error: 'お問い合わせの削除に失敗しました' },
      { status: 500 }
    );
  }
}
