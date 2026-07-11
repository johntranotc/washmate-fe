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
      // Bỏ qua file tạm khi copy-paste ảnh trong Windows (vd "icon - Copy.png")
      // để trình theo dõi file của Vite không crash vì file đang bị khoá (EBUSY).
      ignored: ["**/* - Copy*", "**/*- Copy*", "**/*.tmp", "**/*.crdownload"],
    },
  },
});
