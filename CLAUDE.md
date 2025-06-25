# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

このファイルは、このリポジトリのコードを扱う際のClaude Code (claude.ai/code)へのガイダンスを提供します。

## プロジェクト概要

Next.js 14.2.5（App Router）、TypeScript、React 18で構築されたテトリスゲームです。シングルページのクライアントサイドアプリケーションとして実装されています。

## 技術スタック

- Next.js 14.2.5（App Router使用）
- React 18（hooks使用：useState、useEffect、useCallback）
- TypeScript（strictモード）
- 外部UIライブラリやCSSフレームワークは不使用

## コマンド / Commands

```bash
# 依存関係のインストール / Install dependencies
npm install

# 開発サーバーの起動 / Start development server (http://localhost:3000)
npm run dev

# プロダクションビルド / Build for production
npm run build

# プロダクションサーバーの起動 / Start production server
npm run start

# ESLintの実行 / Run ESLint
npm run lint
```

Note: There is no test suite configured for this project.

## アーキテクチャ

### ディレクトリ構造 / Directory Structure
```
/
├── app/
│   ├── page.tsx           # メインゲームコンポーネント（クライアントサイド） / Main game component (client-side)
│   └── layout.tsx         # メタデータを含むルートレイアウト / Root layout with metadata
├── middleware.ts          # Basic認証ミドルウェア / Basic authentication middleware
├── .env.local.example     # 環境変数のサンプル / Environment variables example
├── .eslintrc.json         # ESLint設定 / ESLint configuration
├── package.json           # プロジェクト設定と依存関係 / Project configuration and dependencies
├── tsconfig.json          # TypeScript設定 / TypeScript configuration
├── next.config.js         # Next.js設定（デフォルト） / Next.js configuration (default)
├── .gitignore            # Git除外ファイル / Git ignore file
├── README.md             # プロジェクト説明 / Project description
└── CLAUDE.md             # このファイル / This file
```

### ゲーム実装の核心

ゲームロジック全体は`/app/page.tsx`に`'use client'`ディレクティブを使用した単一のReactコンポーネントとして実装されています。主要な設計判断：

1. **状態管理**：React hooksのみを使用（外部状態管理ライブラリなし）
   - `board`：ゲームグリッドを表す2次元配列（20×10）
   - `currentPiece`＆`nextPiece`：アクティブなテトリスピースと次のピース
   - `position`：現在のピースの座標
   - `score`：ゲームスコア（1ライン消去で100点、4ライン同時消去で1000点）
   - `gameOver`：ゲーム状態フラグ

2. **ピースシステム**：
   - 標準的な7種類のテトリスピース（I、O、T、L、J、S、Z）
   - 各ピースは形状マトリックスと色を持つ
   - 視覚的な差別化のため、ピースごとに固有の色を設定

3. **ゲームループ**：
   - `setInterval`を使用した自動ピース落下（500ms間隔）
   - プレイヤー操作用のキーボードイベントリスナー（矢印キー＋スペース）

4. **レンダリング**：
   - ボード状態は数値で保存（0＝空、1-7＝ピースタイプ、-1＝アクティブピース）
   - すべての視覚要素にインラインスタイルを使用
   - CSSモジュールや外部スタイルシートは不使用

### 主要な関数

- `isValidMove()`：ピース移動の衝突検出
- `lockPiece()`：ピース配置の確定とライン消去処理
- `rotate()`：ピース回転のためのマトリックス回転
- `renderBoard()`：ボード状態とアクティブピースを統合して表示

### 重要な実装詳細

1. **ハイドレーションの安全性**：初期ランダムピースは`useEffect`で設定し、ハイドレーションの不一致を防ぐ
2. **ピースの識別**：オブジェクト参照ではなく形状比較（`JSON.stringify`）を使用してピースタイプを識別
3. **ライン消去**：満杯の行を識別し、削除して、上部に空の行を追加

## 一般的なタスク

### 新機能の追加
ゲームメカニクスを変更する際は、状態管理セクション（26-46行目）とゲームロジックのコールバック（64-155行目）に注目してください。

### レンダリング問題のデバッグ
`renderBoard()`関数とレンダーセクションの色マッピングロジック（特に`backgroundColor`の計算）を確認してください。

### 操作方法の変更
キーボード操作は156行目付近から始まる`useEffect`フックで処理されています。

## Game Controls / ゲーム操作

- **Left Arrow (←)**: Move piece left / ピースを左に移動
- **Right Arrow (→)**: Move piece right / ピースを右に移動  
- **Down Arrow (↓)**: Move piece down faster / ピースを下に高速移動
- **Space**: Rotate piece / ピースを回転

## Key Implementation Notes

1. **No External Dependencies**: This project uses only Next.js, React, and TypeScript with no additional UI libraries or CSS frameworks
2. **Single File Architecture**: All game logic is contained in `/app/page.tsx` for simplicity
3. **Type Safety**: TypeScript strict mode is enabled - ensure all new code maintains type safety
4. **Client-Side Only**: The game runs entirely on the client side using the `'use client'` directive

## Vercel Deployment with Basic Authentication / VercelでのBasic認証付きデプロイ

This project includes Basic authentication middleware for secure deployment on Vercel.

### Setup Instructions / セットアップ手順

1. **Environment Variables on Vercel / Vercelでの環境変数設定**:
   - Go to your Vercel project settings / Vercelプロジェクト設定にアクセス
   - Add the following environment variables / 以下の環境変数を追加:
     - `BASIC_AUTH_USERNAME`: Your desired username / 希望のユーザー名
     - `BASIC_AUTH_PASSWORD`: Your secure password / 安全なパスワード

2. **Local Development / ローカル開発**:
   ```bash
   # Copy the example file / サンプルファイルをコピー
   cp .env.local.example .env.local
   
   # Edit .env.local with your credentials / .env.localを編集して認証情報を設定
   ```

3. **How It Works / 仕組み**:
   - `middleware.ts` intercepts all requests / `middleware.ts`がすべてのリクエストをインターセプト
   - Requires Basic authentication for all pages / すべてのページでBasic認証が必要
   - Static assets are excluded from authentication / 静的アセットは認証から除外

### Important Notes / 重要事項

- Default credentials (if not set): username=`admin`, password=`password` / デフォルト認証情報（未設定の場合）
- **Always set custom credentials in production!** / **本番環境では必ずカスタム認証情報を設定してください！**
- Authentication prompt appears as "Secure Area" / 認証プロンプトは「Secure Area」として表示