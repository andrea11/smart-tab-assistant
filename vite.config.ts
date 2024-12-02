import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import webExtension, { readJsonFile } from "vite-plugin-web-extension"

type Package = typeof import("./package.json")

function generateManifest() {
  const manifest = readJsonFile("src/manifest.json")
  const pkg: Package = readJsonFile("package.json") as Package
  return {
    ...manifest,
    description: pkg.description,
    version: pkg.version,
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    webExtension({
      additionalInputs: ["src/options/error.html"],
      manifest: generateManifest,
      disableAutoLaunch: true,
      webExtConfig: {
        chromiumProfile: "./chrome-profile",
        keepProfileChanges: true,
        startUrl: ["./README.md"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
})
