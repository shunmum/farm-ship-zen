-- ============================================
-- 公開注文フォーム用のテーブル追加
-- ============================================
-- supabase-schema.sql を実行した後に、このファイルを実行してください
--
-- 実行手順:
-- 1. Supabaseダッシュボードを開く
-- 2. SQL Editorを選択
-- 3. New queryをクリック
-- 4. このファイルの内容をコピー&ペースト
-- 5. Runをクリック
-- ============================================

-- ============================================
-- 1. 公開注文フォーム設定テーブル
-- ============================================
-- 各ユーザー(農家)ごとの注文フォーム設定
CREATE TABLE IF NOT EXISTS public_order_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  form_url_slug TEXT NOT NULL UNIQUE, -- URLスラッグ (例: yamada-farm)
  farm_display_name TEXT NOT NULL, -- 表示用の農園名
  welcome_message TEXT, -- ウェルカムメッセージ
  is_active BOOLEAN DEFAULT true, -- フォーム有効/無効
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックス
CREATE INDEX public_order_forms_user_id_idx ON public_order_forms(user_id);
CREATE INDEX public_order_forms_slug_idx ON public_order_forms(form_url_slug);

-- RLS を有効化
ALTER TABLE public_order_forms ENABLE ROW LEVEL SECURITY;

-- ポリシー: 誰でも有効なフォーム設定を閲覧可能
CREATE POLICY "Anyone can view active forms" ON public_order_forms
  FOR SELECT USING (is_active = true);

-- ポリシー: ユーザーは自分のフォーム設定のみ作成・更新・削除可能
CREATE POLICY "Users can insert own form" ON public_order_forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own form" ON public_order_forms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own form" ON public_order_forms
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 2. 公開注文テーブル
-- ============================================
-- 公開フォームから送信された注文
CREATE TABLE IF NOT EXISTS public_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES public_order_forms(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- 農家のユーザーID
  order_number TEXT NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  payment_intent_id TEXT, -- Stripe Payment Intent ID
  status TEXT NOT NULL CHECK (status IN ('未発送', '発送済み', '配達完了', 'キャンセル')) DEFAULT '未発送',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, order_number)
);

-- インデックス
CREATE INDEX public_orders_form_id_idx ON public_orders(form_id);
CREATE INDEX public_orders_user_id_idx ON public_orders(user_id);
CREATE INDEX public_orders_created_at_idx ON public_orders(created_at);

-- RLS を有効化
ALTER TABLE public_orders ENABLE ROW LEVEL SECURITY;

-- ポリシー: 誰でも公開注文を作成可能（認証不要）
CREATE POLICY "Anyone can insert public orders" ON public_orders
  FOR INSERT WITH CHECK (true);

-- ポリシー: ユーザーは自分の公開注文のみ閲覧・更新・削除可能
CREATE POLICY "Users can view own public orders" ON public_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own public orders" ON public_orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own public orders" ON public_orders
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. 公開注文の送り先テーブル
-- ============================================
-- 1つの注文に複数の送り先が含まれる
CREATE TABLE IF NOT EXISTS public_order_recipients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  public_order_id UUID REFERENCES public_orders(id) ON DELETE CASCADE NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_postal_code TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  delivery_date DATE,
  shipping_company TEXT,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックス
CREATE INDEX public_order_recipients_order_id_idx ON public_order_recipients(public_order_id);

-- RLS を有効化
ALTER TABLE public_order_recipients ENABLE ROW LEVEL SECURITY;

-- ポリシー: 誰でも送り先を作成可能（注文作成時）
CREATE POLICY "Anyone can insert recipients" ON public_order_recipients
  FOR INSERT WITH CHECK (true);

-- ポリシー: 注文の所有者は送り先を閲覧・更新・削除可能
CREATE POLICY "Order owners can view recipients" ON public_order_recipients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public_orders
      WHERE public_orders.id = public_order_recipients.public_order_id
      AND public_orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Order owners can update recipients" ON public_order_recipients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public_orders
      WHERE public_orders.id = public_order_recipients.public_order_id
      AND public_orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Order owners can delete recipients" ON public_order_recipients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public_orders
      WHERE public_orders.id = public_order_recipients.public_order_id
      AND public_orders.user_id = auth.uid()
    )
  );

-- ============================================
-- 4. 公開注文の商品明細テーブル
-- ============================================
-- 各送り先ごとの商品と数量
CREATE TABLE IF NOT EXISTS public_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  public_order_id UUID REFERENCES public_orders(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES public_order_recipients(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id),
  product_variant_id UUID REFERENCES product_variants(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックス
CREATE INDEX public_order_items_order_id_idx ON public_order_items(public_order_id);
CREATE INDEX public_order_items_recipient_id_idx ON public_order_items(recipient_id);

-- RLS を有効化
ALTER TABLE public_order_items ENABLE ROW LEVEL SECURITY;

-- ポリシー: 誰でも商品明細を作成可能（注文作成時）
CREATE POLICY "Anyone can insert order items" ON public_order_items
  FOR INSERT WITH CHECK (true);

-- ポリシー: 注文の所有者は商品明細を閲覧・更新・削除可能
CREATE POLICY "Order owners can view items" ON public_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public_orders
      WHERE public_orders.id = public_order_items.public_order_id
      AND public_orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Order owners can update items" ON public_order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public_orders
      WHERE public_orders.id = public_order_items.public_order_id
      AND public_orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Order owners can delete items" ON public_order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public_orders
      WHERE public_orders.id = public_order_items.public_order_id
      AND public_orders.user_id = auth.uid()
    )
  );

-- ============================================
-- トリガー: updated_at の自動更新
-- ============================================
CREATE TRIGGER update_public_order_forms_updated_at BEFORE UPDATE ON public_order_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_public_orders_updated_at BEFORE UPDATE ON public_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 完了!
-- ============================================
-- 実行が完了したら、Table Editorで以下のテーブルが作成されているか確認してください:
-- - public_order_forms
-- - public_orders
-- - public_order_recipients
-- - public_order_items
