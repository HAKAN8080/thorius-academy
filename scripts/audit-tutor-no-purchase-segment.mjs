#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const result = spawnSync(
  "npx",
  ["tsx", resolve("scripts/audit-tutor-no-purchase-segment.ts"), ...args],
  {
    stdio: "inherit",
    env: process.env,
    cwd: process.cwd(),
  },
);

process.exit(result.status ?? 1);
