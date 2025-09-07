import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/ai": {
        target: "http://localhost:3000", // your backend
        changeOrigin: true,
      },
    },
  },
});
