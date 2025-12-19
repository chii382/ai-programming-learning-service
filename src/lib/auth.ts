import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
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
        // MongoDBアダプターが自動的にuserオブジェクトにroleを追加する
        session.user.role = user.role || 'user';
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
        await db.collection('users').updateOne(
          { email: user.email },
          { $set: { role: 'user' } }
        );
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
});


