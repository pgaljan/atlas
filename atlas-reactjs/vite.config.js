import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  esbuild: {
    pure: mode === "production" ? ["console.log"] : [],
  },
  define: {
    "process.env": {}, // This is not needed in most cases
  },
}));
