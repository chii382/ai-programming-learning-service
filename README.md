# AIコードレビューサービス

AIがあなたのコードをレビュー。24時間いつでも、どこでも。プログラミング学習を加速させる、次世代のコードレビューサービス。

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router)
- **UI**: Material-UI (MUI) v5
- **言語**: TypeScript
- **スタイリング**: Emotion (MUI標準)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

または、以下のパッケージを手動でインストール：

```bash
npm install react react-dom next
npm install @mui/material @mui/icons-material
npm install @emotion/react @emotion/styled
npm install @mui/material-nextjs
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## プロジェクト構造

```
app_dev/
├── docs/
│   ├── 要件定義/
│   │   ├── 1_ペルソナ定義.md
│   │   ├── 2_ユーザージャーニーマップ.md
│   │   ├── 3_ユーザーニーズ洗い出し.md
│   │   └── 4_MVP機能一覧と優先順位.md
│   └── 設計/
│       └── LP設計.md
├── src/
│   └── app/
│       ├── layout.tsx      # ルートレイアウト（MUIプロバイダー設定）
│       ├── page.tsx         # ランディングページ
│       └── theme.ts         # MUIテーマ設定
└── README.md
```

## 機能

### ランディングページ

- **ヒーローセクション**: キャッチコピーとCTAボタン
- **サービス特徴**: 3つの主要な特徴をカード形式で表示
- **使い方ステップ**: 4ステップで使い方を説明
- **CTAセクション**: 登録・ログインへの誘導
- **フッター**: リンクとコピーライト

### デザイン特徴

- **レスポンシブ対応**: モバイル、タブレット、デスクトップに対応
- **ダークモード対応**: テーマ設定でダークモードに対応（実装済み、切り替え機能は今後追加予定）
- **MUIコンポーネント**: Material Designに基づいたモダンなUI

## 次のステップ

1. 認証機能の実装（NextAuth.js）
2. コード投稿機能の実装
3. AIコードレビュー機能の実装（Claude API連携）
4. ダッシュボード機能の実装
5. データベース接続（MongoDB）

## ライセンス

このプロジェクトはプライベートプロジェクトです。

