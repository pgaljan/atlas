import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": {},
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
  logLevel: "silent",
  server: {
    watch: {
      usePolling: true,
    },
  },
});
