import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
    watch: {
      // Bỏ theo dõi thư mục ảnh tĩnh (public/images) + file tạm khi copy-paste.
      // Ảnh trong public/ không cần HMR (đổi ảnh chỉ cần F5), và trên Windows nếu
      // file đang mở/bị khoá thì trình theo dõi của Vite sẽ crash (EBUSY) — bỏ qua
      // để dev server không bao giờ sập khi bạn thêm/sửa ảnh.
      ignored: [
        "**/public/images/**",
        "**/* - Copy*",
        "**/*- Copy*",
        "**/*.tmp",
        "**/*.crdownload",
      ],
    },
  },
});
