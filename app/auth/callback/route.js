import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/format";

// google sends the user back here with a one-time code.
// we swap the code for a login session (saved in a cookie).
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  // supabase sends an error back when our database trigger blocks a non-nsut email
  if (searchParams.get("error")) {
    const description = searchParams.get("error_description") || "";
    const reason = /database error|nsut/i.test(description) ? "nsut" : "failed";
    return NextResponse.redirect(`${origin}/login?error=${reason}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=failed`);
}
