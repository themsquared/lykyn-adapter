# Lykyn protocol notes

Fill this from a real capture after the box arrives. Write only what you observed. Do not invent values.

Captures, HAR files, tokens, and `.env` stay local. They are gitignored. Do not commit them.

## Status

Unknown until capture.

Hardware is arriving. App traffic has not been sniffed. The adapter is a stub.

## Auth

Unknown until capture.

- Method (email/password, token, OAuth, local pairing, other): unknown until capture
- Login request: unknown until capture
- Token header or cookie name: unknown until capture
- Token lifetime / refresh: unknown until capture
- MFA or device pairing: unknown until capture

## Base URL

Unknown until capture.

- Cloud host: unknown until capture
- Local host or mDNS name: unknown until capture
- TLS / certificate notes: unknown until capture

Do not guess a host. Leave this blank until a capture shows one.

## Devices list

Unknown until capture.

- Endpoint: unknown until capture
- Method: unknown until capture
- Request fields: unknown until capture
- Response fields (device id, name, online): unknown until capture

## Read sensors

Unknown until capture.

- Endpoint: unknown until capture
- Method: unknown until capture
- Observed readings (temperature, humidity, CO2, other): unknown until capture
- Units: unknown until capture
- Poll interval used by the app: unknown until capture

## Set setpoints

Unknown until capture.

- Endpoint: unknown until capture
- Method: unknown until capture
- Writable fields: unknown until capture
- Units and ranges: unknown until capture
- Whether a write is a full replace or a patch: unknown until capture

## Rate limits

Unknown until capture.

- Observed 429 or throttle behavior: unknown until capture
- App retry spacing: unknown until capture

## Observed headers

Unknown until capture.

- User-Agent: unknown until capture
- Auth header: unknown until capture
- Other required headers: unknown until capture

## Debug access

Unknown until the box is on the bench.

- UART / serial pads: unknown until capture
- Local HTTP or MQTT: unknown until capture
- Effort tier (once rated): unknown until capture

Rate effort after you look. Do not call the box locked down.

## How to capture

1. Use the official Lykyn app on a network you control.
2. Log in, list devices, read sensors, change one setpoint.
3. Record the requests. Note method, path, headers, and body shapes.
4. Write the facts into the sections above. Leave unknown items as unknown.
5. Keep raw captures out of git.
