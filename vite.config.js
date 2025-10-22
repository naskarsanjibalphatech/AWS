import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: "/src",
    },
  },

  // ✅ Allow Amplify to build even when jspdf is browser-only
  optimizeDeps: {
    include: ["jspdf", "jspdf-autotable"], // ensure they exist in node_modules for dynamic import
  },

  build: {
    rollupOptions: {
      // ✅ Do NOT externalize — let Rollup know these are browser libs
      external: [],
    },
  },
});
