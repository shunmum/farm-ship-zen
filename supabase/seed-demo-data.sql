-- Demo Account Setup Script
-- This script creates a demo user and populates the database with sample data

-- Note: You'll need to create the demo user through Supabase Auth Dashboard first
-- Email: demo@farmship.example
-- Password: demo123456

-- Get the demo user ID (replace with actual UUID after creating the user)
-- You can find this in Supabase Dashboard > Authentication > Users
DO $$
DECLARE
  demo_user_id UUID := 'b3953e6e-ff5a-4bbd-983d-843884bd4797'; -- Will be replaced after user creation
  zone_kanto UUID;
  zone_chubu UUID;
  zone_kansai UUID;
  zone_hokkaido UUID;
  zone_kyushu UUID;
BEGIN

-- ===========================================
-- 1. Products (商品マスター)
-- ===========================================
INSERT INTO public.products (user_id, name, category, price) VALUES
(demo_user_id, 'トマト', '野菜', 500),
(demo_user_id, 'きゅうり', '野菜', 300),
(demo_user_id, 'なす', '野菜', 400),
(demo_user_id, 'レタス', '野菜', 250),
(demo_user_id, 'ほうれん草', '野菜', 350),
(demo_user_id, 'じゃがいも', '野菜', 200),
(demo_user_id, 'にんじん', '野菜', 250),
(demo_user_id, 'いちご', '果物', 1200);

-- ===========================================
-- 2. Customers (顧客)
-- ===========================================
INSERT INTO public.customers (user_id, name, postal_code, address, phone, email) VALUES
(demo_user_id, '田中商店', '100-0001', '東京都千代田区丸の内1-1-1 オフィスビル3F', '03-1234-5678', 'tanaka@example.com'),
(demo_user_id, '山田青果', '530-0001', '大阪府大阪市北区梅田2-2-2', '06-2345-6789', 'yamada@example.com'),
(demo_user_id, '佐藤太郎', '150-0001', '東京都渋谷区神宮前3-3-3 マンション201', '090-1234-5678', 'sato@example.com'),
(demo_user_id, '鈴木農園', '060-0001', '北海道札幌市中央区北1条4-4-4', '011-3456-7890', 'suzuki@example.com'),
(demo_user_id, '高橋レストラン', '810-0001', '福岡県福岡市中央区天神5-5-5 レストラン棟', '092-4567-8901', 'takahashi@example.com');

-- ===========================================
-- 3. Work Logs (作業日誌) - 2024年のデータ
-- ===========================================
-- Note: work_logs table may not exist yet. Uncomment below if table is created.

INSERT INTO public.work_logs (user_id, log_date, field, work_details, harvest_items, materials_used, input_type) VALUES
-- 1月
(demo_user_id, '2024-01-10', '第1圃場', '冬野菜の収穫。霜が降りていたため午前10時から作業開始。', 'ほうれん草 15kg、にんじん 20kg', NULL, 'manual'),
(demo_user_id, '2024-01-15', '第2圃場', 'ハウス内の温度管理。夜間の冷え込み対策として二重カーテンを設置。', NULL, 'ビニールカーテン 50m', 'manual'),
(demo_user_id, '2024-01-25', '第1圃場', '春野菜の準備。土壌改良のため堆肥を投入。', NULL, '堆肥 300kg', 'manual'),

-- 2月
(demo_user_id, '2024-02-05', '第3圃場', 'じゃがいもの植え付け準備。畝立てと黒マルチ敷設。', NULL, '黒マルチ 100m', 'manual'),
(demo_user_id, '2024-02-14', 'ハウス1', 'トマトの苗の定植。150株を定植完了。', NULL, 'トマト苗 150株', 'ai_chat'),
(demo_user_id, '2024-02-20', '第2圃場', 'レタスの種まき。春出荷用の栽培開始。', NULL, 'レタス種 2袋', 'manual'),

