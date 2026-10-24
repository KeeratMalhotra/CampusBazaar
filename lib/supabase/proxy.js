import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// runs before every page load.
// its only job right now: keep the user's login fresh.
export async function updateSession(request) {
  let response = NextResponse.next({ request });

  // no keys yet? skip so the site still runs
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          // stops CDNs from caching one user's login and showing it to someone else
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value)
          );
        },
      },
    }
  );

  // don't put any code between createServerClient and this line,
  // otherwise users can get randomly logged out
  await supabase.auth.getClaims();

  return response;
}
