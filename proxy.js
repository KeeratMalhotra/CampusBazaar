import { updateSession } from "@/lib/supabase/proxy";

// next.js runs this before each request (it used to be called middleware)
export async function proxy(request) {
  return await updateSession(request);
}

export const config = {
  // skip static files and images
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
