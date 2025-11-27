// エラーハンドリングユーティリティ

import { PostgrestError } from '@supabase/supabase-js';

export interface AppError {
  message: string;
  code?: string;
  details?: string;
}

/**
 * Supabaseエラーを処理する
 */
export function handleSupabaseError(
  error: unknown,
  context: string
): AppError {
  console.error(`[${context}]`, error);

  if (error instanceof Error) {
    const postgrestError = error as PostgrestError;
    return {
      message: `${context}に失敗しました`,
      code: postgrestError.code,
      details: postgrestError.message,
    };
  }

  return {
    message: `${context}に失敗しました`,
    details: '不明なエラーが発生しました',
  };
}

/**
 * エラーメッセージを取得する
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '不明なエラーが発生しました';
}

/**
 * ネットワークエラーかどうかを判定する
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('Failed to fetch')
    );
  }
  return false;
}

/**
 * 認証エラーかどうかを判定する
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const postgrestError = error as PostgrestError;
    return (
      postgrestError.code === 'PGRST301' ||
      postgrestError.code === '42501' ||
      error.message.includes('JWT') ||
      error.message.includes('authentication')
    );
  }
  return false;
}

/**
 * バリデーションエラーかどうかを判定する
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof Error) {
    const postgrestError = error as PostgrestError;
    return (
      postgrestError.code === '23505' || // unique_violation
      postgrestError.code === '23503' || // foreign_key_violation
      postgrestError.code === '23502' || // not_null_violation
      postgrestError.code === '23514'    // check_violation
    );
  }
  return false;
}

/**
 * ユーザーフレンドリーなエラーメッセージを生成する
 */
export function getUserFriendlyErrorMessage(error: unknown, context: string): string {
  if (isNetworkError(error)) {
    return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
  }

  if (isAuthError(error)) {
    return '認証エラーが発生しました。再度ログインしてください。';
  }

  if (isValidationError(error)) {
    const postgrestError = error as PostgrestError;

    if (postgrestError.code === '23505') {
      return '既に登録されているデータです。';
    }
    if (postgrestError.code === '23503') {
      return '関連するデータが存在しません。';
    }
    if (postgrestError.code === '23502') {
      return '必須項目が入力されていません。';
    }
    if (postgrestError.code === '23514') {
      return '入力値が制約に違反しています。';
    }
  }

  return `${context}に失敗しました。${getErrorMessage(error)}`;
}
