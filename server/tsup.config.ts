import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm"],
    platform: "node",
    target: "node20",
    outDir: "dist",
    clean: true,
    sourcemap: true,
    splitting: false,
    external: ["pg", "@prisma/adapter-pg"],
  },
  {
    entry: ["src/vercel-handler.ts"],
    format: ["esm"],
    platform: "node",
    target: "node20",
    outDir: "dist-vercel",
    clean: true,
    sourcemap: true,
    splitting: false,
    banner: {
      js: "",
    },
    external: ["express", "cors", "cookie-parser", "dotenv", "pg", "@prisma/adapter-pg", "openai", "express-rate-limit", "zod", "@prisma/client"],
  },
]);