#!/usr/bin/env node
/**
 * Dry-run a Lykyn apply from a Shroom Labs grow-profile stage.
 *
 *   node scripts/lykyn-apply.js
 *   node scripts/lykyn-apply.js --stage-file path/to/stage.json
 *   node scripts/lykyn-apply.js --apply
 *
 * Dry run is the default. --apply is blocked until the protocol is captured.
 * Nothing is sent. Credentials, if you set any, come from the environment only.
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  PROTOCOL_PENDING,
  STATUS,
  applyStage,
  configFromEnv,
  LykynComingSoonError,
  LykynError,
} from "../src/adapters/lykyn.js";

export function parseArgs(argv) {
  const flag = (n) => argv.includes(`--${n}`);
  const opt = (n) => {
    const i = argv.indexOf(`--${n}`);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  return {
    apply: flag("apply"),
    help: flag("help") || flag("h"),
    stageFile: opt("stage-file"),
    stageId: opt("stage"),
  };
}

function loadStage(stageFile, stageId) {
  if (!stageFile) return undefined;
  const raw = JSON.parse(readFileSync(stageFile, "utf8"));
  if (Array.isArray(raw.stages)) {
    if (stageId) {
      const hit = raw.stages.find((s) => s.id === stageId);
      if (!hit) throw new LykynError(`no stage named ${stageId}`);
      return hit;
    }
    return raw.stages[raw.stages.length - 1];
  }
  return raw;
}

function printHelp(out) {
  out.write(`lykyn-apply: Shroom Labs outside-control CLI for the Lykyn box.

  node scripts/lykyn-apply.js
  node scripts/lykyn-apply.js --stage-file path/to/stage.json
  node scripts/lykyn-apply.js --stage-file path/to/profile.json --stage fruiting
  node scripts/lykyn-apply.js --apply

Dry run is the default. --apply is blocked until the protocol is captured.
Nothing is sent. See docs/protocol.md.
`);
}

export async function run(argv = process.argv.slice(2), io = {}) {
  const out = io.stdout || process.stdout;
  const err = io.stderr || process.stderr;
  const env = io.env || process.env;
  const args = parseArgs(argv);

  if (args.help) {
    printHelp(out);
    return 0;
  }

  configFromEnv(env);

  try {
    const stage = loadStage(args.stageFile, args.stageId);
    const result = await applyStage({ stage, apply: args.apply });
    out.write(`status: hardware=${STATUS.hardware} protocol=${STATUS.protocol} adapter=${STATUS.adapter}\n`);
    out.write(`dry run, nothing sent. ${result.reason}\n`);
    if (result.plan?.intended && Object.keys(result.plan.intended).length) {
      out.write(`intended (profile fields, not Lykyn API fields): ${JSON.stringify(result.plan.intended)}\n`);
    }
    return 0;
  } catch (e) {
    if (e instanceof LykynComingSoonError) {
      err.write(`${e.message}\n`);
      err.write(`${PROTOCOL_PENDING}\n`);
      return 1;
    }
    err.write(`${e instanceof Error ? e.message : e}\n`);
    return 1;
  }
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) process.exit(await run());
