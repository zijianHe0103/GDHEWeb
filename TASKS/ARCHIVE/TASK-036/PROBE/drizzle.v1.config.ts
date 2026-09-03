import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/schema-v1.ts",
  strict: true,
  verbose: true,
});
