import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/ai": {
        target: "http://localhost:3000", // backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    proxy: {
      "/ai": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
