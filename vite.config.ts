import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import webExtension, { readJsonFile } from "vite-plugin-web-extension"
import type Browser from "webextension-polyfill"

type Package = typeof import("./package.json")
type Manifest = Omit<
  Browser.Manifest.WebExtensionManifest,
  "name" | "description" | "version"
>

function generateManifest(): Browser.Manifest.WebExtensionManifest {
  const manifest: Manifest = readJsonFile("src/manifest.json") as Manifest
  const pkg: Package = readJsonFile("package.json") as Package
  return {
    ...manifest,
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: generateManifest,
      webExtConfig: {
        chromiumProfile: "./chrome-profile",
        keepProfileChanges: true,
        // chromiumProfile:
        //   "/Users/andrea.accardo/Library/Application Support/Google/Chrome",
        // chromiumBinary:
        //   "/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta",
        startUrl: ["./README.md"],
        browserConsole: true,
        devtools: true,
        args: ["--devtools"],
      },
    }),
  ],
})
