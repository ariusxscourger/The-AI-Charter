import { createEnv } from "@t3-oss/env-nextjs"
import { vercel } from "@t3-oss/env-nextjs/presets-zod"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.url().default("postgres://postgres:postgres_password@localhost:5433/charter_db"),
    JWT_SECRET: z.string().default("fallback_jwt_secret_hackathon_2026"),
  },
  client: {
    NEXT_PUBLIC_TEST: z.string().optional(),
    NEXT_PUBLIC_API_BASE_URL: z.url().default("http://localhost:8000"),
    NEXT_PUBLIC_POLL_INTERVAL_MS: z.coerce.number().default(3000),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_TEST: process.env.NEXT_PUBLIC_TEST,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_POLL_INTERVAL_MS: process.env.NEXT_PUBLIC_POLL_INTERVAL_MS,
  },
  extends: [vercel()],
})
