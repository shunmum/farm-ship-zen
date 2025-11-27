# FarmShip システム仕様書

## 1. システム概要

### 1.1 システム名
**FarmShip** - 農作物販売・配送管理システム

### 1.2 目的
農家が農作物の販売、受注管理、配送管理、顧客管理を効率的に行うための統合管理システム。公開注文フォームにより顧客との取引を円滑化し、送料計算の自動化により業務効率を向上させる。

### 1.3 対象ユーザー
- **主要ユーザー**: 農家・農園経営者
- **サブユーザー**: 農作物を購入する個人・法人顧客

### 1.4 利用環境
- **デバイス**: PC、タブレット、スマートフォン (レスポンシブ対応)
- **ブラウザ**: モダンブラウザ (Chrome, Firefox, Safari, Edge)

---

## 2. 技術スタック

### 2.1 フロントエンド
| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | React | 18.3.1 |
| 言語 | TypeScript | 5.8.3 |
| ビルドツール | Vite | 6.0.7 |
| ルーティング | React Router | 7.1.1 |
| 状態管理 | TanStack React Query | 5.67.0 |

### 2.2 UIライブラリ
| カテゴリ | 技術 | 用途 |
|---------|------|------|
| デザインシステム | shadcn/ui | コンポーネント |
| プリミティブ | Radix UI | アクセシブルなUI部品 |
| スタイリング | Tailwind CSS | CSSフレームワーク |
| アイコン | Lucide React | アイコンセット |
| グラフ表示 | Recharts | チャート・グラフ |

### 2.3 バックエンド
| カテゴリ | 技術 | 用途 |
|---------|------|------|
| BaaS | Supabase | バックエンド統合プラットフォーム |
| データベース | PostgreSQL | リレーショナルデータベース |
| 認証 | Supabase Auth | ユーザー認証 |
| ストレージ | Supabase Storage | 画像保存 (想定) |

### 2.4 その他ライブラリ
- **フォーム**: React Hook Form + Zod (バリデーション)
- **日付処理**: date-fns
- **CSV処理**: papaparse
- **テーマ**: next-themes (ダークモード対応)

---

## 3. システム構成

### 3.1 アーキテクチャ図

