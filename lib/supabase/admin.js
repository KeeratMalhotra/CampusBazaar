import "server-only";
import { createClient } from "@supabase/supabase-js";

// a supabase client that SKIPS all row level security.
// only used on the server, after we've checked who the user is ourselves:
//  - approving a listing after the ai check
//  - saving reports
//  - admin actions
// "server-only" makes the build fail if this file ever ends up in browser code.
export function createAdminClient() {
  if (!process.env.SUPABASE_SECRET_KEY) {
    return null;
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
