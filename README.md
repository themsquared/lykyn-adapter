# lykyn-adapter

Shroom Labs outside-control adapter for the Lykyn Smart Mushroom Grow Box.

This repo talks to the box through Lykyn's existing cloud or local API. It does not reflash firmware. It is a client, not a firmware project.

Shroom Labs is not affiliated with Lykyn.

Site: https://shroomlabs.io

Grow log: https://shroomlabs.io/grow-log

## Status

The physical box is arriving. App traffic has not been captured. The adapter and CLI are stubs.

Nothing here has been tested against hardware. Do not treat this as working control.

## What it will do (once the protocol is captured)

- Read sensors from a Lykyn box
- Apply Shroom Labs grow-profile setpoints through Lykyn's existing API
- Keep credentials in local environment variables only

## What it will not do

- Reflash or replace Lykyn firmware
- Invent endpoints or claim a protocol we have not seen
- Speak for Lykyn or imply a partnership

## Layout

- `src/adapters/lykyn.js`: adapter stub
- `scripts/lykyn-apply.js`: CLI (dry run by default; `--apply` is blocked until the protocol is known)
- `docs/protocol.md`: capture notes (placeholders only)
- `test/lykyn.test.js`: stub tests

## Run

```
npm test
node scripts/lykyn-apply.js
```

Copy `.env.example` to `.env` locally if you want placeholders filled in. Real values stay on your machine.

## After the box arrives

1. Sniff the official app (and any local traffic) while you log in, list devices, read sensors, and change setpoints.
2. Record auth, base URL, endpoints, headers, and rate limits in `docs/protocol.md`. Write only what you observed. Do not guess.
3. Keep captures, HAR files, tokens, and `.env` out of git.
4. Implement the adapter against those notes.
5. Keep `--apply` dry-run-safe until a real write path is confirmed.

Effort and debug access (UART, serial pads, local API) are unknown until the box is on the bench. Rate them then.

## License

MIT. See [LICENSE](LICENSE).
