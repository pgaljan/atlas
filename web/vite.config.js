import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      jsx: {
        runtime: 'automatic',
      },
    }),
  ],
   assetsInclude: ["**/*.ttf", "**/*.woff", "**/*.woff2"],
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
    host: process.env.VITE_HOST,
    port: process.env.VITE_PORT,
    allowedHosts: ['dev.atlasflow.co'],
    fs: {
      allow: ['..'],
      strict: false
    },
  },
}));