-- 3月
(demo_user_id, '2024-03-08', '第3圃場', 'じゃがいもの植え付け。メークイン500kgを植え付け。', NULL, 'じゃがいも種芋 500kg', 'manual'),
(demo_user_id, '2024-03-15', 'ハウス1', 'トマトの誘引作業。生育が順調で第1花房が開花。', NULL, '誘引紐 200m', 'ai_chat'),
(demo_user_id, '2024-03-22', '第1圃場', 'ほうれん草の収穫と出荷準備。', 'ほうれん草 25kg', NULL, 'manual'),

-- 4月
(demo_user_id, '2024-04-05', '第2圃場', 'レタスの定植。ポット苗500株を定植。', NULL, 'レタス苗 500株', 'manual'),
(demo_user_id, '2024-04-12', 'ハウス1', 'トマトの追肥。液肥を施用。', NULL, '液肥 10L', 'ai_chat'),
(demo_user_id, '2024-04-20', '第3圃場', 'じゃがいもの芽かき作業。1株2本立ちに整理。', NULL, NULL, 'manual'),
(demo_user_id, '2024-04-28', '第1圃場', 'きゅうりの定植。200株を定植完了。', NULL, 'きゅうり苗 200株', 'manual'),

-- 5月
(demo_user_id, '2024-05-03', 'ハウス1', 'トマトの収穫開始！初収穫で品質良好。', 'トマト 30kg', NULL, 'ai_chat'),
(demo_user_id, '2024-05-10', '第2圃場', 'レタスの収穫。出荷適期で品質◎', 'レタス 200個', NULL, 'manual'),
(demo_user_id, '2024-05-17', '第1圃場', 'きゅうりの初収穫。順調な生育。', 'きゅうり 15kg', NULL, 'manual'),
(demo_user_id, '2024-05-25', '第3圃場', 'じゃがいもの追肥と土寄せ作業。', NULL, '化成肥料 50kg', 'manual'),

-- 6月
(demo_user_id, '2024-06-02', 'ハウス1', 'トマトの収穫。今週は収量が増加傾向。', 'トマト 55kg', NULL, 'ai_chat'),
(demo_user_id, '2024-06-08', '第1圃場', 'きゅうりの収穫と誘引作業。', 'きゅうり 35kg', '誘引紐 50m', 'manual'),
(demo_user_id, '2024-06-15', 'ハウス2', 'なすの定植。夏野菜の準備。', NULL, 'なす苗 150株', 'manual'),
(demo_user_id, '2024-06-22', '第3圃場', 'じゃがいもの試し掘り。サイズ確認。', 'じゃがいも 5kg（試し掘り）', NULL, 'manual'),

-- 7月
(demo_user_id, '2024-07-05', '第3圃場', 'じゃがいもの本格収穫開始！天候に恵まれ品質良好。', 'じゃがいも 850kg', NULL, 'manual'),
(demo_user_id, '2024-07-10', 'ハウス1', 'トマトの収穫ピーク。暑さ対策で遮光ネット設置。', 'トマト 80kg', '遮光ネット 50m', 'ai_chat'),
(demo_user_id, '2024-07-18', '第1圃場', 'きゅうりの収穫。毎日収穫が必要な時期。', 'きゅうり 45kg', NULL, 'manual'),
(demo_user_id, '2024-07-25', 'ハウス2', 'なすの初収穫。形も良く上々の出来。', 'なす 20kg', NULL, 'manual'),

-- 8月
(demo_user_id, '2024-08-03', 'ハウス1', 'トマトの収穫継続。暑さで収量やや減少。', 'トマト 65kg', NULL, 'ai_chat'),
(demo_user_id, '2024-08-10', '第1圃場', 'きゅうりの追肥と病害虫防除。', 'きゅうり 38kg', '液肥 5L、農薬 500ml', 'manual'),
(demo_user_id, '2024-08-17', 'ハウス2', 'なすの収穫。夏場のピーク時期。', 'なす 42kg', NULL, 'manual'),
(demo_user_id, '2024-08-24', '第2圃場', '秋冬野菜の準備。土壌改良作業。', NULL, '堆肥 250kg、石灰 30kg', 'manual'),

