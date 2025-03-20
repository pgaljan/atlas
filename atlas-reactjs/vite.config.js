import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      jsx: {
        runtime: 'automatic',
      },
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  esbuild: {
    pure: mode === "production" ? ["console.log"] : [],
  },
  define: {
    "process.env": {},
  },
  server: {
    allowedHosts: ['dev.atlasflow.co'],
  },
}));
