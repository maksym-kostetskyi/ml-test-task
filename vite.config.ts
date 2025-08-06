import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/ml-test-task/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["primereact", "primeicons", "primeflex"],
          charts: ["recharts"],
          utils: ["zustand", "react-papaparse"],
        },
      },
    },
  },
});
