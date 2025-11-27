// XSS対策用のサニタイゼーション関数

/**
 * HTMLタグを除去して安全なテキストに変換
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return '';

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * CSSカラー値のバリデーション（# + 6桁の16進数のみ許可）
 */
export function sanitizeCSSColor(color: string | null | undefined): string | null {
  if (!color) return null;

  // #RRGGBB形式のみ許可
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

  if (hexColorRegex.test(color)) {
    return color.toLowerCase();
  }

  // rgb(), rgba(), hsl(), hsla()形式をチェック
  const rgbRegex = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/;
  const hslRegex = /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+\s*)?\)$/;

  if (rgbRegex.test(color) || hslRegex.test(color)) {
    return color;
  }

  console.warn(`Invalid CSS color: ${color}`);
  return null;
}

/**
 * CSS変数名のバリデーション（英数字とハイフンのみ許可）
 */
export function sanitizeCSSVariableName(name: string | null | undefined): string | null {
  if (!name) return null;

  // 英数字、ハイフン、アンダースコアのみ許可
  const validNameRegex = /^[a-zA-Z0-9_-]+$/;

  if (validNameRegex.test(name)) {
    return name;
  }

  console.warn(`Invalid CSS variable name: ${name}`);
  return null;
}

/**
 * URLのバリデーション（httpまたはhttpsのみ許可）
 */
export function sanitizeURL(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    // http/httpsのみ許可
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      console.warn(`Invalid URL protocol: ${parsed.protocol}`);
      return null;
    }

    return url;
  } catch (error) {
    console.warn(`Invalid URL: ${url}`);
    return null;
  }
}

/**
 * メールアドレスのバリデーションとサニタイズ
 */
export function sanitizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;

  // 基本的なメールアドレス形式チェック
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  const trimmed = email.trim().toLowerCase();

  if (emailRegex.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * 電話番号のサニタイズ（数字とハイフンのみ）
 */
export function sanitizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // 数字とハイフンのみ許可
  const sanitized = phone.replace(/[^0-9-]/g, '');

  // 日本の電話番号形式（XXX-XXXX-XXXX または XX-XXXX-XXXX）
  const phoneRegex = /^\d{2,4}-\d{2,4}-\d{4}$/;

  if (phoneRegex.test(sanitized)) {
    return sanitized;
  }

  return null;
}

/**
 * ファイル名のサニタイズ（危険な文字を除去）
 */
export function sanitizeFileName(fileName: string | null | undefined): string | null {
  if (!fileName) return null;

  // パストラバーサル攻撃を防ぐため、スラッシュやバックスラッシュを除去
  let sanitized = fileName.replace(/[\/\\]/g, '');

  // 危険な文字を除去
  sanitized = sanitized.replace(/[<>:"|?*]/g, '');

  // 先頭のドットを除去（隠しファイルの防止）
  sanitized = sanitized.replace(/^\.+/, '');

  // 空文字列の場合はnullを返す
  if (sanitized.trim() === '') {
    return null;
  }

  return sanitized;
}

/**
 * 数値の範囲チェック
 */
export function sanitizeNumber(
  value: number | string | null | undefined,
  min?: number,
  max?: number
): number | null {
  if (value === null || value === undefined || value === '') return null;

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return null;

  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;

  return num;
}

/**
 * 整数の範囲チェック
 */
export function sanitizeInteger(
  value: number | string | null | undefined,
  min?: number,
  max?: number
): number | null {
  if (value === null || value === undefined || value === '') return null;

  const num = typeof value === 'string' ? parseInt(value, 10) : Math.floor(value);

  if (isNaN(num)) return null;

  if (min !== undefined && num < min) return null;
  if (max !== undefined && num > max) return null;

  return num;
}

/**
 * 郵便番号のサニタイズ（XXX-XXXXまたはXXXXXXX形式）
 */
export function sanitizePostalCode(postalCode: string | null | undefined): string | null {
  if (!postalCode) return null;

  // 数字とハイフンのみ許可
  const sanitized = postalCode.replace(/[^0-9-]/g, '');

  // 日本の郵便番号形式
  const postalCodeRegex = /^\d{3}-?\d{4}$/;

  if (postalCodeRegex.test(sanitized)) {
    // ハイフンを統一（XXX-XXXX形式）
    if (!sanitized.includes('-')) {
      return sanitized.slice(0, 3) + '-' + sanitized.slice(3);
    }
    return sanitized;
  }

  return null;
}
