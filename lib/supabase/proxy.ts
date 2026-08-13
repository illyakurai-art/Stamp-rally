import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  request.headers.set("x-pathname", pathname);
  let supabaseResponse = NextResponse.next({ request });

  // Cache-control per risorse non-sensibili
  if (
    pathname === "/mappa.jpg" ||
    pathname === "/map-icon.png" ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/_next/")
  ) {
    supabaseResponse.headers.set(
      "Cache-Control",
      "public, max-age=3600, s-maxage=86400, stale-while-revalidate=31536000"
    );
  }

  // Se le env vars non sono impostate, salta il proxy check
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // --- Redirect utenti non autenticati verso sign-up ---
  if (
    !user &&
    pathname !== "/" &&
    !pathname.startsWith("/auth") &&
    !pathname.startsWith("/admin/login") &&
    pathname !== "/privacy"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-up";
    return NextResponse.redirect(url);
  }

  // --- Logica basata sul ruolo per utenti autenticati ---
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.sub)
      .maybeSingle();

    const isStaff = profile?.role === "staff";

    if (isStaff && pathname.startsWith("/protected")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    if (isStaff && pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    if (isStaff && pathname.startsWith("/admin/login")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    if (!isStaff && pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
