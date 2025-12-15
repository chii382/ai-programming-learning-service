import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { sendContactEmail } from '@/lib/mailer';
import { promises as fs } from 'fs';
import path from 'path';

async function fallbackSaveContact(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const dir = path.join(process.cwd(), 'tmp');
  const file = path.join(dir, 'contact-submissions.jsonl');
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(
    file,
    JSON.stringify({ ...payload, createdAt: new Date().toISOString() }) + '\n',
    'utf8'
  );
  return { dir, file };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // バリデーション
    if (!name || !email || !subject || !message) {
      const fieldErrors: Record<string, string> = {};
      if (!name) fieldErrors.name = '名前を入力してください';
      if (!email) fieldErrors.email = 'メールアドレスを入力してください';
      if (!subject) fieldErrors.subject = '件名を入力してください';
      if (!message) fieldErrors.message = '本文を入力してください';

      return NextResponse.json(
        { error: '入力内容に誤りがあります', fieldErrors },
        { status: 400 }
      );
    }

    // メール形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: '有効なメールアドレスを入力してください',
          fieldErrors: { email: '有効なメールアドレスを入力してください' },
        },
        { status: 400 }
      );
    }

    // 文字数チェック
    if (name.length > 100) {
      return NextResponse.json(
        {
          error: '名前は100文字以内で入力してください',
          fieldErrors: { name: '名前は100文字以内で入力してください' },
        },
        { status: 400 }
      );
    }

    if (email.length > 255) {
      return NextResponse.json(
        {
          error: 'メールアドレスは255文字以内で入力してください',
          fieldErrors: { email: 'メールアドレスは255文字以内で入力してください' },
        },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        {
          error: '件名は200文字以内で入力してください',
          fieldErrors: { subject: '件名は200文字以内で入力してください' },
        },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        {
          error: '本文は5000文字以内で入力してください',
          fieldErrors: { message: '本文は5000文字以内で入力してください' },
        },
        { status: 400 }
      );
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    };

    let storedTo: 'mongodb' | 'file' = 'mongodb';

    // MongoDB接続＆保存（失敗したら開発環境ではファイル保存にフォールバック）
    try {
      console.log('MongoDB接続開始...');
      console.log('MONGODB_URI設定確認:', process.env.MONGODB_URI ? '設定済み' : '未設定');
      await connectDB();
      console.log('MongoDB接続成功');

      console.log('データベース保存開始...');
      const contact = new Contact(payload);
      await contact.save();
      console.log('データベース保存成功');
    } catch (dbError) {
      const message = dbError instanceof Error ? dbError.message : String(dbError);
      console.error('DB保存エラー:', dbError);

      // AtlasのIPホワイトリスト未設定など、ローカル開発でよくある接続不可はフォールバック
      const isServerSelection =
        (dbError instanceof Error && dbError.name === 'MongooseServerSelectionError') ||
        message.includes('Could not connect to any servers') ||
        message.includes('IP') ||
        message.includes('whitelist') ||
        message.includes('whitelisted');

      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev && isServerSelection) {
        const { file } = await fallbackSaveContact(payload);
        storedTo = 'file';
        console.warn(
          `MongoDBに接続できないためローカルファイルへ保存しました: ${file}`
        );
      } else {
        throw dbError;
      }
    }

    // メール送信
    console.log('メール送信開始...');
    console.log('SMTP設定確認:', {
      SMTP_USER: process.env.SMTP_USER ? '設定済み' : '未設定',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD || process.env.SMTP_PASS ? '設定済み' : '未設定',
      SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
      SMTP_PORT: process.env.SMTP_PORT || '587',
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
    });
    try {
      await sendContactEmail(name, email, subject, message);
      console.log('メール送信成功');
    } catch (emailError) {
      // メール送信が失敗してもDB保存は成功しているため、ログに記録して続行
      console.error('メール送信エラー:', emailError);
      console.error('メール送信エラー詳細:', {
        message: emailError instanceof Error ? emailError.message : String(emailError),
        stack: emailError instanceof Error ? emailError.stack : undefined,
      });
      // 本番環境では、メール送信エラーを別途処理することを推奨
    }

    return NextResponse.json(
      { message: 'お問い合わせを受け付けました', storedTo },
      { status: 200 }
    );
  } catch (error) {
    console.error('お問い合わせ処理エラー:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Mongooseバリデーションエラー
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: '入力内容に誤りがあります' },
        { status: 400 }
      );
    }

    // MongoDB接続/保存エラー
    if (
      error instanceof Error &&
      (error.name === 'MongooseServerSelectionError' ||
        error.message.includes('Could not connect to any servers') ||
        error.message.includes('MONGODB_URI'))
    ) {
      return NextResponse.json(
        {
          error:
            'データベース接続エラーが発生しました。MongoDB AtlasのIPホワイトリスト設定、またはMONGODB_URI設定を確認してください。',
        },
        { status: 500 }
      );
    }

    // SMTP設定エラー
    if (error instanceof Error && (error.message.includes('SMTP') || error.message.includes('SMTP_USER'))) {
      return NextResponse.json(
        { error: 'メール送信設定エラーが発生しました。設定を確認してください。' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'サーバーエラーが発生しました。しばらくしてから再度お試しください。',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
