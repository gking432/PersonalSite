import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5202,
    strictPort: true,
    fs: { allow: [fileURLToPath(new URL("../..", import.meta.url))] },
  },
  build: {
    outDir: fileURLToPath(
      new URL("../../dist-little-milwaukee", import.meta.url),
    ),
    emptyOutDir: true,
    rollupOptions: { output: { manualChunks: { three: ["three"] } } },
  },
});
