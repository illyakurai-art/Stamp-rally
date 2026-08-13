import { NextRequest, NextResponse } from "next/server";

const MAX_HOPS = 5;
const REQUEST_TIMEOUT_MS = 8000;

function isAllowedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === "localhost" ||
    h === "stamprally-nvgr.vercel.app" ||
    h.endsWith(".vercel.app")
  );
}

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || h.endsWith(".lan")) {
    return true;
  }
  // Indirizzi IP letterali in range privati/riservati (anti-SSRF)
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = ipv4.slice(1).map((n) => parseInt(n, 10));
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      a === 169 && b === 254 ||
      a === 192 && b === 168 ||
      a === 172 && b >= 16 && b <= 31 ||
      a >= 224
    );
  }
  return false;
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) {
    return NextResponse.json({ url: null, error: "missing url" }, { status: 400 });
  }

  let currentUrl: URL;
  try {
    currentUrl = new URL(raw);
  } catch {
    return NextResponse.json({ url: null, error: "invalid url" }, { status: 400 });
  }

  if (!/^https?:\/\//i.test(currentUrl.toString())) {
    return NextResponse.json({ url: null, error: "unsupported protocol" }, { status: 400 });
  }

  if (isBlockedHost(currentUrl.hostname)) {
    return NextResponse.json({ url: null, error: "blocked host" }, { status: 400 });
  }

  let current = currentUrl.toString();

  for (let i = 0; i < MAX_HOPS; i++) {
    let res: Response;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      res = await fetch(current, {
        redirect: "manual",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeout);
    } catch {
      return NextResponse.json({ url: null });
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) break;
      const next = new URL(location, current);
      if (isBlockedHost(next.hostname)) {
        return NextResponse.json({ url: null });
      }
      current = next.toString();
      continue;
    }
    break;
  }

  try {
    const final = new URL(current);
    return NextResponse.json({ url: isAllowedHost(final.hostname) ? current : null });
  } catch {
    return NextResponse.json({ url: null });
  }
}