-- 9月
(demo_user_id, '2024-09-05', 'ハウス1', 'トマトの収穫。朝晩涼しくなり品質向上。', 'トマト 72kg', NULL, 'ai_chat'),
(demo_user_id, '2024-09-12', '第2圃場', 'ほうれん草の種まき。秋冬出荷用。', NULL, 'ほうれん草種 3袋', 'manual'),
(demo_user_id, '2024-09-20', 'ハウス2', 'なすの収穫継続。秋なすは美味しい時期。', 'なす 35kg', NULL, 'manual'),
(demo_user_id, '2024-09-28', '第1圃場', 'きゅうりの片付け。夏野菜終了。', NULL, NULL, 'manual'),

-- 10月
(demo_user_id, '2024-10-06', 'ハウス1', 'トマトの収穫。秋の味覚、糖度高め。', 'トマト 68kg', NULL, 'ai_chat'),
(demo_user_id, '2024-10-13', '第2圃場', 'ほうれん草の間引き作業。', NULL, NULL, 'manual'),
(demo_user_id, '2024-10-20', 'いちごハウス', 'いちごの苗定植。来春の収穫に向けて。', NULL, 'いちご苗 1000株', 'manual'),
(demo_user_id, '2024-10-27', 'ハウス2', 'なすの最終収穫。夏野菜終了。', 'なす 28kg', NULL, 'manual'),

-- 11月
(demo_user_id, '2024-11-05', '第2圃場', 'ほうれん草の収穫開始。', 'ほうれん草 18kg', NULL, 'manual'),
(demo_user_id, '2024-11-12', 'ハウス1', 'トマトの収穫継続。ハウス内温度管理開始。', 'トマト 52kg', NULL, 'ai_chat'),
(demo_user_id, '2024-11-20', 'いちごハウス', 'いちごの花芽確認。順調な生育。', NULL, NULL, 'manual'),
(demo_user_id, '2024-11-28', '第1圃場', '冬野菜の種まき。にんじん、大根など。', NULL, 'にんじん種 2袋、大根種 1袋', 'manual'),

-- 12月
(demo_user_id, '2024-12-05', 'ハウス1', 'トマトの収穫。寒さ対策として二重カーテン設置。', 'トマト 48kg', 'ビニールカーテン 60m', 'ai_chat'),
(demo_user_id, '2024-12-12', '第2圃場', 'ほうれん草の収穫。霜に当たり甘み増加。', 'ほうれん草 22kg', NULL, 'manual'),
(demo_user_id, '2024-12-20', 'いちごハウス', 'いちごの初収穫！クリスマス需要に向けて。', 'いちご 3kg', NULL, 'ai_chat');


-- ===========================================
-- 4. Shipping Settings - Zones
-- ===========================================
-- Note: Shipping tables may not exist yet. Uncomment below if tables are created.

-- Create shipping mode setting
INSERT INTO public.shipping_mode_settings (user_id, mode) VALUES
(demo_user_id, 'zone');

-- Create shipping zones
INSERT INTO public.shipping_zones (user_id, name, display_order) VALUES
(demo_user_id, '関東', 1) RETURNING id INTO zone_kanto;

INSERT INTO public.shipping_zones (user_id, name, display_order) VALUES
(demo_user_id, '中部', 2) RETURNING id INTO zone_chubu;

INSERT INTO public.shipping_zones (user_id, name, display_order) VALUES
(demo_user_id, '関西', 3) RETURNING id INTO zone_kansai;

INSERT INTO public.shipping_zones (user_id, name, display_order) VALUES
(demo_user_id, '北海道・東北', 4) RETURNING id INTO zone_hokkaido;

INSERT INTO public.shipping_zones (user_id, name, display_order) VALUES
(demo_user_id, '九州・沖縄', 5) RETURNING id INTO zone_kyushu;

-- Assign prefectures to zones
-- 関東
INSERT INTO public.prefecture_zones (user_id, prefecture, zone_id) VALUES
(demo_user_id, '東京都', zone_kanto),
(demo_user_id, '神奈川県', zone_kanto),
(demo_user_id, '千葉県', zone_kanto),
(demo_user_id, '埼玉県', zone_kanto),
(demo_user_id, '茨城県', zone_kanto),
(demo_user_id, '栃木県', zone_kanto),
(demo_user_id, '群馬県', zone_kanto);

