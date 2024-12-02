import type { Profile } from "../schemas/profile.ts"

export const profiles: Profile[] = [
  {
    name: "cautious",
    description:
      "Carefully categorizes tabs, ensuring they are accurately labeled without mistakes or confusion.",
    image: "/image/cautious.png",
  },
  {
    name: "balanced",
    description:
      "Strikes a balance between being cautious and making confident decisions while categorizing tabs.",
    image: "/image/balanced.png",
  },
  {
    name: "aggressive",
    description:
      "Categorizes tabs efficiently, focusing more on getting things done than on achieving perfect accuracy.",
    image: "/image/aggressive.png",
  },
] as const
