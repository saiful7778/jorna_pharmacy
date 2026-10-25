const IP_HEADERS = [
  "cf-connecting-ip", // Cloudflare
  "x-vercel-forwarded-for", // Vercel (set by the platform, not spoofable)
  "fly-client-ip", // Fly.io
  "fastly-client-ip", // Fastly
  "x-nf-client-connection-ip", // Netlify
  "x-azure-clientip", // Azure Front Door / App Service
  "true-client-ip", // Cloudflare Enterprise / Akamai
  "x-real-ip", // Nginx, Vercel, Railway, many proxies
  "x-client-ip",
  "x-forwarded-for", // Standard (Render, Railway, Heroku, AWS ALB...)
  "x-cluster-client-ip",
  "forwarded", // RFC 7239
  "cloudfront-viewer-address", // AWS CloudFront (ip:port)
] as const;

const IPV4 =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
const IPV6 = /^[0-9a-f:.]+$/i;

function normalize(raw: string): string | null {
  let ip = raw.trim().replace(/^"|"$/g, "");
  if (!ip) return null;

  // "[2001:db8::1]:4711" -> "2001:db8::1"
  if (ip.startsWith("[")) {
    const end = ip.indexOf("]");
    if (end === -1) return null;
    ip = ip.slice(1, end);
  } else if (ip.includes(".") && ip.split(":").length === 2) {
    // "1.2.3.4:5678" -> "1.2.3.4"
    ip = ip.split(":")[0]!;
  }

  // IPv4-mapped IPv6: "::ffff:1.2.3.4" -> "1.2.3.4"
  ip = ip.replace(/^::ffff:/i, "");

  if (IPV4.test(ip)) return ip;
  if (ip.includes(":") && ip.split(":").length >= 3 && IPV6.test(ip)) {
    return ip.toLowerCase();
  }
  return null;
}

function parseHeader(name: string, value: string): string | null {
  if (name === "forwarded") {
    // Forwarded: for=192.0.2.60;proto=http, for="[2001:db8::1]:4711"
    for (const part of value.split(",")) {
      const match = /for="?([^;,"]+)"?/i.exec(part);
      const ip = match && normalize(match[1]!);
      if (ip) return ip;
    }
    return null;
  }

  // x-forwarded-for etc: "client, proxy1, proxy2" -> first valid entry
  for (const part of value.split(",")) {
    const ip = normalize(part);
    if (ip) return ip;
  }
  return null;
}

export function getIp(headers: Headers): string {
  for (const name of IP_HEADERS) {
    const value = headers.get(name);
    if (!value) continue;
    const ip = parseHeader(name, value);
    if (ip) return ip;
  }
  return "127.0.0.1";
}
