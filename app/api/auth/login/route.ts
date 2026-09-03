import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function nicknameToFakeEmail(nickname: string): string {
  const safe = nickname.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "_");
  return `${safe}@stamprally.local`;
}

export async function POST(request: NextRequest) {
  try {
    const { nickname, password } = await request.json();

    if (!nickname || !password) {
      return NextResponse.json(
        { error: "Nickname e password richiesti" },
        { status: 400 }
      );
    }

    // Legge l'IP reale dell'utente dal proxy/CDN
    const clientIp =
      request.headers.get("x-real-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "127.0.0.1";

    const email = nicknameToFakeEmail(nickname);

    // Usa createServerClient con anon key + X-Forwarded-For per rate limiting per-IP
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: { getAll: () => [], setAll: () => {} },
        global: {
          headers: {
            "X-Forwarded-For": clientIp,
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const isInvalidCredentials =
        error.message.toLowerCase().includes("invalid login") ||
        error.message.toLowerCase().includes("invalid credentials");

      const isRateLimit =
        error.status === 429 ||
        error.message.toLowerCase().includes("rate") ||
        error.message.toLowerCase().includes("too many");

      if (isRateLimit) {
        console.warn(`[auth/login] rate limit hit — IP: ${clientIp}`);
        return NextResponse.json(
          { error: "Troppi tentativi, riprova tra poco" },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: isInvalidCredentials ? "Nickname o password errati" : error.message },
        { status: 401 }
      );
    }

    return NextResponse.json({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      user_id: data.user?.id,
    });
  } catch (err) {
    console.error("[api/auth/login] error:", err);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
