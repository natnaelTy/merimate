const { spawnSync } = require("node:child_process");

const shouldSkip =
  process.env.PRISMA_GENERATE_SKIP === "1" ||
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.trim() === "";

if (shouldSkip) {
  console.log(
    "Skipping Prisma generate: DATABASE_URL is not set (or PRISMA_GENERATE_SKIP=1)."
  );
  process.exit(0);
}

const result = spawnSync(
  "npx",
  ["prisma", "generate", "--schema", "prisma/schema.prisma"],
  { stdio: "inherit" }
);

process.exit(result.status ?? 1);