```
┌─────────────────────────────────────────────────┐
│          フロントエンド (React + Vite)           │
│  ┌─────────────────────────────────────────┐   │
│  │  Pages (ページコンポーネント)            │   │
│  │  - Dashboard, Orders, Customers, etc.  │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │  Components (共通UIコンポーネント)       │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │  Hooks (カスタムフック)                  │   │
│  │  - useAuth, useOrders, useCustomers     │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │  Lib (Supabaseクライアント)              │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────┐
│          Supabase (バックエンド)                │
│  ┌─────────────────────────────────────────┐   │
│  │  PostgreSQL Database                   │   │
│  │  + Row Level Security (RLS)            │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │  Auth (認証サービス)                     │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │  Storage (ストレージ)                    │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 3.2 ディレクトリ構成

```
farm-ship-zen-2/
├── src/
│   ├── components/          # 共通UIコンポーネント
│   │   ├── ui/              # shadcn/ui コンポーネント
│   │   ├── Navigation.tsx   # ナビゲーション
│   │   ├── ProductManagement.tsx
│   │   ├── PublicFormSettings.tsx
│   │   ├── ShippingModeSettings.tsx
│   │   ├── ZoneManagement.tsx
│   │   └── ZoneShippingRates.tsx
│   ├── contexts/            # Reactコンテキスト
│   ├── hooks/               # カスタムフック
│   │   ├── useAuth.ts
│   │   ├── useCustomers.ts
│   │   ├── useOrders.ts
│   │   ├── useProducts.ts
│   │   ├── usePublicOrderForm.ts
│   │   ├── useShippingCalculation.ts
│   │   ├── useShippingSettings.ts
│   │   └── useSampleData.ts
│   ├── lib/                 # ユーティリティ・設定
│   │   └── supabase.ts      # Supabaseクライアント
│   ├── pages/               # ページコンポーネント
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── CustomersPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── ShippingPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── PublicOrderPage.tsx
│   │   ├── WorkLogIndexPage.tsx
│   │   ├── WorkLogManualPage.tsx
│   │   ├── WorkLogChatPage.tsx
│   │   └── WorkLogListPage.tsx
│   ├── App.tsx              # ルート定義
│   └── main.tsx             # エントリーポイント
├── supabase-schema.sql      # データベーススキーマ
├── supabase-shipping-enhancement.sql  # 配送機能拡張
├── supabase-public-order-schema.sql   # 公開注文フォーム
├── supabase/seed-demo-data.sql        # デモデータ
├── DEMO_SETUP.md            # デモ環境セットアップ
├── package.json
└── vite.config.ts
```

---

## 4. 機能仕様

### 4.1 認証機能

#### 4.1.1 ログイン・サインアップ
- **URL**: `/login`
- **認証方式**: メール・パスワード認証 (Supabase Auth)
- **機能**:
  - 新規ユーザー登録
  - ログイン
  - セッション管理
  - 自動ログイン (セッション保持)
- **バリデーション**:
  - メール形式チェック
  - パスワード強度要件

#### 4.1.2 権限管理
- **RLS (Row Level Security)** によるデータ分離
- 全テーブルで `user_id` による行レベルセキュリティ
- ポリシー:
  - SELECT: 自分のデータのみ閲覧可能
  - INSERT: 自分のデータのみ作成可能
  - UPDATE: 自分のデータのみ更新可能
  - DELETE: 自分のデータのみ削除可能

---

### 4.2 ダッシュボード

#### 4.2.1 概要
- **URL**: `/`
- **目的**: 売上状況・KPIの可視化

#### 4.2.2 表示項目
- **売上サマリー**:
  - 本日の売上
  - 今月の売上
  - 今年の売上
  - 前年同期比
- **KPI**:
  - 顧客数
  - 受注件数
  - 平均客単価
- **グラフ**:
  - 月次売上推移 (Recharts)
  - 商品別売上ランキング
  - 顧客別購入金額

---

### 4.3 顧客管理

#### 4.3.1 顧客一覧
- **URL**: `/customers`
- **機能**:
  - 顧客一覧表示
  - 検索・フィルタリング
  - ソート (名前、登録日、購入金額)
  - ページネーション

#### 4.3.2 顧客登録・編集
- **入力項目**:
  - 顧客名 (必須)
  - メールアドレス
  - 電話番号
  - 住所 (郵便番号、都道府県、市区町村、番地)
  - メモ
- **配送先管理**:
  - 1顧客に対して複数の配送先を登録可能
  - 配送先ごとの名前・住所・電話番号

#### 4.3.3 顧客削除
- 確認ダイアログ表示
- 関連する受注データは保持 (論理削除想定)

#### 4.3.4 購入履歴
- 顧客ごとの購入履歴表示
- 累計購入金額の自動計算・表示

---

### 4.4 商品管理

#### 4.4.1 商品マスタ構造
- **親商品** (products):
  - 商品ID
  - 商品名
  - 説明
  - 画像URL
  - カテゴリ
  - 有効/無効フラグ

- **商品バリエーション** (product_variants):
  - バリエーションID
  - 親商品ID (外部キー)
  - バリエーション名 (例: "Sサイズ", "1kg")
  - SKUコード
  - 価格
  - 在庫数
  - 重量 (g)
  - サイズ (60, 80, 100, 120, 140, 160)

#### 4.4.2 商品管理機能
- 商品の追加・編集・削除
- バリエーションの追加・編集・削除
- 在庫数の更新
- 画像アップロード (Supabase Storage 想定)

---

### 4.5 受注管理

#### 4.5.1 受注一覧
- **URL**: `/orders`
- **表示項目**:
  - 注文番号
  - 注文日
  - 顧客名
  - 配送日
  - 合計金額
  - ステータス
  - 配送業者
- **フィルタリング**:
  - ステータス別
  - 日付範囲
  - 顧客名検索
- **ソート**: 注文日、金額、ステータス

#### 4.5.2 受注詳細
- **URL**: `/orders/:id`
- **表示項目**:
  - 注文ヘッダ情報
  - 顧客情報
  - 配送先情報
  - 注文明細 (商品、数量、単価、小計)
  - 送料
  - 合計金額
  - 配送業者・追跡番号
  - ステータス履歴

#### 4.5.3 受注登録・編集
- **ヘッダ情報**:
  - 顧客選択 (ドロップダウン)
  - 配送先選択
  - 配送日
  - 配送業者 (ヤマト運輸、佐川急便、ゆうパック)
  - クール便要否
- **明細入力**:
  - 商品選択 (バリエーション含む)
  - 数量入力
  - 単価・小計の自動計算
- **送料計算**:
  - 送料の自動計算 (後述の送料計算ロジック)
  - 手動調整可能
- **合計金額**:
  - 商品合計 + 送料 = 合計金額

#### 4.5.4 ステータス管理
- **ステータス種類**:
  - `pending`: 未発送
  - `shipped`: 発送済み
  - `delivered`: 配達完了
  - `cancelled`: キャンセル
- **ステータス更新**:
  - ステータス変更時に更新日時を記録
  - 追跡番号の入力 (発送済み時)

---

### 4.6 配送管理

#### 4.6.1 配送一覧
- **URL**: `/shipping`
- **表示項目**:
  - 配送日
  - 注文番号
  - 顧客名
  - 配送先
  - 配送業者
  - 追跡番号
  - ステータス
- **フィルタリング**:
  - 配送日範囲
  - 配送業者
  - ステータス

#### 4.6.2 配送データインポート
- **URL**: `/shipping/import`
- **機能**:
  - CSVファイルのアップロード
  - 配送業者からのデータインポート
  - 追跡番号の一括登録
- **CSV形式**:
  - 注文番号、追跡番号、配送日、ステータス

#### 4.6.3 配送ラベル出力
- 配送業者別のラベル形式出力 (想定)

---

### 4.7 送料計算機能

#### 4.7.1 送料計算モード

FarmShipは3つの送料計算モードを提供し、設定画面で切り替え可能。

##### モード1: 全国一律 (flat_rate)
- **概要**: 全国どこでも同じ料金
- **データソース**: `shipping_rates` テーブル
- **設定項目**:
  - 配送業者 (carrier)
  - サイズ (60, 80, 100, 120, 140, 160)
  - 基本料金 (base_rate)
  - クール便追加料金 (cool_fee)

##### モード2: 都道府県別 (prefecture)
- **概要**: 47都道府県ごとに個別料金設定
- **データソース**: `prefecture_shipping_rates` テーブル
- **設定項目**:
  - 配送業者
  - サイズ
  - 都道府県
  - 基本料金
  - クール便追加料金

##### モード3: ゾーン制 (zone)
- **概要**: 都道府県をゾーンにグループ化して料金設定
- **データソース**:
  - `shipping_zones` (ゾーン定義)
  - `prefecture_zones` (都道府県→ゾーンマッピング)
  - `zone_shipping_rates` (ゾーン別料金)
- **設定項目**:
  - ゾーン名 (例: 関東、中部、関西、北海道・東北、九州・沖縄)
  - ゾーンに含まれる都道府県
  - 配送業者・サイズごとの料金

#### 4.7.2 荷合いルール (Consolidation)

複数個口を1つにまとめて送料を最適化する機能。

- **データソース**: `consolidation_rules` テーブル
- **ルール例**:
  - 60サイズ × 2個 → 80サイズ × 1個
  - 60サイズ × 3個 → 100サイズ × 1個
  - 80サイズ × 2個 → 120サイズ × 1個
- **適用ロジック**:
  1. 注文明細から必要な梱包サイズを計算
  2. 荷合いルールを適用して最適な梱包を決定
  3. 最適化された梱包サイズで送料を計算

#### 4.7.3 送料計算フロー

```
1. 注文明細から商品のサイズ・重量を取得
2. 梱包必要数を計算
3. 荷合いルールを適用 (最適化)
4. 配送先の都道府県を取得
5. 設定された送料計算モードに基づいて料金取得
   - flat_rate: shipping_rates
   - prefecture: prefecture_shipping_rates
   - zone: prefecture → zone → zone_shipping_rates
