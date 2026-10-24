import { UAParser } from "ua-parser-js";

export interface ParsedUserAgent {
  /** Stable identity of the browser/device, ignoring versions. */
  fingerprint: string;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
}

/**
 * Parse a user agent into a stable device fingerprint plus display-friendly
 * browser/OS/device details. Versions are intentionally dropped so routine
 * browser auto-updates do not read as a brand new device.
 */
export function parseUserAgent(userAgent: string): ParsedUserAgent {
  const { browser, os, device } = UAParser(userAgent);

  const browserName = browser.name ?? null;
  const osName = os.name ?? null;
  const deviceType = device.type ?? null;

  return {
    fingerprint: [
      browserName ?? "unknown",
      osName ?? "unknown",
      deviceType ?? "unknown",
    ].join("|"),
    browser: browserName,
    os: osName,
    deviceType,
  };
}

export function deviceFingerprint(userAgent: string): string {
  return parseUserAgent(userAgent).fingerprint;
}
