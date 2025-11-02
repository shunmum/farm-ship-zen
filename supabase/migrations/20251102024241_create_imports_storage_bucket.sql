/*
  # インポートファイル用ストレージバケット

  1. ストレージバケット
    - `imports` バケットを作成
    - PDF、CSVファイルの保存用

  2. セキュリティ
    - RLSを有効化
    - ユーザーは自分のファイルのみアクセス可能
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imports',
  'imports',
  false,
  10485760,
  ARRAY['application/pdf', 'text/csv', 'application/vnd.ms-excel']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'imports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'imports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'imports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );