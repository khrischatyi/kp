import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_PROXY_TARGET ?? "http://backend:8000";
  const photosTarget = env.VITE_PHOTOS_PROXY_TARGET ?? "http://caddy:80";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      // Dev requests go straight through Caddy at :8080 in practice; the
      // proxy below is a fallback when hitting Vite directly.
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
        "/photos": {
          target: photosTarget,
          changeOrigin: true,
        },
      },
      watch: {
        usePolling: true,
        interval: 250,
      },
    },
    build: {
      target: "esnext",
      sourcemap: false,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "motion": ["framer-motion"],
          },
        },
      },
    },
  };
});
