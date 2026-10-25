import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// who is logged in? returns { supabase, userId, profile }.
// userId and profile are null when nobody is logged in.
export async function getUser() {
  const supabase = await createClient();

  // getClaims() checks the login token is real (don't trust getSession() on the server)
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub ?? null;

  let profile = null;
  if (userId) {
    const { data: row } = await supabase.from("profiles").select("*").eq("id", userId).single();
    profile = row;
  }

  return { supabase, userId, profile };
}

// same as getUser() but sends you to the login page if you're not logged in
export async function requireUser(currentPath) {
  const result = await getUser();
  if (!result.userId) {
    redirect(`/login?next=${encodeURIComponent(currentPath)}`);
  }
  return result;
}
