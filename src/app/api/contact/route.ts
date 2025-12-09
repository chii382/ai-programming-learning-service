import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { sendContactEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // バリデーション
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'すべての項目を入力してください' },
        { status: 400 }
      );
    }

    // メール形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    // 文字数チェック
    if (name.length > 100) {
      return NextResponse.json(
        { error: '名前は100文字以内で入力してください' },
        { status: 400 }
      );
    }

    if (email.length > 255) {
      return NextResponse.json(
        { error: 'メールアドレスは255文字以内で入力してください' },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        { error: '件名は200文字以内で入力してください' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: '本文は5000文字以内で入力してください' },
        { status: 400 }
      );
    }

    // MongoDB接続
    await connectDB();

    // データベースに保存
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    await contact.save();

    // メール送信
    try {
      await sendContactEmail(name, email, subject, message);
    } catch (emailError) {
      // メール送信が失敗してもDB保存は成功しているため、ログに記録して続行
      console.error('メール送信エラー:', emailError);
      // 本番環境では、メール送信エラーを別途処理することを推奨
    }

    return NextResponse.json(
      { message: 'お問い合わせを受け付けました' },
      { status: 200 }
    );
  } catch (error) {
    console.error('お問い合わせ処理エラー:', error);

    // Mongooseバリデーションエラー
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: '入力内容に誤りがあります' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。しばらくしてから再度お試しください。' },
      { status: 500 }
    );
  }
}