-- 中部
INSERT INTO public.prefecture_zones (user_id, prefecture, zone_id) VALUES
(demo_user_id, '愛知県', zone_chubu),
(demo_user_id, '静岡県', zone_chubu),
(demo_user_id, '岐阜県', zone_chubu),
(demo_user_id, '三重県', zone_chubu),
(demo_user_id, '長野県', zone_chubu),
(demo_user_id, '新潟県', zone_chubu),
(demo_user_id, '山梨県', zone_chubu);

-- 関西
INSERT INTO public.prefecture_zones (user_id, prefecture, zone_id) VALUES
(demo_user_id, '大阪府', zone_kansai),
(demo_user_id, '京都府', zone_kansai),
(demo_user_id, '兵庫県', zone_kansai),
(demo_user_id, '奈良県', zone_kansai),
(demo_user_id, '滋賀県', zone_kansai),
(demo_user_id, '和歌山県', zone_kansai);

-- 北海道・東北
INSERT INTO public.prefecture_zones (user_id, prefecture, zone_id) VALUES
(demo_user_id, '北海道', zone_hokkaido),
(demo_user_id, '青森県', zone_hokkaido),
(demo_user_id, '岩手県', zone_hokkaido),
(demo_user_id, '宮城県', zone_hokkaido),
(demo_user_id, '秋田県', zone_hokkaido),
(demo_user_id, '山形県', zone_hokkaido),
(demo_user_id, '福島県', zone_hokkaido);

-- 九州・沖縄
INSERT INTO public.prefecture_zones (user_id, prefecture, zone_id) VALUES
(demo_user_id, '福岡県', zone_kyushu),
(demo_user_id, '佐賀県', zone_kyushu),
(demo_user_id, '長崎県', zone_kyushu),
(demo_user_id, '熊本県', zone_kyushu),
(demo_user_id, '大分県', zone_kyushu),
(demo_user_id, '宮崎県', zone_kyushu),
(demo_user_id, '鹿児島県', zone_kyushu),
(demo_user_id, '沖縄県', zone_kyushu);

-- Zone shipping rates (ヤマト運輸の例)
INSERT INTO public.zone_shipping_rates (user_id, zone_id, carrier, size, base_price, cool_price) VALUES
-- 関東
(demo_user_id, zone_kanto, 'yamato', '60', 800, 220),
(demo_user_id, zone_kanto, 'yamato', '80', 1000, 220),
(demo_user_id, zone_kanto, 'yamato', '100', 1200, 220),
(demo_user_id, zone_kanto, 'yamato', '120', 1400, 330),
(demo_user_id, zone_kanto, 'yamato', '140', 1600, 330),
(demo_user_id, zone_kanto, 'yamato', '160', 1800, 330),

-- 中部
(demo_user_id, zone_chubu, 'yamato', '60', 900, 220),
(demo_user_id, zone_chubu, 'yamato', '80', 1100, 220),
(demo_user_id, zone_chubu, 'yamato', '100', 1300, 220),
(demo_user_id, zone_chubu, 'yamato', '120', 1500, 330),

-- 関西
(demo_user_id, zone_kansai, 'yamato', '60', 1000, 220),
(demo_user_id, zone_kansai, 'yamato', '80', 1200, 220),
(demo_user_id, zone_kansai, 'yamato', '100', 1400, 220),

-- 北海道・東北
(demo_user_id, zone_hokkaido, 'yamato', '60', 1500, 220),
(demo_user_id, zone_hokkaido, 'yamato', '80', 1700, 220),
(demo_user_id, zone_hokkaido, 'yamato', '100', 1900, 220),

-- 九州・沖縄
(demo_user_id, zone_kyushu, 'yamato', '60', 1300, 220),
(demo_user_id, zone_kyushu, 'yamato', '80', 1500, 220),
(demo_user_id, zone_kyushu, 'yamato', '100', 1700, 220);


END $$;
