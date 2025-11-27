-- ============================================
-- 送料計算機能の拡張
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
-- 1. 送料計算モード設定テーブル
-- ============================================
-- ユーザーがどの方式で送料を計算するかを保存
CREATE TABLE IF NOT EXISTS shipping_mode_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  mode TEXT NOT NULL CHECK (mode IN ('flat_rate', 'prefecture', 'zone')) DEFAULT 'flat_rate',
  -- flat_rate: 全国一律（現在の方式）
  -- prefecture: 都道府県別料金
  -- zone: ゾーン制
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックス
CREATE INDEX shipping_mode_settings_user_id_idx ON shipping_mode_settings(user_id);

-- RLS を有効化
ALTER TABLE shipping_mode_settings ENABLE ROW LEVEL SECURITY;

-- ポリシー
CREATE POLICY "Users can view own shipping_mode_settings" ON shipping_mode_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shipping_mode_settings" ON shipping_mode_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shipping_mode_settings" ON shipping_mode_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shipping_mode_settings" ON shipping_mode_settings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 2. 配送ゾーンテーブル（オプション3用）
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL, -- 例: 関東、中部、関西、北海道・沖縄
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, name)
);

-- インデックス
CREATE INDEX shipping_zones_user_id_idx ON shipping_zones(user_id);

-- RLS を有効化
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;

-- ポリシー
CREATE POLICY "Users can view own shipping_zones" ON shipping_zones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shipping_zones" ON shipping_zones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shipping_zones" ON shipping_zones
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shipping_zones" ON shipping_zones
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. 都道府県・ゾーンマッピングテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS prefecture_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  prefecture TEXT NOT NULL, -- 都道府県名（例: 東京都、北海道）
  zone_id UUID REFERENCES shipping_zones(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, prefecture)
);

-- インデックス
CREATE INDEX prefecture_zones_user_id_idx ON prefecture_zones(user_id);
CREATE INDEX prefecture_zones_zone_id_idx ON prefecture_zones(zone_id);
CREATE INDEX prefecture_zones_prefecture_idx ON prefecture_zones(prefecture);

-- RLS を有効化
ALTER TABLE prefecture_zones ENABLE ROW LEVEL SECURITY;

-- ポリシー
CREATE POLICY "Users can view own prefecture_zones" ON prefecture_zones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prefecture_zones" ON prefecture_zones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prefecture_zones" ON prefecture_zones
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prefecture_zones" ON prefecture_zones
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. ゾーン別配送料金テーブル（オプション3用）
-- ============================================
CREATE TABLE IF NOT EXISTS zone_shipping_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  zone_id UUID REFERENCES shipping_zones(id) ON DELETE CASCADE NOT NULL,
  carrier TEXT NOT NULL CHECK (carrier IN ('yamato', 'sagawa', 'yupack')),
  size TEXT NOT NULL CHECK (size IN ('60', '80', '100', '120', '140', '160')),
  base_price NUMERIC(10, 2) NOT NULL,
  cool_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, zone_id, carrier, size)
);

-- インデックス
CREATE INDEX zone_shipping_rates_user_id_idx ON zone_shipping_rates(user_id);
CREATE INDEX zone_shipping_rates_zone_id_idx ON zone_shipping_rates(zone_id);
CREATE INDEX zone_shipping_rates_carrier_idx ON zone_shipping_rates(carrier);

-- RLS を有効化
ALTER TABLE zone_shipping_rates ENABLE ROW LEVEL SECURITY;

-- ポリシー
CREATE POLICY "Users can view own zone_shipping_rates" ON zone_shipping_rates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own zone_shipping_rates" ON zone_shipping_rates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own zone_shipping_rates" ON zone_shipping_rates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own zone_shipping_rates" ON zone_shipping_rates
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. 都道府県別配送料金テーブル（オプション2用）
-- ============================================
CREATE TABLE IF NOT EXISTS prefecture_shipping_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  prefecture TEXT NOT NULL, -- 都道府県名
  carrier TEXT NOT NULL CHECK (carrier IN ('yamato', 'sagawa', 'yupack')),
  size TEXT NOT NULL CHECK (size IN ('60', '80', '100', '120', '140', '160')),
  base_price NUMERIC(10, 2) NOT NULL,
  cool_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, prefecture, carrier, size)
);

-- インデックス
CREATE INDEX prefecture_shipping_rates_user_id_idx ON prefecture_shipping_rates(user_id);
CREATE INDEX prefecture_shipping_rates_prefecture_idx ON prefecture_shipping_rates(prefecture);
CREATE INDEX prefecture_shipping_rates_carrier_idx ON prefecture_shipping_rates(carrier);

-- RLS を有効化
ALTER TABLE prefecture_shipping_rates ENABLE ROW LEVEL SECURITY;

-- ポリシー
CREATE POLICY "Users can view own prefecture_shipping_rates" ON prefecture_shipping_rates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prefecture_shipping_rates" ON prefecture_shipping_rates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prefecture_shipping_rates" ON prefecture_shipping_rates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prefecture_shipping_rates" ON prefecture_shipping_rates
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- トリガー: updated_at の自動更新
-- ============================================
CREATE TRIGGER update_shipping_mode_settings_updated_at BEFORE UPDATE ON shipping_mode_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_zones_updated_at BEFORE UPDATE ON shipping_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zone_shipping_rates_updated_at BEFORE UPDATE ON zone_shipping_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prefecture_shipping_rates_updated_at BEFORE UPDATE ON prefecture_shipping_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- デフォルトゾーンデータの挿入（参考用）
-- ============================================
-- ユーザーが新規登録した際に、デフォルトのゾーンを自動作成することもできます
-- 以下はサンプルデータで、実際の運用では不要です

-- 例: デフォルトのゾーン設定（関東、中部、関西、北海道・沖縄、その他）
-- INSERT INTO shipping_zones (user_id, name, display_order) VALUES
-- ('ユーザーID', '関東', 1),
-- ('ユーザーID', '中部', 2),
-- ('ユーザーID', '関西', 3),
-- ('ユーザーID', '北海道・沖縄', 4),
-- ('ユーザーID', 'その他', 5);

-- 都道府県リスト（47都道府県）
-- 北海道, 青森県, 岩手県, 宮城県, 秋田県, 山形県, 福島県,
-- 茨城県, 栃木県, 群馬県, 埼玉県, 千葉県, 東京都, 神奈川県,
-- 新潟県, 富山県, 石川県, 福井県, 山梨県, 長野県,
-- 岐阜県, 静岡県, 愛知県, 三重県,
-- 滋賀県, 京都府, 大阪府, 兵庫県, 奈良県, 和歌山県,
-- 鳥取県, 島根県, 岡山県, 広島県, 山口県,
-- 徳島県, 香川県, 愛媛県, 高知県,
-- 福岡県, 佐賀県, 長崎県, 熊本県, 大分県, 宮崎県, 鹿児島県, 沖縄県

-- ============================================
-- 完了!
-- ============================================
-- 実行が完了したら、Table Editorで以下のテーブルが作成されているか確認してください:
-- - shipping_mode_settings
-- - shipping_zones
-- - prefecture_zones
-- - zone_shipping_rates
-- - prefecture_shipping_rates
