import { vi } from "vitest"

let _testUserId: string | null = "test-user-default"

export function setTestUserId(id: string | null) {
  _testUserId = id
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: {
          user: _testUserId
            ? { id: _testUserId, email: `${_testUserId}@test.devfluent` }
            : null,
        },
      })),
    },
  })),
}))
