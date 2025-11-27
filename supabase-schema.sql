-- ============================================
-- FarmShip Database Schema for Supabase
-- ============================================
-- このSQLファイルをSupabaseのSQLエディターで実行してください
--
-- 実行手順:
-- 1. Supabaseダッシュボードを開く (https://app.supabase.com/)
-- 2. プロジェクトを選択
-- 3. 左メニューから「SQL Editor」を選択
-- 4. 「New query」をクリック
-- 5. このファイルの内容をコピー&ペースト
-- 6. 「Run」をクリック
-- ============================================

-- ============================================
-- 1. プロフィールテーブル (Profiles)
-- ============================================
-- ユーザーの基本情報と農園情報を保存
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  farm_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  postal_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) を有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のプロフィールのみ閲覧可能
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- ポリシー: ユーザーは自分のプロフィールのみ作成可能
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ポリシー: ユーザーは自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 2. 顧客テーブル (Customers)
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  last_purchase_date DATE,
  total_spent NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックス
CREATE INDEX customers_user_id_idx ON customers(user_id);

-- RLS を有効化
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の顧客のみ操作可能
CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. 受取人テーブル (Recipients)
-- ============================================
-- 顧客ごとの配送先リスト
CREATE TABLE IF NOT EXISTS recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  relation TEXT, -- 関係性（友人、親戚、取引先など）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックス
CREATE INDEX recipients_user_id_idx ON recipients(user_id);
CREATE INDEX recipients_customer_id_idx ON recipients(customer_id);

-- RLS を有効化
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の受取人のみ操作可能
CREATE POLICY "Users can view own recipients" ON recipients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipients" ON recipients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipients" ON recipients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipients" ON recipients
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. 商品マスタテーブル (Products)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  is_parent BOOLEAN DEFAULT false, -- 親商品（バリエーションあり）かどうか
  -- 単品商品の場合のデータ
  price NUMERIC(10, 2),
  size TEXT, -- サイズ（60, 80, 100, 120, 140, 160）
  weight NUMERIC(10, 2),
  sku TEXT, -- 商品コード
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックス
CREATE INDEX products_user_id_idx ON products(user_id);
CREATE INDEX products_category_idx ON products(category);

-- RLS を有効化
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の商品のみ操作可能
CREATE POLICY "Users can view own products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. 商品バリエーションテーブル (Product Variants)
-- ============================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  parent_product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- バリエーション名（2kg、3個入りなど）
  price NUMERIC(10, 2) NOT NULL,
  size TEXT NOT NULL, -- サイズ（60, 80, 100, 120, 140, 160）
  weight NUMERIC(10, 2) NOT NULL,
  sku TEXT, -- 商品コード
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックス
CREATE INDEX product_variants_user_id_idx ON product_variants(user_id);
CREATE INDEX product_variants_parent_id_idx ON product_variants(parent_product_id);

-- RLS を有効化
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の商品バリエーションのみ操作可能
CREATE POLICY "Users can view own product_variants" ON product_variants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own product_variants" ON product_variants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own product_variants" ON product_variants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own product_variants" ON product_variants
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 6. 受注テーブル (Orders)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  order_number TEXT NOT NULL,
  order_date DATE NOT NULL,
  customer_id UUID REFERENCES customers(id) NOT NULL,
  customer_name TEXT NOT NULL, -- 非正規化（パフォーマンス向上のため）
  amount NUMERIC(10, 2) NOT NULL,
  delivery_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('未発送', '発送済み', '配達完了', 'キャンセル')),
  shipping_company TEXT,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, order_number)
);

-- インデックス
CREATE INDEX orders_user_id_idx ON orders(user_id);
CREATE INDEX orders_customer_id_idx ON orders(customer_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_order_date_idx ON orders(order_date);

-- RLS を有効化
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の受注のみ操作可能
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders" ON orders
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 7. 受注商品テーブル (Order Items)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL, -- 非正規化
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックス
CREATE INDEX order_items_user_id_idx ON order_items(user_id);
CREATE INDEX order_items_order_id_idx ON order_items(order_id);

-- RLS を有効化
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の受注商品のみ操作可能
CREATE POLICY "Users can view own order_items" ON order_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own order_items" ON order_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own order_items" ON order_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own order_items" ON order_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 8. 配送料金設定テーブル (Shipping Rates)
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  carrier TEXT NOT NULL CHECK (carrier IN ('yamato', 'sagawa', 'yupack')),
  size TEXT NOT NULL CHECK (size IN ('60', '80', '100', '120', '140', '160')),
  base_price NUMERIC(10, 2) NOT NULL,
  cool_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, carrier, size)
);

-- インデックス
CREATE INDEX shipping_rates_user_id_idx ON shipping_rates(user_id);
CREATE INDEX shipping_rates_carrier_idx ON shipping_rates(carrier);

-- RLS を有効化
ALTER TABLE shipping_rates ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の配送料金設定のみ操作可能
CREATE POLICY "Users can view own shipping_rates" ON shipping_rates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shipping_rates" ON shipping_rates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shipping_rates" ON shipping_rates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shipping_rates" ON shipping_rates
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 9. 荷合いルールテーブル (Consolidation Rules)
-- ============================================
CREATE TABLE IF NOT EXISTS consolidation_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  from_size TEXT NOT NULL CHECK (from_size IN ('60', '80', '100', '120', '140', '160')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  to_size TEXT NOT NULL CHECK (to_size IN ('60', '80', '100', '120', '140', '160')),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックス
CREATE INDEX consolidation_rules_user_id_idx ON consolidation_rules(user_id);

-- RLS を有効化
ALTER TABLE consolidation_rules ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の荷合いルールのみ操作可能
CREATE POLICY "Users can view own consolidation_rules" ON consolidation_rules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consolidation_rules" ON consolidation_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consolidation_rules" ON consolidation_rules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own consolidation_rules" ON consolidation_rules
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 10. トリガー関数: updated_at の自動更新
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipients_updated_at BEFORE UPDATE ON recipients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_rates_updated_at BEFORE UPDATE ON shipping_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consolidation_rules_updated_at BEFORE UPDATE ON consolidation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 完了!
-- ============================================
-- 実行が完了したら、Supabaseダッシュボードの
-- 「Table Editor」で各テーブルが作成されているか確認してください。
