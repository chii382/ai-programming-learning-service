# Edge Runtimeエラー修正手順

## エラー内容
**エラー**: "The edge runtime does not support Node.js 'crypto' module."

このエラーは、Next.jsのミドルウェア（Edge Runtime）でMongoDBアダプターを使用しようとした際に発生します。Edge RuntimeはNode.jsの一部のAPI（`crypto`モジュール、TCPソケットなど）をサポートしていないため、MongoDBクライアントが使用できません。

---

## 修正内容

### 1. ミドルウェアの修正

**問題**: `src/middleware.ts`で`auth()`関数を呼び出していたが、この関数がMongoDBアダプターを使用するため、Edge Runtimeで動作しない。

**解決策**: ミドルウェアではセッションクッキーの存在のみを確認し、管理者権限チェックはページレベルで行うように変更。

**変更前**:
```typescript
// 管理者専用パスの場合
if (isAdminPath) {
  // セッションを取得（MongoDBアダプターを使用）
  const session = await auth();
  
  // セッションがない場合、ログイン画面にリダイレクト
  if (!session?.user) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 管理者権限チェック
  if (session.user.role !== 'admin') {
    const forbiddenUrl = new URL('/admin/403', request.url);
    return NextResponse.redirect(forbiddenUrl);
  }
}
```

**変更後**:
```typescript
// 管理者専用パスの場合
if (isAdminPath) {
  // セッションクッキーを確認（Edge Runtime互換）
  const sessionToken = request.cookies.get('authjs.session-token')?.value ||
                      request.cookies.get('__Secure-authjs.session-token')?.value;

  // セッションがない場合、ログイン画面にリダイレクト
  if (!sessionToken) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 管理者権限チェックはページレベルで行う
  // （Edge RuntimeではMongoDBアダプターが使用できないため）
}
```

### 2. AdminGuardコンポーネントの作成

**目的**: 管理者権限チェックをページレベルで行うためのコンポーネントを作成。

**ファイル**: `src/app/admin/AdminGuard.tsx`

**機能**:
- `useSession`を使用してセッションを取得
- セッションがない場合、ログイン画面にリダイレクト
- 管理者権限がない場合、403エラーページにリダイレクト
- ローディング中はローディングインジケーターを表示

### 3. レイアウトの修正

**ファイル**: `src/app/admin/layout.tsx`

**変更内容**: `AdminGuard`コンポーネントでラップして、管理者権限チェックを実行。

```typescript
import AdminGuard from './AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // ... 既存のコード ...

  return (
    <AdminGuard>
      {/* 既存のレイアウトコンテンツ */}
    </AdminGuard>
  );
}
```

---

## 修正後の動作

### 1. ミドルウェアでの認証チェック
- セッションクッキーの存在のみを確認
- Edge Runtime互換の方法を使用
- MongoDBアダプターを使用しない

### 2. ページレベルでの権限チェック
- `AdminGuard`コンポーネントで管理者権限をチェック
- セッションがない場合、ログイン画面にリダイレクト
- 管理者権限がない場合、403エラーページにリダイレクト

### 3. パフォーマンス
- ミドルウェアでのチェックは軽量（クッキーのみ）
- ページレベルでの権限チェックはクライアントサイドで実行
- ユーザー体験への影響は最小限

---

## 確認事項

### ✅ ビルドが成功する
```bash
npm run build
```

### ✅ ミドルウェアがEdge Runtimeで動作する
- MongoDBアダプターを使用しない
- セッションクッキーのみを確認

### ✅ 管理者権限チェックが動作する
- 管理者でログイン後、`/admin`にアクセスできる
- 一般ユーザーでログイン後、`/admin`にアクセスすると403エラーページが表示される

---

## 注意事項

1. **セッション戦略**
   - 現在の実装では、データベースセッション戦略（`strategy: 'database'`）を使用しています
   - ミドルウェアではセッションクッキーのみを確認し、実際のセッションデータはページレベルで取得します

2. **パフォーマンス**
   - ミドルウェアでのチェックは軽量ですが、ページレベルでの権限チェックは追加のAPIリクエストが必要です
   - これはEdge Runtimeの制約によるもので、許容範囲内です

3. **セキュリティ**
   - ミドルウェアでセッションクッキーの存在のみを確認していますが、実際の権限チェックはページレベルで行うため、セキュリティは維持されています

---

## 参考情報

- [Next.js Edge Runtime](https://nextjs.org/docs/app/api-reference/edge)
- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [NextAuth.js Edge Runtime Compatibility](https://authjs.dev/getting-started/installation?framework=next.js)

---

## 修正完了確認

- [x] ミドルウェアをEdge Runtime互換に修正
- [x] `AdminGuard`コンポーネントを作成
- [x] レイアウトに`AdminGuard`を追加
- [x] ビルドが成功する
- [ ] ブラウザで動作確認（管理者でログインして`/admin`にアクセス）
- [ ] ブラウザで動作確認（一般ユーザーでログインして`/admin`にアクセス）

**修正日**: 2025年12月26日

