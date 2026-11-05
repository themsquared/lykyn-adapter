/**
 * Lykyn adapter: maps a Shroom Labs grow-profile stage onto a Lykyn box
 * through Lykyn's existing cloud or local API.
 *
 * Status: arriving. The box is in transit. App traffic has not been captured.
 * Every network call throws until docs/protocol.md is filled from a real capture.
 *
 * This is outside control. It uses the stock Lykyn API. It does not reflash the box.
 * Shroom Labs is not affiliated with Lykyn.
 *
 * Credentials come only from the caller (see configFromEnv). Nothing here stores or logs them.
 */

export const STATUS = Object.freeze({
  hardware: "arriving",
  protocol: "unknown",
  adapter: "stub",
});

/** Unknown until capture. Do not guess a value. */
export const HOST = null;

export const PROTOCOL_PENDING =
  "Lykyn protocol is unknown until app traffic is captured. See docs/protocol.md.";

export class LykynError extends Error {
  constructor(message, { code } = {}) {
    super(message);
    this.name = "LykynError";
    this.code = code;
  }
}

export class LykynNotImplementedError extends LykynError {
  constructor(message = PROTOCOL_PENDING) {
    super(message, { code: "not_implemented" });
    this.name = "LykynNotImplementedError";
  }
}

export class LykynComingSoonError extends LykynError {
  constructor(action) {
    const detail = action
      ? `${action} is blocked until the Lykyn protocol is captured. See docs/protocol.md.`
      : "Apply is blocked until the Lykyn protocol is captured. See docs/protocol.md.";
    super(detail, { code: "coming_soon" });
    this.name = "LykynComingSoonError";
  }
}

/**
 * Intended setpoints from a Shroom Labs profile stage.
 * Field names are profile fields, not Lykyn API fields. Mapping waits on capture.
 */
export function stageSetpoints(stage) {
  if (!stage || typeof stage !== "object") throw new LykynError("stage is required");
  const intended = {};
  if (Number.isFinite(stage.temperature_c)) intended.temperature_c = stage.temperature_c;
  if (typeof stage.temperature_control_enabled === "boolean") {
    intended.temperature_control_enabled = stage.temperature_control_enabled;
  }
  if (Number.isFinite(stage.humidity_percent)) intended.humidity_percent = stage.humidity_percent;
  if (stage.fan && typeof stage.fan === "object") {
    const fan = {};
    if (Number.isFinite(stage.fan.period_min)) fan.period_min = stage.fan.period_min;
    if (Number.isFinite(stage.fan.run_duration_s)) fan.run_duration_s = stage.fan.run_duration_s;
    if (Number.isFinite(stage.fan.speed_percent)) fan.speed_percent = stage.fan.speed_percent;
    if (Object.keys(fan).length) intended.fan = fan;
  }
  return {
    source: "shroom-labs-profile",
    note: "These are Shroom Labs profile fields, not Lykyn API fields. Mapping waits on protocol capture.",
    intended,
  };
}

/**
 * Cloud or local client. Auth method is unknown. Methods throw until capture.
 * `fetch` is not accepted yet so this stub cannot touch the network.
 */
export function createLykynClient({ email, password, token } = {}) {
  return {
    credentials: {
      hasEmail: Boolean(email),
      hasPassword: Boolean(password),
      hasToken: Boolean(token),
    },
    isLoggedIn: () => false,
    async login() {
      throw new LykynComingSoonError("login");
    },
    async devices() {
      throw new LykynComingSoonError("list devices");
    },
    async readSensors() {
      throw new LykynComingSoonError("read sensors");
    },
    async setSetpoints() {
      throw new LykynComingSoonError("set setpoints");
    },
  };
}

/**
 * Apply a stage. Dry run by default: returns the plan and sends nothing.
 * With apply: true it still refuses. Writes stay blocked until the protocol is known.
 */
export async function applyStage({ stage, apply = false } = {}) {
  const plan = stage
    ? stageSetpoints(stage)
    : { source: "none", note: PROTOCOL_PENDING, intended: {} };
  if (!apply) return { applied: false, blocked: true, reason: PROTOCOL_PENDING, plan };
  throw new LykynComingSoonError("apply");
}

/**
 * Config from environment variables. Keep them in a local .env or your shell, never in git.
 * LYKYN_EMAIL, LYKYN_PASSWORD, LYKYN_TOKEN, LYKYN_DEVICE_ID
 */
export function configFromEnv(env = process.env) {
  return {
    email: env.LYKYN_EMAIL,
    password: env.LYKYN_PASSWORD,
    token: env.LYKYN_TOKEN,
    deviceId: env.LYKYN_DEVICE_ID,
  };
}
