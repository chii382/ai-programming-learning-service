import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { ObjectId } from 'mongodb';
import clientPromise from './mongo-client';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'select_account',
          // アカウント選択画面を強制表示し、「別のアカウントを使用」から新規作成に進める
          access_type: 'offline',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        
        try {
          // MongoDBから直接ユーザー情報を取得してroleを確認（常に最新の値を取得）
          // user.idを使って_idで検索（emailではなく、確実に該当ユーザーを取得）
          const client = await clientPromise;
          const db = client.db();
          
          // user.idは文字列なので、ObjectIdに変換して検索
          let dbUser = null;
          try {
            // user.idが有効なObjectId形式かチェック
            if (user.id && typeof user.id === 'string' && user.id.length === 24) {
              dbUser = await db.collection('users').findOne({ _id: new ObjectId(user.id) });
            } else {
              // ObjectId形式でない場合はemailで検索
              dbUser = await db.collection('users').findOne({ email: user.email });
            }
          } catch (idError) {
            // ObjectId変換に失敗した場合はemailで検索（フォールバック）
            console.warn('ObjectId変換失敗、emailで検索:', idError);
            try {
              dbUser = await db.collection('users').findOne({ email: user.email });
            } catch (emailError) {
              console.error('email検索も失敗:', emailError);
            }
          }
          
          // ADMIN_EMAILS環境変数から管理者メールアドレスを取得
          const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
          
          // デバッグ用ログ
          console.log('セッションコールバック - 管理者権限チェック:', {
            userId: user.id,
            userEmail: user.email,
            adminEmails,
            isAdmin: adminEmails.includes((user.email || '').toLowerCase()),
            dbRole: dbUser?.role,
            userRole: user.role, // userオブジェクトのrole（参考用、無視される）
          });
          
          // MongoDBから取得したroleを必ず使用（user.roleは完全に無視）
          // 権限変更が反映されるように、常にDBから最新の値を取得
          // 重要: セッションコールバックが呼ばれるたびに、最新のDBの値を取得する
          let role = dbUser?.role || 'user';
          
          // メールアドレスの大文字小文字を無視して比較
          if (adminEmails.includes((user.email || '').toLowerCase())) {
            // 管理者メールアドレスに含まれている場合は、DBを更新してadminを設定
            try {
              const updateQuery = user.id && typeof user.id === 'string' && user.id.length === 24
                ? { _id: new ObjectId(user.id) }
                : { email: user.email };
              const updateResult = await db.collection('users').updateOne(
                updateQuery,
                { $set: { role: 'admin' } }
              );
              role = 'admin';
              console.log(`管理者role設定: ${user.email}, role: ${role}, 更新結果: ${updateResult.modifiedCount > 0 ? '成功' : '変更なし'}`);
              
              // 更新後、再度DBから取得して確認
              const updatedUser = await db.collection('users').findOne(updateQuery);
              if (updatedUser?.role !== 'admin') {
                console.error(`⚠️ 警告: 管理者role設定後、DBの確認で不一致: ${user.email}, DB role: ${updatedUser?.role}`);
              }
            } catch (updateError) {
              console.error('管理者role更新エラー:', updateError);
              role = dbUser?.role || 'admin'; // エラー時は既存のroleを使用
            }
          } else {
            // 管理者メールアドレスに含まれていない場合、DBの値を確認
            if (dbUser?.role === 'admin' && !adminEmails.includes((user.email || '').toLowerCase())) {
              // 以前は管理者だったが、現在は管理者リストに含まれていない場合はuserに変更
              try {
                const updateQuery = user.id && typeof user.id === 'string' && user.id.length === 24
                  ? { _id: new ObjectId(user.id) }
                  : { email: user.email };
                const updateResult = await db.collection('users').updateOne(
                  updateQuery,
                  { $set: { role: 'user' } }
                );
                role = 'user';
                console.log(`管理者権限削除: ${user.email}, role: ${role}, 更新結果: ${updateResult.modifiedCount > 0 ? '成功' : '変更なし'}`);
              } catch (updateError) {
                console.error('管理者権限削除エラー:', updateError);
                role = dbUser?.role || 'user'; // エラー時は既存のroleを使用
              }
            }
          }
          
          // 最終確認: セッション設定前に、もう一度DBから最新の値を取得
          let finalCheckUser = null;
          try {
            const finalQuery = user.id && typeof user.id === 'string' && user.id.length === 24
              ? { _id: new ObjectId(user.id) }
              : { email: user.email };
            finalCheckUser = await db.collection('users').findOne(finalQuery);
          } catch (finalError) {
            console.error('最終確認エラー:', finalError);
          }
          const finalRole = finalCheckUser?.role || role;
          
          // MongoDBから取得した最新のroleをセッションに設定（userオブジェクトのroleは完全に無視）
          session.user.role = finalRole;
          console.log(`✅ セッションrole設定完了: ${user.email}, role: ${session.user.role} (DB最終確認: ${finalCheckUser?.role}, 初期DB: ${dbUser?.role}, user.role: ${user.role} - 無視)`);
        } catch (error) {
          console.error('❌ セッションrole取得エラー:', error);
          // エラーが発生した場合は、MongoDBから再取得を試みる
          try {
            const client = await clientPromise;
            const db = client.db();
            let dbUser = null;
            try {
              dbUser = await db.collection('users').findOne({ _id: new ObjectId(user.id) });
            } catch (idError) {
              dbUser = await db.collection('users').findOne({ email: user.email });
            }
            session.user.role = dbUser?.role || 'user';
            console.log(`⚠️ フォールバック: ${user.email}, role: ${session.user.role}`);
          } catch (fallbackError) {
            console.error('❌ フォールバックエラー:', fallbackError);
            // 最後の手段としてuser.roleを使用（ただし、これは古い可能性がある）
            session.user.role = user.role || 'user';
            console.log(`⚠️ 最終フォールバック: ${user.email}, role: ${session.user.role} (user.roleを使用)`);
          }
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔀 リダイレクトコールバック:', { url, baseUrl });
      // 相対URLの場合はbaseUrlを追加
      if (url.startsWith('/')) {
        const redirectUrl = `${baseUrl}${url}`;
        console.log('✅ リダイレクト先（相対URL）:', redirectUrl);
        return redirectUrl;
      }
      // 同じオリジンの場合は許可
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === baseUrl) {
          console.log('✅ リダイレクト先（同じオリジン）:', url);
          return url;
        }
      } catch (e) {
        console.warn('⚠️ URL解析エラー:', e);
      }
      // デフォルトはbaseUrl
      console.log('✅ リダイレクト先（デフォルト）:', baseUrl);
      return baseUrl;
    },
  },
  events: {
    async createUser({ user }) {
      // 新規ユーザー作成時にrole、createdAt、updatedAtを設定
      // MongoDBアダプターが自動的にユーザーを作成するため、
      // ここではMongoDBクライアントを直接使用してroleとタイムスタンプを設定
      try {
        const client = await clientPromise;
        const db = client.db();
        
        // ADMIN_EMAILS環境変数から管理者メールアドレスを取得
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || [];
        
        // デバッグ用ログ
        console.log('ユーザー作成 - 管理者権限チェック:', {
          userEmail: user.email,
          adminEmails,
          isAdmin: adminEmails.includes((user.email || '').toLowerCase()),
        });
        
        // メールアドレスの大文字小文字を無視して比較
        const role = adminEmails.includes((user.email || '').toLowerCase()) ? 'admin' : 'user';
        
        // 現在の日時を取得
        const now = new Date();
        
        await db.collection('users').updateOne(
          { email: user.email },
          { 
            $set: { 
              role,
              createdAt: now,
              updatedAt: now,
            }
          }
        );
        
        console.log(`ユーザー作成: ${user.email}, role: ${role}, createdAt: ${now.toISOString()}`);
      } catch (error) {
        console.error('ユーザーrole設定エラー:', error);
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'database',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true, // Vercel環境でのリダイレクトURI検証を有効化
});


