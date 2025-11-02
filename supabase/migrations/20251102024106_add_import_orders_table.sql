/*
  # インポート注文管理テーブル

  1. 新規テーブル
    - `import_orders`
      - `id` (uuid, 主キー)
      - `user_id` (uuid, 外部キー)
      - `import_type` (text) - 'pdf' or 'csv'
      - `file_url` (text) - アップロードされたファイルのURL
      - `file_name` (text) - ファイル名
      - `status` (text) - 'pending', 'processing', 'completed', 'error'
      - `extracted_data` (jsonb) - 抽出されたデータ
      - `error_message` (text, nullable) - エラーメッセージ
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. セキュリティ
    - RLSを有効化
    - ユーザーは自分のインポートデータのみアクセス可能
*/

CREATE TABLE IF NOT EXISTS import_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  import_type text NOT NULL CHECK (import_type IN ('pdf', 'csv')),
  file_url text,
  file_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  extracted_data jsonb,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE import_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own imports"
  ON import_orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own imports"
  ON import_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own imports"
  ON import_orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own imports"
  ON import_orders
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_import_orders_user_id ON import_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_import_orders_status ON import_orders(status);
CREATE INDEX IF NOT EXISTS idx_import_orders_created_at ON import_orders(created_at DESC);