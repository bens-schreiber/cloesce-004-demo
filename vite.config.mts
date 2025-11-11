import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import Components from "unplugin-vue-components/vite";
import Fonts from "unplugin-fonts/vite";
import { fileURLToPath, URL } from "node:url";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "./src/frontend"),

  plugins: [
    vue({
      template: { transformAssetUrls },
    }),
    vuetify(),
    Components(),
    Fonts({
      fontsource: {
        families: [
          {
            name: "Roboto",
            weights: [100, 300, 400, 500, 700, 900],
            styles: ["normal", "italic"],
          },
        ],
      },
    }),
  ],

  optimizeDeps: {
    exclude: ["vuetify"],
  },

  define: { "process.env": {} },

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src/frontend/src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },

  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },

  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
