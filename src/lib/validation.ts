// Zodを使用した入力バリデーションスキーマ

import { z } from 'zod';

// ============================================
// 共通バリデーションルール
// ============================================

/**
 * メールアドレスのバリデーション
 */
export const emailSchema = z
  .string()
  .email('有効なメールアドレスを入力してください')
  .min(5, 'メールアドレスが短すぎます')
  .max(255, 'メールアドレスが長すぎます')
  .toLowerCase()
  .trim();

/**
 * 電話番号のバリデーション（日本形式）
 */
export const phoneSchema = z
  .string()
  .regex(/^\d{2,4}-\d{2,4}-\d{4}$/, '電話番号の形式が正しくありません（例: 03-1234-5678）')
  .trim();

/**
 * 郵便番号のバリデーション（日本形式）
 */
export const postalCodeSchema = z
  .string()
  .regex(/^\d{3}-\d{4}$/, '郵便番号の形式が正しくありません（例: 123-4567）')
  .trim();

/**
 * パスワードのバリデーション（強力な要件）
 */
export const passwordSchema = z
  .string()
  .min(8, 'パスワードは8文字以上である必要があります')
  .max(100, 'パスワードが長すぎます')
  .regex(/[A-Z]/, 'パスワードには大文字を1文字以上含めてください')
  .regex(/[a-z]/, 'パスワードには小文字を1文字以上含めてください')
  .regex(/[0-9]/, 'パスワードには数字を1文字以上含めてください');

/**
 * URLのバリデーション
 */
export const urlSchema = z
  .string()
  .url('有効なURLを入力してください')
  .startsWith('https://', 'HTTPSのURLを使用してください');

/**
 * 名前のバリデーション
 */
export const nameSchema = z
  .string()
  .min(1, '名前を入力してください')
  .max(100, '名前が長すぎます')
  .trim();

/**
 * 住所のバリデーション
 */
export const addressSchema = z
  .string()
  .min(1, '住所を入力してください')
  .max(500, '住所が長すぎます')
  .trim();

// ============================================
// 顧客関連のバリデーション
// ============================================

/**
 * 顧客登録のバリデーション
 */
export const customerSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema.optional().or(z.literal('')),
  postalCode: postalCodeSchema.optional().or(z.literal('')),
  prefecture: z.string().max(10, '都道府県名が長すぎます').optional(),
  city: z.string().max(100, '市区町村名が長すぎます').optional(),
  address_line: addressSchema.optional().or(z.literal('')),
  notes: z.string().max(1000, 'メモが長すぎます（1000文字以内）').optional(),
});

/**
 * 配送先登録のバリデーション
 */
export const recipientSchema = z.object({
  name: nameSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  postalCode: postalCodeSchema,
  prefecture: z.string().min(1, '都道府県を選択してください').max(10),
  city: z.string().min(1, '市区町村を入力してください').max(100),
  address_line: addressSchema,
});

// ============================================
// 認証関連のバリデーション
// ============================================

/**
 * サインアップのバリデーション
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

/**
 * ログインのバリデーション
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'パスワードを入力してください'),
});

// ============================================
// 公開注文フォーム関連のバリデーション
// ============================================

/**
 * 公開注文の顧客情報バリデーション
 */
export const publicOrderCustomerSchema = z.object({
  customerName: nameSchema,
  customerEmail: emailSchema,
  customerPhone: phoneSchema,
});

/**
 * 公開注文の配送先バリデーション
 */
export const publicOrderRecipientSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  postalCode: postalCodeSchema,
  prefecture: z.string().min(1, '都道府県を選択してください'),
  city: z.string().min(1, '市区町村を入力してください'),
  address_line: addressSchema,
});

/**
 * 公開注文の商品数量バリデーション
 */
export const publicOrderQuantitySchema = z.object({
  productId: z.string().uuid('無効な商品IDです'),
  variantId: z.string().uuid('無効なバリエーションIDです'),
  quantity: z.number().int('数量は整数である必要があります').min(1, '数量は1以上である必要があります').max(100, '数量は100以下である必要があります'),
});

/**
 * 配送先数のバリデーション
 */
export const recipientCountSchema = z
  .number()
  .int('配送先数は整数である必要があります')
  .min(1, '配送先は最低1件必要です')
  .max(10, '配送先は最大10件までです');

// ============================================
// 商品関連のバリデーション
// ============================================

/**
 * 商品登録のバリデーション
 */
export const productSchema = z.object({
  name: z.string().min(1, '商品名を入力してください').max(200, '商品名が長すぎます'),
  category: z.string().max(100, 'カテゴリ名が長すぎます').optional(),
  description: z.string().max(2000, '説明が長すぎます（2000文字以内）').optional(),
  price: z.number().min(0, '価格は0以上である必要があります').optional(),
});

/**
 * 商品バリエーションのバリデーション
 */
export const productVariantSchema = z.object({
  name: z.string().min(1, 'バリエーション名を入力してください').max(200),
  sku: z.string().max(100, 'SKUコードが長すぎます').optional(),
  price: z.number().min(0, '価格は0以上である必要があります'),
  stock: z.number().int().min(0, '在庫は0以上である必要があります').optional(),
  weight: z.number().min(0, '重量は0以上である必要があります').optional(),
  size: z.union([
    z.literal(60),
    z.literal(80),
    z.literal(100),
    z.literal(120),
    z.literal(140),
    z.literal(160),
  ]).optional(),
});

// ============================================
// 受注関連のバリデーション
// ============================================

/**
 * 受注登録のバリデーション
 */
export const orderSchema = z.object({
  customerName: nameSchema,
  deliveryDate: z.string().min(1, '配送日を選択してください'),
  shippingCompany: z.enum(['yamato', 'sagawa', 'yupack'], {
    errorMap: () => ({ message: '配送業者を選択してください' }),
  }).optional(),
  notes: z.string().max(1000, 'メモが長すぎます（1000文字以内）').optional(),
});

// ============================================
// ヘルパー関数
// ============================================

/**
 * バリデーションエラーをユーザーフレンドリーなメッセージに変換
 */
export function formatZodError(error: z.ZodError): string {
  return error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
}

/**
 * バリデーションを実行して結果を返す
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: formatZodError(result.error) };
  }
}
