import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // triggers the Cross-Origin Resource Sharing (CORS) mechanism.If the backend does not explicitly allow the frontend origin, the browser blocks the request.
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://app:8080",
        changeOrigin: true,
      },
    },
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 500,
    },
  },

});
