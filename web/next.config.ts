import type { NextConfig } from "next"
import dotenv from "dotenv"
import path from "path"

// Load environment variables from the workspace root .env
dotenv.config({ path: path.resolve(__dirname, "../.env") })

const nextConfig: NextConfig = {}

export default nextConfig