6. クール便の場合は追加料金を加算
7. 送料を算出
```

---

### 4.8 公開注文フォーム

#### 4.8.1 概要
顧客が認証なしで注文できる公開フォーム機能。農家ごとにカスタムURLを発行。

#### 4.8.2 公開フォーム設定
- **URL**: `/settings` (設定画面内)
- **設定項目**:
  - URLスラッグ (例: `yamada-farm`)
  - 農園表示名
  - 説明文
  - ロゴ画像URL
  - 有効/無効フラグ
  - 販売可能商品の選択

#### 4.8.3 公開注文ページ
- **URL**: `/order/:slug`
- **機能**:
  - 農園情報の表示
  - 商品一覧・選択
  - カート機能
  - 複数配送先の指定
  - 送料の自動計算
  - 注文確定
  - Stripe決済 (想定)

#### 4.8.4 注文フロー
```
1. 顧客が公開URLにアクセス (/order/yamada-farm)
2. 商品を選択・カートに追加
3. 配送先情報を入力 (複数可)
4. 送料が自動計算される
5. 決済情報を入力 (Stripe)
6. 注文確定
7. public_orders テーブルに保存
8. 農家側の管理画面に注文が表示される
```

#### 4.8.5 データモデル
- **public_order_forms**: フォーム設定
- **public_orders**: 注文ヘッダ
  - 注文番号
  - 農家ID (user_id)
  - 合計金額
  - 決済ステータス (pending, completed, failed)
  - Stripe決済ID (payment_intent_id)
- **public_order_recipients**: 配送先
  - 名前、住所、電話番号
- **public_order_items**: 注文明細
  - 商品、数量、単価

---

### 4.9 作業日誌

#### 4.9.1 概要
農作業の記録を管理する機能。手動入力とAI会話入力の2つのモードを提供。

#### 4.9.2 作業日誌一覧
- **URL**: `/work-logs/list`
- **表示項目**:
  - 作業日
  - 圃場
  - 作業内容
  - 収穫物
  - 使用資材
  - 写真
- **フィルタリング**:
  - 日付範囲
  - 圃場
  - 作業内容
- **表示形式**:
  - リスト表示
  - カレンダー表示
  - ガントチャート表示

#### 4.9.3 手動入力モード
- **URL**: `/work-logs/manual`
- **入力項目**:
  - 作業日 (必須)
  - 圃場 (必須)
  - 作業内容 (必須)
  - 収穫物 (任意)
  - 使用資材 (任意)
  - メモ (任意)
  - 写真アップロード (任意)

#### 4.9.4 AI会話入力モード
- **URL**: `/work-logs/chat`
- **機能**:
  - チャット形式で自然言語入力
  - AIが構造化データに変換
  - 確認画面で修正可能
  - 保存

**入力例**:
```
ユーザー: 「今日はトマトの畑で草取りをしました。3kgのトマトを収穫しました。」
AI: 以下の内容で記録しますか?
- 作業日: 2025-11-27
- 圃場: トマト畑
- 作業内容: 草取り、収穫
- 収穫物: トマト 3kg
```

#### 4.9.5 作業日誌詳細
- **URL**: `/work-logs/:id`
- **表示項目**:
  - 全ての入力情報
  - 写真ギャラリー
  - 編集・削除ボタン

---

### 4.10 設定

#### 4.10.1 設定画面
- **URL**: `/settings`
- **設定項目**:
  - **プロフィール設定**:
    - 農園名
    - メールアドレス
    - 電話番号
    - 住所
  - **送料計算モード設定**:
    - モード選択 (全国一律 / 都道府県別 / ゾーン制)
    - 各モードの料金設定
    - 荷合いルール設定
  - **配送業者設定**:
    - 利用する配送業者の選択
    - デフォルト配送業者
  - **公開注文フォーム設定**:
    - URLスラッグ
    - 表示名
    - 有効/無効
  - **商品設定**:
    - 商品マスタ管理
    - バリエーション管理
  - **通知設定**:
    - メール通知の有効/無効
    - 通知タイミング

---

## 5. データベース設計

### 5.1 ER図概要

```
profiles (ユーザー・農園情報)
    ↓ 1:N
customers (顧客マスタ)
    ↓ 1:N
recipients (配送先)
    ↓ N:1
orders (受注ヘッダ) → order_items (受注明細)
                           ↓ N:1
                       products (商品マスタ)
                           ↓ 1:N
                       product_variants (バリエーション)

