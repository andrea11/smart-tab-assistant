import { StrictMode } from "react"
import reactDom from "react-dom/client"
import Options from "../pages/options.tsx"
import { logger } from "../shared/logger/logger.ts"

const rootElement = document.getElementById("root")

if (rootElement) {
  reactDom.createRoot(rootElement).render(
    <StrictMode>
      <Options />
    </StrictMode>
  )
} else {
  logger.error("Root element not found")
}
