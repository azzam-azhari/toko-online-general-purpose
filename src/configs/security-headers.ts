const STATIC_SECURITY_HEADERS = [
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(), payment=(self), usb=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
] as const;

function getTrustedBackendOrigins(supabaseUrl?: string) {
  if (!supabaseUrl) return [];

  try {
    const url = new URL(supabaseUrl);
    if (url.protocol !== "https:" && url.hostname !== "127.0.0.1" && url.hostname !== "localhost") {
      return [];
    }

    const websocket = new URL(url);
    websocket.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return [url.origin, websocket.origin];
  } catch {
    return [];
  }
}

export function buildContentSecurityPolicy({
  supabaseUrl,
  production,
}: {
  supabaseUrl?: string;
  production: boolean;
}) {
  const backendOrigins = getTrustedBackendOrigins(supabaseUrl);
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src 'self' 'unsafe-inline'${production ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://images.unsplash.com ${backendOrigins.filter((origin) => origin.startsWith("http")).join(" ")}`.trim(),
    "font-src 'self' data:",
    `connect-src 'self' ${backendOrigins.join(" ")}${production ? "" : " http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:*"}`.trim(),
    "manifest-src 'self'",
    "worker-src 'self' blob:",
  ];

  if (production) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

export function getSecurityHeaders(supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const production = process.env.NODE_ENV === "production";
  const headers: Array<{ key: string; value: string }> = [
    ...STATIC_SECURITY_HEADERS,
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy({ supabaseUrl, production }),
    },
  ];

  if (production) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}