public_order_forms (公開フォーム)
    ↓ 1:N
public_orders (公開注文) → public_order_items (明細)
    ↓ 1:N
public_order_recipients (配送先)

shipping_mode_settings (送料モード設定)
shipping_rates (全国一律料金)
prefecture_shipping_rates (都道府県別料金)
shipping_zones (ゾーン定義)
    ↓ 1:N
prefecture_zones (都道府県マッピング)
zone_shipping_rates (ゾーン別料金)

consolidation_rules (荷合いルール)

work_logs (作業日誌)
```

### 5.2 主要テーブル定義

#### 5.2.1 profiles
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | ユーザーID (auth.users.id) |
| farm_name | TEXT | NOT NULL | 農園名 |
| email | TEXT | NOT NULL | メールアドレス |
| phone | TEXT | | 電話番号 |
| postal_code | TEXT | | 郵便番号 |
| prefecture | TEXT | | 都道府県 |
| city | TEXT | | 市区町村 |
| address_line | TEXT | | 番地 |
| created_at | TIMESTAMPTZ | | 作成日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

#### 5.2.2 customers
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | 顧客ID |
| user_id | UUID | FK, NOT NULL | 農家ID |
| name | TEXT | NOT NULL | 顧客名 |
| email | TEXT | | メールアドレス |
| phone | TEXT | | 電話番号 |
| postal_code | TEXT | | 郵便番号 |
| prefecture | TEXT | | 都道府県 |
| city | TEXT | | 市区町村 |
| address_line | TEXT | | 番地 |
| notes | TEXT | | メモ |
| total_purchased | INTEGER | DEFAULT 0 | 累計購入金額 |
| created_at | TIMESTAMPTZ | | 作成日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

**インデックス**: `user_id`, `email`

#### 5.2.3 recipients
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | 配送先ID |
| customer_id | UUID | FK, NOT NULL | 顧客ID |
| name | TEXT | NOT NULL | 配送先名 |
| phone | TEXT | | 電話番号 |
| postal_code | TEXT | | 郵便番号 |
| prefecture | TEXT | NOT NULL | 都道府県 |
| city | TEXT | NOT NULL | 市区町村 |
| address_line | TEXT | NOT NULL | 番地 |
| created_at | TIMESTAMPTZ | | 作成日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

**インデックス**: `customer_id`

#### 5.2.4 products
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | 商品ID |
| user_id | UUID | FK, NOT NULL | 農家ID |
| name | TEXT | NOT NULL | 商品名 |
| description | TEXT | | 説明 |
| image_url | TEXT | | 画像URL |
| category | TEXT | | カテゴリ |
| is_active | BOOLEAN | DEFAULT true | 有効フラグ |
| created_at | TIMESTAMPTZ | | 作成日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

**インデックス**: `user_id`, `is_active`

#### 5.2.5 product_variants
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | バリエーションID |
| product_id | UUID | FK, NOT NULL | 商品ID |
| name | TEXT | NOT NULL | バリエーション名 |
| sku | TEXT | | SKUコード |
| price | INTEGER | NOT NULL | 価格 (円) |
| stock | INTEGER | DEFAULT 0 | 在庫数 |
| weight | INTEGER | | 重量 (g) |
| size | INTEGER | | サイズ (60, 80, 100, 120, 140, 160) |
| created_at | TIMESTAMPTZ | | 作成日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

**インデックス**: `product_id`, `sku`

#### 5.2.6 orders
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | 受注ID |
| user_id | UUID | FK, NOT NULL | 農家ID |
| order_number | TEXT | NOT NULL | 注文番号 |
| customer_id | UUID | FK | 顧客ID |
| customer_name | TEXT | NOT NULL | 顧客名 (非正規化) |
| recipient_id | UUID | FK | 配送先ID |
| recipient_name | TEXT | NOT NULL | 配送先名 (非正規化) |
| recipient_postal_code | TEXT | | 郵便番号 |
| recipient_prefecture | TEXT | | 都道府県 |
| recipient_city | TEXT | | 市区町村 |
| recipient_address_line | TEXT | | 番地 |
| recipient_phone | TEXT | | 電話番号 |
| order_date | DATE | NOT NULL | 注文日 |
| delivery_date | DATE | | 配送希望日 |
| total_amount | INTEGER | NOT NULL | 合計金額 |
| shipping_fee | INTEGER | DEFAULT 0 | 送料 |
| carrier | TEXT | | 配送業者 |
| tracking_number | TEXT | | 追跡番号 |
| is_cool | BOOLEAN | DEFAULT false | クール便フラグ |
| status | TEXT | DEFAULT 'pending' | ステータス |
| notes | TEXT | | 備考 |
| created_at | TIMESTAMPTZ | | 作成日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

**インデックス**: `user_id`, `order_date`, `status`, `customer_id`

**ステータス値**: `pending`, `shipped`, `delivered`, `cancelled`

#### 5.2.7 order_items
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | 明細ID |
| order_id | UUID | FK, NOT NULL | 受注ID |
| product_id | UUID | FK | 商品ID |
| product_variant_id | UUID | FK | バリエーションID |
| product_name | TEXT | NOT NULL | 商品名 (非正規化) |
| variant_name | TEXT | | バリエーション名 |
| quantity | INTEGER | NOT NULL | 数量 |
| unit_price | INTEGER | NOT NULL | 単価 |
| subtotal | INTEGER | NOT NULL | 小計 |
| created_at | TIMESTAMPTZ | | 作成日時 |

**インデックス**: `order_id`

#### 5.2.8 shipping_rates
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | 料金ID |
| user_id | UUID | FK, NOT NULL | 農家ID |
| carrier | TEXT | NOT NULL | 配送業者 |
| size | INTEGER | NOT NULL | サイズ |
| base_rate | INTEGER | NOT NULL | 基本料金 |
| cool_fee | INTEGER | DEFAULT 0 | クール便追加料金 |
| created_at | TIMESTAMPTZ | | 作成日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

**UNIQUE制約**: `(user_id, carrier, size)`

**配送業者値**: `yamato`, `sagawa`, `yupack`

#### 5.2.9 shipping_mode_settings
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | 設定ID |
| user_id | UUID | FK, NOT NULL, UNIQUE | 農家ID |
| mode | TEXT | NOT NULL | モード |
| created_at | TIMESTAMPTZ | | 作成日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

**モード値**: `flat_rate`, `prefecture`, `zone`

#### 5.2.10 prefecture_shipping_rates
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | 料金ID |
| user_id | UUID | FK, NOT NULL | 農家ID |
| carrier | TEXT | NOT NULL | 配送業者 |
| size | INTEGER | NOT NULL | サイズ |
| prefecture | TEXT | NOT NULL | 都道府県 |
| base_rate | INTEGER | NOT NULL | 基本料金 |
| cool_fee | INTEGER | DEFAULT 0 | クール便追加料金 |
| created_at | TIMESTAMPTZ | | 作成日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

**UNIQUE制約**: `(user_id, carrier, size, prefecture)`

#### 5.2.11 shipping_zones
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | ゾーンID |
| user_id | UUID | FK, NOT NULL | 農家ID |
| name | TEXT | NOT NULL | ゾーン名 |
| display_order | INTEGER | DEFAULT 0 | 表示順 |
| created_at | TIMESTAMPTZ | | 作成日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

**インデックス**: `user_id`

#### 5.2.12 prefecture_zones
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | マッピングID |
| zone_id | UUID | FK, NOT NULL | ゾーンID |
| prefecture | TEXT | NOT NULL | 都道府県 |
| created_at | TIMESTAMPTZ | | 作成日時 |

**UNIQUE制約**: `(zone_id, prefecture)`

#### 5.2.13 zone_shipping_rates
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | 料金ID |
| zone_id | UUID | FK, NOT NULL | ゾーンID |
| carrier | TEXT | NOT NULL | 配送業者 |
| size | INTEGER | NOT NULL | サイズ |
| base_rate | INTEGER | NOT NULL | 基本料金 |
| cool_fee | INTEGER | DEFAULT 0 | クール便追加料金 |
| created_at | TIMESTAMPTZ | | 作成日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

**UNIQUE制約**: `(zone_id, carrier, size)`

#### 5.2.14 consolidation_rules
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | ルールID |
| user_id | UUID | FK, NOT NULL | 農家ID |
| from_size | INTEGER | NOT NULL | 元のサイズ |
| from_quantity | INTEGER | NOT NULL | 元の個数 |
| to_size | INTEGER | NOT NULL | 変換後のサイズ |
| to_quantity | INTEGER | NOT NULL | 変換後の個数 |
| priority | INTEGER | DEFAULT 0 | 優先度 |
| created_at | TIMESTAMPTZ | | 作成日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

**インデックス**: `user_id`

#### 5.2.15 public_order_forms
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | フォームID |
| user_id | UUID | FK, NOT NULL | 農家ID |
| slug | TEXT | NOT NULL, UNIQUE | URLスラッグ |
| display_name | TEXT | NOT NULL | 表示名 |
| description | TEXT | | 説明 |
| logo_url | TEXT | | ロゴ画像URL |
| is_active | BOOLEAN | DEFAULT true | 有効フラグ |
| created_at | TIMESTAMPTZ | | 作成日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

**インデックス**: `slug`, `user_id`

#### 5.2.16 public_orders
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | 注文ID |
| form_id | UUID | FK, NOT NULL | フォームID |
| user_id | UUID | FK, NOT NULL | 農家ID |
| order_number | TEXT | NOT NULL | 注文番号 |
| customer_name | TEXT | NOT NULL | 注文者名 |
| customer_email | TEXT | NOT NULL | 注文者メール |
| customer_phone | TEXT | | 注文者電話 |
| total_amount | INTEGER | NOT NULL | 合計金額 |
| shipping_fee | INTEGER | DEFAULT 0 | 送料 |
| payment_status | TEXT | DEFAULT 'pending' | 決済ステータス |
| payment_intent_id | TEXT | | Stripe決済ID |
| notes | TEXT | | 備考 |
| created_at | TIMESTAMPTZ | | 注文日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

**インデックス**: `form_id`, `user_id`, `payment_status`

**決済ステータス**: `pending`, `completed`, `failed`

#### 5.2.17 public_order_recipients
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | 配送先ID |
| public_order_id | UUID | FK, NOT NULL | 注文ID |
| name | TEXT | NOT NULL | 配送先名 |
| phone | TEXT | | 電話番号 |
| postal_code | TEXT | | 郵便番号 |
| prefecture | TEXT | NOT NULL | 都道府県 |
| city | TEXT | NOT NULL | 市区町村 |
| address_line | TEXT | NOT NULL | 番地 |
| created_at | TIMESTAMPTZ | | 作成日時 |

**インデックス**: `public_order_id`

#### 5.2.18 public_order_items
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | 明細ID |
| public_order_id | UUID | FK, NOT NULL | 注文ID |
| recipient_id | UUID | FK, NOT NULL | 配送先ID |
| product_id | UUID | FK | 商品ID |
| product_variant_id | UUID | FK | バリエーションID |
| product_name | TEXT | NOT NULL | 商品名 |
| variant_name | TEXT | | バリエーション名 |
| quantity | INTEGER | NOT NULL | 数量 |
| unit_price | INTEGER | NOT NULL | 単価 |
| subtotal | INTEGER | NOT NULL | 小計 |
| created_at | TIMESTAMPTZ | | 作成日時 |

**インデックス**: `public_order_id`, `recipient_id`

#### 5.2.19 work_logs
| カラム名 | 型 | 制約 | 説明 |
|---------|---|-----|-----|
| id | UUID | PK | 日誌ID |
| user_id | UUID | FK, NOT NULL | 農家ID |
| work_date | DATE | NOT NULL | 作業日 |
| field | TEXT | NOT NULL | 圃場 |
| work_type | TEXT | NOT NULL | 作業内容 |
| harvest | TEXT | | 収穫物 |
| materials | TEXT | | 使用資材 |
| notes | TEXT | | メモ |
| photo_url | TEXT | | 写真URL |
| input_type | TEXT | DEFAULT 'manual' | 入力タイプ |
| created_at | TIMESTAMPTZ | | 作成日時 |
| updated_at | TIMESTAMPTZ | | 更新日時 |

**インデックス**: `user_id`, `work_date`

**入力タイプ**: `manual`, `ai_chat`

---

### 5.3 Row Level Security (RLS) ポリシー

全てのテーブルに対して以下のポリシーを適用:

```sql
-- SELECT
CREATE POLICY "Users can view their own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- INSERT
CREATE POLICY "Users can insert their own data"
ON table_name FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE
CREATE POLICY "Users can update their own data"
ON table_name FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE
CREATE POLICY "Users can delete their own data"
ON table_name FOR DELETE
USING (auth.uid() = user_id);
```

**公開注文フォームの特別なポリシー**:

```sql
-- public_order_forms: 有効なフォームは誰でも閲覧可能
CREATE POLICY "Anyone can view active forms"
ON public_order_forms FOR SELECT
USING (is_active = true);

