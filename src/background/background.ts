import { logger } from "../shared/logger/logger.ts"
import { startExtension } from "./extension/extension-state.ts"

startExtension().catch(logger.error)
