import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: "/src",
    },
  },
  optimizeDeps: {
    include: ["jspdf", "jspdf-autotable"],
  },
  build: {
    commonjsOptions: {
      include: [/jspdf/, /jspdf-autotable/, /node_modules/],
    },
  },
});