-- public_orders: 誰でも注文作成可能
CREATE POLICY "Anyone can create orders"
ON public_orders FOR INSERT
WITH CHECK (true);

-- 農家は自分の注文を閲覧・更新可能
CREATE POLICY "Farmers can view their orders"
ON public_orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Farmers can update their orders"
ON public_orders FOR UPDATE
USING (auth.uid() = user_id);
```

---

## 6. API設計 (Supabase Client)

### 6.1 認証API

#### 6.1.1 サインアップ
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});
```

#### 6.1.2 ログイン
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

#### 6.1.3 ログアウト
```typescript
const { error } = await supabase.auth.signOut();
```

#### 6.1.4 セッション取得
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

---

### 6.2 顧客API

#### 6.2.1 顧客一覧取得
```typescript
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .order('created_at', { ascending: false });
```

#### 6.2.2 顧客登録
```typescript
const { data, error } = await supabase
  .from('customers')
  .insert({
    user_id: userId,
    name: '顧客名',
    email: 'customer@example.com',
    // ... その他のフィールド
  });
```

#### 6.2.3 顧客更新
```typescript
const { data, error } = await supabase
  .from('customers')
  .update({
    name: '新しい顧客名',
    // ... 更新するフィールド
  })
  .eq('id', customerId);
```

