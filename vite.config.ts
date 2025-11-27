import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: mode === "development" ? "::" : "127.0.0.1", // 本番: localhostのみ、開発: すべてのインターフェース
    port: 8080,
    strictPort: true,
    // セキュリティヘッダーの追加
    headers: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 本番ビルドの最適化
  build: {
    // ソースマップを本番では無効化（デバッグ情報の露出を防ぐ）
    sourcemap: mode === "development",
    // consoleログを本番では削除
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: true,
      },
    },
  },
}));
