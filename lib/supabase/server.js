import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// supabase client for code that runs on the server
// (server components, server actions, api routes)
// make a new one every time, never share it between requests
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // server components can't set cookies.
            // that's fine, proxy.js refreshes the login cookie for us
          }
        },
      },
    }
  );
}
