// 配送関連の定数定義

export const SHIPPING_SIZES = [60, 80, 100, 120, 140, 160] as const;
export type ShippingSize = typeof SHIPPING_SIZES[number];

export const CARRIERS = {
  yamato: 'ヤマト運輸',
  sagawa: '佐川急便',
  yupack: 'ゆうパック',
} as const;

export type CarrierKey = keyof typeof CARRIERS;
export type CarrierName = typeof CARRIERS[CarrierKey];

export const SHIPPING_MODES = {
  flat_rate: '全国一律',
  prefecture: '都道府県別',
  zone: 'ゾーン制',
} as const;

export type ShippingModeKey = keyof typeof SHIPPING_MODES;
export type ShippingModeName = typeof SHIPPING_MODES[ShippingModeKey];

// 配送サイズの最小・最大値
export const MIN_SHIPPING_SIZE = 60;
export const MAX_SHIPPING_SIZE = 160;

// デフォルト値
export const DEFAULT_CARRIER: CarrierKey = 'yamato';
export const DEFAULT_SHIPPING_MODE: ShippingModeKey = 'flat_rate';
export const DEFAULT_SHIPPING_SIZE: ShippingSize = 80;

// クール便追加料金（デフォルト）
export const DEFAULT_COOL_FEE = 220;
