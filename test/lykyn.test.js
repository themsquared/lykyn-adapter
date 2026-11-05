import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Writable } from "node:stream";
import {
  HOST,
  PROTOCOL_PENDING,
  STATUS,
  LykynComingSoonError,
  LykynError,
  LykynNotImplementedError,
  applyStage,
  configFromEnv,
  createLykynClient,
  stageSetpoints,
} from "../src/adapters/lykyn.js";
import { parseArgs, run } from "../scripts/lykyn-apply.js";

const ROOT = join(import.meta.dirname, "..");

function collect() {
  let text = "";
  const stream = new Writable({
    write(chunk, _enc, cb) {
      text += String(chunk);
      cb();
    },
  });
  return { stream, get text() { return text; } };
}

const fruiting = {
  id: "fruiting",
  temperature_c: 17,
  temperature_control_enabled: true,
  humidity_percent: 90,
  fan: { period_min: 18, run_duration_s: 25, speed_percent: 30 },
};

test("status is arriving, protocol unknown, adapter stub", () => {
  assert.deepEqual(STATUS, { hardware: "arriving", protocol: "unknown", adapter: "stub" });
  assert.equal(HOST, null);
  assert.match(PROTOCOL_PENDING, /protocol is unknown/);
  assert.match(PROTOCOL_PENDING, /docs\/protocol\.md/);
});

test("stageSetpoints copies profile fields and does not invent Lykyn keys", () => {
  const plan = stageSetpoints(fruiting);
  assert.equal(plan.source, "shroom-labs-profile");
  assert.match(plan.note, /not Lykyn API fields/);
  assert.deepEqual(plan.intended, {
    temperature_c: 17,
    temperature_control_enabled: true,
    humidity_percent: 90,
    fan: { period_min: 18, run_duration_s: 25, speed_percent: 30 },
  });
  assert.throws(() => stageSetpoints(null), (e) => e instanceof LykynError && /stage is required/.test(e.message));
});

test("createLykynClient never logs in and every call is coming soon", async () => {
  const client = createLykynClient({ email: "a@b.c", password: "p", token: "t" });
  assert.deepEqual(client.credentials, { hasEmail: true, hasPassword: true, hasToken: true });
  assert.equal(client.isLoggedIn(), false);
  await assert.rejects(client.login(), (e) => e instanceof LykynComingSoonError && e.code === "coming_soon" && /login/.test(e.message));
  await assert.rejects(client.devices(), (e) => e instanceof LykynComingSoonError && /list devices/.test(e.message));
  await assert.rejects(client.readSensors(), (e) => e instanceof LykynComingSoonError && /read sensors/.test(e.message));
  await assert.rejects(client.setSetpoints(), (e) => e instanceof LykynComingSoonError && /set setpoints/.test(e.message));
});

test("NotImplemented explains that capture is pending", () => {
  const err = new LykynNotImplementedError();
  assert.equal(err.name, "LykynNotImplementedError");
  assert.equal(err.code, "not_implemented");
  assert.equal(err.message, PROTOCOL_PENDING);
  assert.ok(err instanceof LykynError);
});

test("applyStage is a dry run unless told to apply, and apply stays blocked", async () => {
  const dry = await applyStage({ stage: fruiting });
  assert.equal(dry.applied, false);
  assert.equal(dry.blocked, true);
  assert.equal(dry.reason, PROTOCOL_PENDING);
  assert.equal(dry.plan.intended.humidity_percent, 90);

  const empty = await applyStage();
  assert.equal(empty.applied, false);
  assert.deepEqual(empty.plan.intended, {});

  await assert.rejects(
    applyStage({ stage: fruiting, apply: true }),
    (e) => e instanceof LykynComingSoonError && /apply is blocked/i.test(e.message),
  );
});

test("config comes from the environment and no credentials or API hosts are in the repo", () => {
  const cfg = configFromEnv({
    LYKYN_EMAIL: "e",
    LYKYN_PASSWORD: "p",
    LYKYN_TOKEN: "t",
    LYKYN_DEVICE_ID: "d1",
  });
  assert.deepEqual(cfg, { email: "e", password: "p", token: "t", deviceId: "d1" });

  const adapter = readFileSync(join(ROOT, "src", "adapters", "lykyn.js"), "utf8");
  const script = readFileSync(join(ROOT, "scripts", "lykyn-apply.js"), "utf8");
  const protocol = readFileSync(join(ROOT, "docs", "protocol.md"), "utf8");
  for (const src of [adapter, script, protocol]) {
    assert.doesNotMatch(src, /https?:\/\/(?!github\.com)/i);
    assert.doesNotMatch(src, /@[a-z0-9-]+\.(com|net|org)/i);
    assert.doesNotMatch(src, /lykyn\.(com|net|io|app)/i);
  }
});

test("CLI is dry-run by default and --apply exits blocked", async () => {
  assert.deepEqual(parseArgs([]), { apply: false, help: false, stageFile: undefined, stageId: undefined });
  assert.equal(parseArgs(["--apply"]).apply, true);

  const dryOut = collect();
  const dryErr = collect();
  const dryCode = await run([], { stdout: dryOut.stream, stderr: dryErr.stream, env: {} });
  assert.equal(dryCode, 0);
  assert.match(dryOut.text, /dry run, nothing sent/);
  assert.match(dryOut.text, /protocol=unknown/);
  assert.equal(dryErr.text, "");

  const wetOut = collect();
  const wetErr = collect();
  const wetCode = await run(["--apply"], { stdout: wetOut.stream, stderr: wetErr.stream, env: {} });
  assert.equal(wetCode, 1);
  assert.match(wetErr.text, /apply is blocked/i);
  assert.match(wetErr.text, /protocol is unknown/);
});
