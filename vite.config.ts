import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: path.resolve(import.meta.dirname, "client"),
  base: "./", // 👈 necessary for correct asset resolution on Vercel
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "dist", "public", "assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"), // 👈 direct to top-level dist/
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
