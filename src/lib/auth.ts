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
            dbUser = await db.collection('users').findOne({ _id: new ObjectId(user.id) });
          } catch (idError) {
            // ObjectId変換に失敗した場合はemailで検索（フォールバック）
            console.warn('ObjectId変換失敗、emailで検索:', idError);
            dbUser = await db.collection('users').findOne({ email: user.email });
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
          
          // ⚠️ 重要: 管理画面での明示的な権限変更が最優先される
          // ADMIN_EMAILS環境変数は新規ユーザー作成時（createUserイベント）のみ適用される
          // 既存ユーザーでは、DBのroleをそのまま使用する（ADMIN_EMAILSのチェックは行わない）
          
          // DBから最新のroleを取得（これが唯一の信頼できるソース）
          // 管理画面で変更された値がここに反映されている
          const dbRole = dbUser?.role || 'user';
          
          // ADMIN_EMAILS環境変数との整合性チェック（参考用ログのみ）
          const isInAdminList = adminEmails.includes((user.email || '').toLowerCase());
          
          // ⚠️ 最重要: DBのroleをそのまま使用する（管理画面での変更を完全に尊重）
          // ADMIN_EMAILSに含まれていても、DBでuserに変更されていればuserを尊重
          // ADMIN_EMAILSは新規ユーザー作成時のみ適用され、既存ユーザーでは無視される
          const role = dbRole;
          
          // ⚠️ 最重要: セッション設定前に、もう一度DBから最新の値を取得して確実に反映
          // これにより、権限変更が即座に反映される
          const finalCheckUser = await db.collection('users').findOne({ _id: new ObjectId(user.id) });
          const finalRole = finalCheckUser?.role || 'user';
          
          // MongoDBから取得した最新のroleをセッションに設定
          // user.roleは完全に無視（古い可能性があるため）
          // ADMIN_EMAILSよりもDBのroleが優先される（管理画面での変更を完全に尊重）
          session.user.role = finalRole;
          
          console.log(`✅ セッションrole設定完了: ${user.email}, role: ${session.user.role} (DB最終確認: ${finalCheckUser?.role}, ADMIN_EMAILS含まれる: ${isInAdminList} - 無視, DB初期値: ${dbRole}, user.role: ${user.role} - 無視)`);
          
          // デバッグ: roleが正しく設定されているか確認
          if (finalRole !== session.user.role) {
            console.error(`❌ 重大なエラー: roleの不一致 - finalRole: ${finalRole}, session.user.role: ${session.user.role}`);
            // 強制的に設定
            session.user.role = finalRole;
          }
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
  },
  events: {
    async createUser({ user }) {
      // 新規ユーザー作成時にroleを設定
      // MongoDBアダプターが自動的にユーザーを作成するため、
      // ここではMongoDBクライアントを直接使用してroleを設定
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
        
        await db.collection('users').updateOne(
          { email: user.email },
          { $set: { role } }
        );
        
        console.log(`ユーザー作成: ${user.email}, role: ${role}`);
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


