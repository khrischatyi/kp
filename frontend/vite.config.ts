import path from "node:path";
import fs from "node:fs";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/** Serve the local photos/ directory at /photos when no proxy target is reachable. */
function localPhotosPlugin(photosRoot: string): Plugin {
  return {
    name: "local-photos",
    configureServer(server) {
      server.middlewares.use("/photos", (req, res, next) => {
        const filePath = path.join(photosRoot, decodeURIComponent(req.url ?? ""));
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.setHeader("Cache-Control", "public, max-age=3600");
          fs.createReadStream(filePath).pipe(res);
        } else {
          next();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_PROXY_TARGET ?? "http://backend:8000";
  const photosRoot = path.resolve(__dirname, "../photos");

  return {
    plugins: [react(), localPhotosPlugin(photosRoot)],
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
