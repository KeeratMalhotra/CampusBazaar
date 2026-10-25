"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function GoogleButton({ next }) {
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        queryParams: {
          // asks google to only show nsut accounts.
          // this is just a hint, the real check happens in the database.
          hd: "nsut.ac.in",
          prompt: "select_account",
        },
      },
    });
    // the page now goes to google, so we don't turn loading off
  }

  return (
    <button onClick={login} disabled={loading} className="btn w-full bg-lime text-lg disabled:opacity-60">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.3 0-6-2.74-6-6.1s2.7-6.1 6-6.1c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.54 0 9.2-3.9 9.2-9.38 0-.63-.07-1.11-.15-1.6H12z" />
      </svg>
      {loading ? "taking you to google..." : "continue with google"}
    </button>
  );
}
