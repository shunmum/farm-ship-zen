// 環境変数のバリデーションとアクセサー

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * 環境変数を検証して取得する
 */
function getRequiredEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];

  if (!value || value.trim() === '') {
    throw new Error(
      `環境変数 ${key} が設定されていません。` +
      `.env ファイルを確認してください。`
    );
  }

  return value;
}

/**
 * Supabase URLを検証
 */
function validateSupabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // HTTPSかチェック
    if (parsed.protocol !== 'https:') {
      throw new Error('Supabase URLはHTTPSである必要があります');
    }

    // supabase.coドメインかチェック
    if (!parsed.hostname.endsWith('.supabase.co')) {
      console.warn('警告: Supabase URLのドメインが標準的ではありません');
    }

    return url;
  } catch (error) {
    throw new Error(
      `無効なSupabase URL: ${url}\n` +
      `正しい形式: https://your-project.supabase.co`
    );
  }
}

/**
 * Supabaseキーを検証（JWT形式）
 */
function validateSupabaseKey(key: string, keyName: string): string {
  // JWT形式のチェック（3つの部分がドットで区切られている）
  const parts = key.split('.');
  if (parts.length !== 3) {
    throw new Error(
      `無効な${keyName}: JWT形式ではありません\n` +
      `Supabaseダッシュボードから正しいキーをコピーしてください`
    );
  }

  // Base64エンコードされているかチェック
  const isBase64 = /^[A-Za-z0-9_-]+$/.test(parts[0]) &&
                   /^[A-Za-z0-9_-]+$/.test(parts[1]) &&
                   /^[A-Za-z0-9_-]+$/.test(parts[2]);

  if (!isBase64) {
    throw new Error(`無効な${keyName}: Base64エンコード形式ではありません`);
  }

  return key;
}

// 環境変数を検証して取得
const SUPABASE_URL = validateSupabaseUrl(
  getRequiredEnv('VITE_SUPABASE_URL')
);

const SUPABASE_PUBLISHABLE_KEY = validateSupabaseKey(
  getRequiredEnv('VITE_SUPABASE_PUBLISHABLE_KEY'),
  'Supabase Publishable Key'
);

// 開発モードかどうか
export const IS_DEV = import.meta.env.DEV;
export const IS_PROD = import.meta.env.PROD;

// 検証済み環境変数をエクスポート
export const env = {
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  IS_DEV,
  IS_PROD,
} as const;

// 起動時に環境変数を確認
if (IS_DEV) {
  console.log('✅ 環境変数の検証が完了しました');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Supabase Key: ${SUPABASE_PUBLISHABLE_KEY.substring(0, 20)}...`);
}
