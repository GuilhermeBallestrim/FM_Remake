import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "src/core"),
      "@sim": path.resolve(__dirname, "src/sim"),
      "@domain": path.resolve(__dirname, "src/domain"),
      "@data": path.resolve(__dirname, "src/data"),
      "@systems": path.resolve(__dirname, "src/systems"),
      "@ui": path.resolve(__dirname, "src/ui"),
      "@content": path.resolve(__dirname, "src/content")
    }
  },
  build: {
    target: "es2022",
    minify: "esbuild",
    sourcemap: true
  },
  server: {
    port: 3000,
    open: true
  }
});