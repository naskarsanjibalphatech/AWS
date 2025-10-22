import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: "/src",
    },
  },
  // 👇 Prevent Amplify build from breaking on jspdf-autotable
  optimizeDeps: {
    exclude: ["jspdf", "jspdf-autotable"], // skip pre-bundling these browser-only libs
  },
  build: {
    rollupOptions: {
      external: ["jspdf", "jspdf-autotable"], // tell Rollup not to resolve them
    },
  },
});
