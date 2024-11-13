import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";

function generateManifest() {
  const manifest = readJsonFile("src/manifest.json");
  const pkg = readJsonFile("package.json");
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    author: pkg.author,
    homepage_url: pkg.homepage,
    ...manifest,
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
    terserOptions: {
      compress: false,
      mangle: false,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  plugins: [
    react(),
    webExtension({
      manifest: generateManifest,
      additionalInputs: ["src/content.ts"],
    }),
  ],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest-setup.js"],
  },
});
