# Googleログインエラー修正手順

## エラー内容
**エラー 400: redirect_uri_mismatch**

このエラーは、Google Cloud Consoleで設定されているリダイレクトURIと、アプリケーションが送信しているリダイレクトURIが一致しない場合に発生します。

---

## 修正手順

### 1. サーバーのポート確認

現在、サーバーは**ポート3000**で起動するように設定されています。

環境変数：
- `AUTH_URL=http://localhost:3000`

### 2. Google Cloud ConsoleでのリダイレクトURI設定確認

以下の手順で、Google Cloud ConsoleでリダイレクトURIが正しく設定されているか確認してください。

#### 2.1 Google Cloud Consoleにアクセス

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを選択（OAuth 2.0クライアントIDが作成されたプロジェクト）

#### 2.2 OAuth 2.0クライアントIDの設定を開く

1. 左側のメニューから「APIとサービス」→「認証情報」を選択
2. OAuth 2.0クライアントIDの一覧から、使用しているクライアントIDをクリック
   - クライアントID: `***（機密情報のため非表示）`

#### 2.3 承認済みのリダイレクトURIを確認・追加

「承認済みのリダイレクト URI」セクションに、以下のURIが追加されていることを確認してください：

**開発環境用：**
```
http://localhost:3000/api/auth/callback/google
```

**本番環境用（Vercelデプロイ済みの場合）：**
```
https://ai-programming-learning-service-pink.vercel.app/api/auth/callback/google
```

#### 2.4 リダイレクトURIが設定されていない場合

1. 「承認済みのリダイレクト URI」セクションの「+ URIを追加」をクリック
2. 上記のURIを入力
3. 「保存」をクリック

**注意：** 変更が反映されるまで数分かかる場合があります。

---

## 確認事項

### ✅ 環境変数の確認

`.env.local`ファイルに以下の環境変数が設定されていることを確認してください：

```env
AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=***（機密情報のため非表示）
GOOGLE_CLIENT_SECRET=***（機密情報のため非表示）
AUTH_SECRET=設定されている値
```

### ✅ サーバーのポート確認

サーバーが**ポート3000**で起動していることを確認してください。

```bash
# サーバー起動確認
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスできることを確認してください。

### ✅ Google Cloud Consoleの設定確認

1. OAuth同意画面が正しく設定されている
2. テストユーザーが追加されている（開発中の場合）
3. リダイレクトURIが正しく設定されている

---

## よくある問題と解決方法

### 問題1: ポートが3000以外で起動している

**症状：** サーバーがポート3004など、別のポートで起動している

**解決方法：**
1. ポート3000を使用しているプロセスを停止
2. サーバーを再起動（ポート3000で起動するはず）

または、環境変数を変更して、実際に使用しているポートに合わせる：

```env
AUTH_URL=http://localhost:3004
```

そして、Google Cloud ConsoleでリダイレクトURIも変更：

```
http://localhost:3004/api/auth/callback/google
```

### 問題2: リダイレクトURIが設定されていない

**症状：** Google Cloud ConsoleにリダイレクトURIが設定されていない

**解決方法：**
上記の「2.3 承認済みのリダイレクトURIを確認・追加」の手順に従って、リダイレクトURIを追加してください。

### 問題3: リダイレクトURIの形式が間違っている

**症状：** リダイレクトURIが設定されているが、形式が間違っている

**解決方法：**
リダイレクトURIは以下の形式である必要があります：

- 開発環境: `http://localhost:3000/api/auth/callback/google`
- 本番環境: `https://your-domain.com/api/auth/callback/google`

**注意：**
- `http://` と `https://` を正しく使い分ける
- 末尾にスラッシュ（`/`）を付けない
- ポート番号を正しく指定する

### 問題4: 変更が反映されない

**症状：** Google Cloud Consoleで設定を変更したが、エラーが続く

**解決方法：**
1. ブラウザのキャッシュをクリア
2. 数分待ってから再度試す（変更の反映に時間がかかる場合がある）
3. サーバーを再起動

---

## 修正後の確認

1. **サーバーがポート3000で起動していることを確認**
   ```bash
   # ブラウザで http://localhost:3000 にアクセス
   ```

2. **Googleログインを試す**
   - `http://localhost:3000/auth/signin` にアクセス
   - 「Googleでログイン」ボタンをクリック
   - エラーが発生しないことを確認

3. **ログインが成功することを確認**
   - Googleアカウントでログイン
   - 正常にログインできることを確認

---

## 参考情報

- [NextAuth.js v5 ドキュメント](https://authjs.dev/)
- [Google OAuth 2.0 設定ガイド](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

## 修正完了確認

- [ ] Google Cloud ConsoleでリダイレクトURIが設定されている
- [ ] サーバーがポート3000で起動している
- [ ] 環境変数が正しく設定されている
- [ ] Googleログインが正常に動作する
