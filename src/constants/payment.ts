// 決済関連の定数定義

export const PAYMENT_STATUSES = {
  pending: '未決済',
  completed: '決済完了',
  failed: '決済失敗',
} as const;

export type PaymentStatusKey = keyof typeof PAYMENT_STATUSES;
export type PaymentStatusValue = typeof PAYMENT_STATUSES[PaymentStatusKey];

// 決済ステータスの色分け（UIで使用）
export const PAYMENT_STATUS_COLORS = {
  pending: 'yellow',
  completed: 'green',
  failed: 'red',
} as const;

// デフォルト決済ステータス
export const DEFAULT_PAYMENT_STATUS: PaymentStatusKey = 'pending';
