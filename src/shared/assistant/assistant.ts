import { logger } from "../logger/logger.ts"
import { aggressivePrompt } from "../model/prompts/aggressive.ts"
import { balancedPrompt } from "../model/prompts/balanced.ts"
import { generateCategoriesExamplePrompt } from "../model/prompts/categories-example.ts"
import { generateCategoriesPrompt } from "../model/prompts/categories.ts"
import { cautiousPrompt } from "../model/prompts/cautious.ts"
import { personaPrompt } from "../model/prompts/persona.ts"
import type { CategoryExample } from "../model/schemas/category-example.ts"
import type { ProfileType } from "../model/schemas/profile.ts"
import {
  getAllTabCategoriesResponseSchema,
  getTabCategoryResponseSchema,
} from "../model/schemas/prompt.ts"
import type { TabPrompt } from "../model/schemas/tab-prompt.ts"
import { SessionPool } from "./session/session-pool.ts"
import type { Session } from "./session/session.ts"
import { SingleSession } from "./session/single-session.ts"

type SessionType = "pool" | "single"
type Mode = "debug" | "release"

class Assistant {
  private session?: Session
  private readonly sessionType: SessionType
  private readonly mode: Mode

  constructor(sessionType: SessionType, mode: Mode = "release") {
    this.sessionType = sessionType
    this.mode = mode
  }

  setup(profileType: ProfileType, categories: CategoryExample[]) {
    const modelOptions: chrome.aiOriginTrial.ModelOptions = {
      initialPrompts: [
        {
          role: "system",
          content: this.generateSystemPrompt(profileType, categories),
        },
      ],
    }

    if (this.sessionType === "pool") {
      this.session = new SessionPool({
        maxPoolSize: 3,
        enablePerformanceMeasure: this.mode === "debug",
        modelOptions,
      })
    } else {
      this.session = new SingleSession({
        enablePerformanceMeasure: this.mode === "debug",
        modelOptions,
      })
    }
  }

  async getCategoryForTab(tab: TabPrompt) {
    if (!this.session) {
      throw new Error("Assistant not set up")
    }
    return await this.session.promptObject(
      JSON.stringify(tab),
      getTabCategoryResponseSchema
    )
  }

  async getCategoriesForTabs(tabs: TabPrompt[]) {
    if (!this.session) {
      throw new Error("Assistant not set up")
    }
    return await this.session.promptList(
      tabs,
      getAllTabCategoriesResponseSchema.innerType()
    )
  }

  destroy() {
    if (this.session) {
      this.session.destroy()
    }
    this.session = undefined
  }

  hasBeenSetup() {
    return !!this.session
  }

  private generateSystemPrompt(
    profileType: ProfileType,
    categoriesExample: CategoryExample[]
  ) {
    const categoriesExamplePrompt = generateCategoriesExamplePrompt(
      categoriesExample,
      profileType !== "aggressive"
    )
    const categoriesPrompt = generateCategoriesPrompt(categoriesExample)
    let profilePrompt = ""
    switch (profileType) {
      case "aggressive":
        profilePrompt = aggressivePrompt
        break
      case "balanced":
        profilePrompt = balancedPrompt
        break
      default:
        profilePrompt = cautiousPrompt
    }
    const systemPrompt = [
      personaPrompt,
      profilePrompt,
      categoriesPrompt,
      categoriesExamplePrompt,
    ].join("\n")

    logger.debug("System prompt:\n", systemPrompt)
    return systemPrompt
  }
}

export const assistant = new Assistant("pool")