#### 6.2.4 顧客削除
```typescript
const { data, error } = await supabase
  .from('customers')
  .delete()
  .eq('id', customerId);
```

---

### 6.3 受注API

#### 6.3.1 受注一覧取得
```typescript
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (*)
  `)
  .order('order_date', { ascending: false });
```

#### 6.3.2 受注詳細取得
```typescript
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (*),
    customer:customers (*),
    recipient:recipients (*)
  `)
  .eq('id', orderId)
  .single();
```

#### 6.3.3 受注登録
```typescript
const { data, error } = await supabase
  .from('orders')
  .insert({
    user_id: userId,
    order_number: 'ORD-001',
    customer_id: customerId,
    // ... その他のフィールド
  });

// 明細も同時に登録
const { data: items, error: itemsError } = await supabase
  .from('order_items')
  .insert([
    { order_id: orderId, product_id: p1, quantity: 2, ... },
    { order_id: orderId, product_id: p2, quantity: 1, ... },
  ]);
```

#### 6.3.4 受注ステータス更新
```typescript
const { data, error } = await supabase
  .from('orders')
  .update({
    status: 'shipped',
    tracking_number: '1234567890'
  })
  .eq('id', orderId);
```

---

### 6.4 送料計算API

#### 6.4.1 送料モード取得
```typescript
const { data, error } = await supabase
  .from('shipping_mode_settings')
  .select('mode')
  .eq('user_id', userId)
  .single();
```

#### 6.4.2 全国一律料金取得
```typescript
const { data, error } = await supabase
  .from('shipping_rates')
  .select('*')
  .eq('user_id', userId)
  .eq('carrier', carrier)
  .eq('size', size)
  .single();
```

#### 6.4.3 都道府県別料金取得
```typescript
const { data, error } = await supabase
  .from('prefecture_shipping_rates')
  .select('*')
  .eq('user_id', userId)
  .eq('carrier', carrier)
  .eq('size', size)
  .eq('prefecture', prefecture)
  .single();
```

