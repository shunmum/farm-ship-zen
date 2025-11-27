// 受注関連の定数定義

export const ORDER_STATUSES = {
  unshipped: '未発送',
  shipped: '発送済み',
  delivered: '配達完了',
  cancelled: 'キャンセル',
} as const;

export type OrderStatusKey = keyof typeof ORDER_STATUSES;
export type OrderStatusValue = typeof ORDER_STATUSES[OrderStatusKey];

// ステータスの色分け（UIで使用）
export const ORDER_STATUS_COLORS = {
  unshipped: 'yellow',
  shipped: 'blue',
  delivered: 'green',
  cancelled: 'gray',
} as const;

// ステータスの並び順
export const ORDER_STATUS_ORDER: OrderStatusKey[] = [
  'unshipped',
  'shipped',
  'delivered',
  'cancelled',
];

// デフォルトステータス
export const DEFAULT_ORDER_STATUS: OrderStatusKey = 'unshipped';
