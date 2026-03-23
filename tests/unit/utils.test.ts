import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("text-red-500")).toBe("text-red-500")
  })

  it("merges multiple classes", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2")
  })

  it("resolves Tailwind conflicts — last value wins", () => {
    // tailwind-merge keeps the last conflicting utility
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500")
  })

  it("handles conditional false values", () => {
    expect(cn("px-4", false && "py-2", "mt-1")).toBe("px-4 mt-1")
  })

  it("handles undefined values", () => {
    expect(cn("px-4", undefined, "mt-1")).toBe("px-4 mt-1")
  })
})