#### 6.4.4 ゾーン別料金取得
```typescript
// 1. 都道府県からゾーンを取得
const { data: prefZone } = await supabase
  .from('prefecture_zones')
  .select('zone_id, shipping_zones(user_id)')
  .eq('prefecture', prefecture)
  .single();

// 2. ゾーン料金を取得
const { data: zoneRate } = await supabase
  .from('zone_shipping_rates')
  .select('*')
  .eq('zone_id', prefZone.zone_id)
  .eq('carrier', carrier)
  .eq('size', size)
  .single();
```

---

### 6.5 公開注文API

#### 6.5.1 公開フォーム取得
```typescript
const { data, error } = await supabase
  .from('public_order_forms')
  .select('*')
  .eq('slug', slug)
  .eq('is_active', true)
  .single();
```

#### 6.5.2 公開注文作成
```typescript
const { data, error } = await supabase
  .from('public_orders')
  .insert({
    form_id: formId,
    user_id: farmerId,
    order_number: 'PUB-001',
    customer_name: '顧客名',
    customer_email: 'customer@example.com',
    // ... その他のフィールド
  });
```

---

## 7. カスタムフック

### 7.1 useAuth
認証状態の管理。

**機能**:
- ログイン・サインアップ
- ログアウト
- セッション管理
- ユーザー情報取得

**戻り値**:
```typescript
{
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
```

---

### 7.2 useCustomers
顧客管理。

**機能**:
- 顧客一覧取得
- 顧客登録・更新・削除
- React Query によるキャッシング

**戻り値**:
```typescript
{
  customers: Customer[];
  isLoading: boolean;
  error: Error | null;
  addCustomer: (customer: CustomerInput) => Promise<void>;
  updateCustomer: (id: string, customer: CustomerInput) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}
```

---

### 7.3 useOrders
受注管理。

**機能**:
- 受注一覧取得
- 受注詳細取得
- 受注登録・更新・削除
- ステータス更新

**戻り値**:
```typescript
{
  orders: Order[];
  isLoading: boolean;
  error: Error | null;
  getOrder: (id: string) => Promise<Order>;
  addOrder: (order: OrderInput) => Promise<void>;
  updateOrder: (id: string, order: OrderInput) => Promise<void>;
  updateStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
}
```

---

### 7.4 useProducts
商品管理。

**機能**:
- 商品一覧取得
- 商品登録・更新・削除
- バリエーション管理

**戻り値**:
```typescript
{
  products: Product[];
  isLoading: boolean;
  error: Error | null;
  addProduct: (product: ProductInput) => Promise<void>;
  updateProduct: (id: string, product: ProductInput) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}
```

---

### 7.5 useShippingCalculation
送料計算。

**機能**:
- 送料計算モード取得
- 送料計算
- 荷合いルール適用

**戻り値**:
```typescript
{
  calculateShipping: (params: ShippingParams) => Promise<number>;
  shippingMode: ShippingMode;
  isLoading: boolean;
}
```

**使用例**:
```typescript
const { calculateShipping } = useShippingCalculation();

const shippingFee = await calculateShipping({
  prefecture: '東京都',
  size: 80,
  carrier: 'yamato',
  isCool: false
});
```

---

### 7.6 useShippingSettings
送料設定管理。

**機能**:
- 送料モード設定
- 料金マスタ管理
- ゾーン管理

**戻り値**:
```typescript
{
  shippingMode: ShippingMode;
  setShippingMode: (mode: ShippingMode) => Promise<void>;
  rates: ShippingRate[];
  updateRate: (rate: ShippingRateInput) => Promise<void>;
  zones: ShippingZone[];
  updateZone: (zone: ShippingZoneInput) => Promise<void>;
}
```

---

### 7.7 usePublicOrderForm
公開注文フォーム管理。

**機能**:
- フォーム設定取得・更新
- 公開注文取得
- 公開注文作成 (顧客側)

**戻り値**:
```typescript
{
  form: PublicOrderForm | null;
  isLoading: boolean;
  orders: PublicOrder[];
  createOrder: (order: PublicOrderInput) => Promise<void>;
  updateFormSettings: (settings: FormSettings) => Promise<void>;
}
```

---

## 8. 画面設計

### 8.1 画面遷移図

```
/login (ログイン)
    ↓
/ (ダッシュボード)
    ├─ /customers (顧客一覧)
    ├─ /orders (受注一覧)
    │     └─ /orders/:id (受注詳細)
    ├─ /shipping (配送一覧)
    │     └─ /shipping/import (配送インポート)
    ├─ /work-logs (作業日誌)
    │     ├─ /work-logs/manual (手動入力)
    │     ├─ /work-logs/chat (AI入力)
    │     ├─ /work-logs/list (一覧)
    │     └─ /work-logs/:id (詳細)
    └─ /settings (設定)

/order/:slug (公開注文フォーム) ← 認証不要
```

---

### 8.2 主要画面レイアウト

#### 8.2.1 共通レイアウト
- **ヘッダー**: ロゴ、農園名、ユーザーメニュー
- **サイドナビゲーション**: 主要機能へのリンク
  - ダッシュボード
  - 顧客管理
  - 受注管理
  - 配送管理
  - 作業日誌
  - 設定
- **メインコンテンツ**: ページごとの内容
- **レスポンシブ**: モバイルではハンバーガーメニュー

#### 8.2.2 ダッシュボード
- **上部**: KPI カード (売上、顧客数、受注件数)
- **中央**: 売上グラフ (月次推移)
- **下部**: 商品別売上ランキング、最近の注文

#### 8.2.3 顧客一覧
- **検索バー**: 名前・メールで検索
- **フィルター**: 購入金額範囲
- **テーブル**: 顧客名、メール、電話、購入金額、アクション
- **ページネーション**
- **追加ボタン**: モーダル表示

