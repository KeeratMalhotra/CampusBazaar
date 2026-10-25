import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// a POST (not a link) so other websites can't log you out with a sneaky <img> tag
export async function POST(request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
