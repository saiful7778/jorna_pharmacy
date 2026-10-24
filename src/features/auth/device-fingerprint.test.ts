import { describe, expect, it } from "vitest";

import { deviceFingerprint, parseUserAgent } from "./device-fingerprint";

const CHROME_WINDOWS =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const CHROME_WINDOWS_UPDATED =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
const SAFARI_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15";

describe("parseUserAgent", () => {
  it("extracts browser, os and device type", () => {
    const parsed = parseUserAgent(CHROME_WINDOWS);

    expect(parsed.browser).toBe("Chrome");
    expect(parsed.os).toBe("Windows");
    expect(parsed.fingerprint).toBe("Chrome|Windows|unknown");
  });

  it("ignores user agent versions", () => {
    expect(deviceFingerprint(CHROME_WINDOWS)).toBe(
      deviceFingerprint(CHROME_WINDOWS_UPDATED)
    );
  });

  it("distinguishes different browsers or platforms", () => {
    expect(deviceFingerprint(CHROME_WINDOWS)).not.toBe(
      deviceFingerprint(SAFARI_MAC)
    );
  });
});