#### 8.2.4 受注一覧
- **フィルター**: ステータス、日付範囲
- **テーブル**: 注文番号、注文日、顧客名、金額、ステータス、アクション
- **ページネーション**
- **追加ボタン**: 新規受注画面へ遷移

#### 8.2.5 受注詳細
- **ヘッダー**: 注文番号、ステータスバッジ
- **顧客情報**: 名前、連絡先、配送先
- **注文明細**: テーブル (商品、数量、単価、小計)
- **金額サマリー**: 商品合計、送料、合計金額
- **配送情報**: 配送業者、追跡番号、配送日
- **アクション**: 編集、ステータス変更、削除

#### 8.2.6 公開注文フォーム
- **ヘッダー**: 農園ロゴ、農園名
- **商品一覧**: カード形式、画像・名前・価格・カート追加ボタン
- **カート**: サイドバー、商品リスト、数量変更、削除
- **配送先入力**: フォーム (複数配送先対応)
- **送料表示**: 自動計算された送料
- **決済**: Stripe決済フォーム (想定)
- **注文確定**: 確認画面 → 完了画面

---

## 9. セキュリティ

### 9.1 認証
- Supabase Auth によるメール・パスワード認証
- セッション管理 (JWT)
- HTTPS通信

### 9.2 データアクセス制御
- Row Level Security (RLS) による行レベルセキュリティ
- ユーザーは自分のデータのみアクセス可能
- 公開注文フォームは特別なRLSポリシー

### 9.3 入力バリデーション
- フロントエンド: Zod スキーマによるバリデーション
- バックエンド: PostgreSQL 制約 (NOT NULL, UNIQUE, FK)

### 9.4 XSS対策
- React の自動エスケープ
- dangerouslySetInnerHTML の使用禁止

### 9.5 CSRF対策
- Supabase Client のトークンベース認証

### 9.6 SQLインジェクション対策
- Supabase Client のプリペアドステートメント

---

## 10. パフォーマンス

### 10.1 データベース最適化
- 適切なインデックス設定
  - `user_id` (全テーブル)
  - `order_date`, `status` (orders)
  - `work_date` (work_logs)
- 非正規化によるJOIN削減
  - orders テーブルに customer_name を保持

### 10.2 フロントエンド最適化
- React Query によるデータキャッシング
- コンポーネントの遅延ロード (React.lazy)
- 画像の最適化・遅延読み込み

### 10.3 API最適化
- 必要なカラムのみ SELECT
- ページネーション実装
- N+1問題の回避 (Supabase の JOIN 活用)

---

## 11. 拡張性

### 11.1 今後の拡張候補

#### 11.1.1 決済機能
- Stripe Payment Intent の本格実装
- 請求書発行・管理
- 入金管理

#### 11.1.2 在庫管理
- 商品バリエーションの在庫連動
- 在庫アラート
- 入出庫履歴

#### 11.1.3 配送業者API連携
- ヤマト運輸 B2 Cloud API
- 佐川急便 e飛伝III
- 送り状の自動出力

#### 11.1.4 分析機能
- 売上分析ダッシュボード
- 顧客分析 (RFM分析)
- 商品別収益性分析

#### 11.1.5 通知機能
- メール通知 (注文受付、発送完了)
- プッシュ通知
- LINE連携

#### 11.1.6 モバイルアプリ
- React Native によるモバイルアプリ化
- オフライン対応

---

## 12. 運用

### 12.1 デプロイ
- **ホスティング**: Vercel, Netlify 等
- **データベース**: Supabase マネージドサービス
- **ビルド**: Vite による最適化ビルド

### 12.2 バックアップ
- Supabase の自動バックアップ機能
- 定期的なデータエクスポート

### 12.3 モニタリング
- Supabase Dashboard でのアクセス監視
- エラーログ監視

### 12.4 アップデート
- Git によるバージョン管理
- CI/CD パイプライン構築 (GitHub Actions 等)

---

## 13. デモ環境

### 13.1 デモデータ
`supabase/seed-demo-data.sql` にデモデータを用意。

**含まれるデータ**:
- サンプル顧客 (10件)
- サンプル商品 (5件)
- サンプル受注 (20件)
- 送料設定 (全モード)
- 作業日誌 (30件)

### 13.2 セットアップ手順
1. Supabase プロジェクト作成
2. スキーマ適用 (`supabase-schema.sql`)
3. 送料機能拡張 (`supabase-shipping-enhancement.sql`)
4. 公開注文機能追加 (`supabase-public-order-schema.sql`)
5. デモデータ投入 (`supabase/seed-demo-data.sql`)
6. 環境変数設定 (`.env`)
7. `npm install && npm run dev`

詳細は [DEMO_SETUP.md](DEMO_SETUP.md) を参照。

---

## 14. 用語集

| 用語 | 説明 |
|-----|-----|
| 農家 | システムを利用する農園経営者 |
| 顧客 | 農作物を購入する個人・法人 |
| 配送先 | 顧客ごとの複数の配送先住所 |
| 受注 | 顧客からの注文 |
| 公開注文フォーム | 認証不要で顧客が注文できるフォーム |
| 荷合い | 複数個口を1つにまとめて送料最適化 |
| クール便 | 冷蔵・冷凍配送 |
| RLS | Row Level Security (行レベルセキュリティ) |
| バリエーション | 商品のサイズ・重量別の種類 |
| 作業日誌 | 農作業の記録 (圃場、作業内容、収穫物等) |

---

## 15. 変更履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|-----|-----------|---------|-------|
| 2025-11-27 | 1.0 | 初版作成 | - |

---

## 16. 参考資料

- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**文書終了**
