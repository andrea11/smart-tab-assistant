import React from "react"
import reactDom from "react-dom/client"
import Options from "../pages/Options.tsx"
import { logger } from "../shared/logger/logger.ts"

const rootElement = document.getElementById("root")

if (rootElement) {
  reactDom.createRoot(rootElement).render(
    <React.StrictMode>
      <Options />
    </React.StrictMode>
  )
} else {
  logger.error("Root element not found")
}
