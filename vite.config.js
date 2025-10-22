import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: "/src",
    },
  },
  build: {
    rollupOptions: {
      // ⚠️ Externalize browser-only libs so Rollup doesn't try to bundle them
      external: ["jspdf", "jspdf-autotable"],
    },
  },
});
