import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { moderate, loadListingImages } from "@/lib/gemini";
import { cleanListingInput, listingText, statusFromVerdict } from "@/lib/listing-input";

// the ai check can take a few seconds, so give this route up to 60s on vercel
export const maxDuration = 60;

// PUT /api/listings/:id -> edit your listing. edits get checked by the ai again.
export async function PUT(request, { params }) {
  const { id } = await params;
  const { supabase, userId } = await getUser();
  if (!userId) return NextResponse.json({ error: "log in first" }, { status: 401 });

  // students can't edit listings directly in the database (only the status),
  // so we check ownership here and save with the admin client
  const { data: existing } = await supabase
    .from("listings")
    .select("id, seller_id, status")
    .eq("id", id)
    .single();
  if (!existing || existing.seller_id !== userId) {
    return NextResponse.json({ error: "that's not your listing" }, { status: 403 });
  }
  if (existing.status === "removed") {
    return NextResponse.json({ error: "this listing was removed by a moderator" }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "editing isn't set up yet" }, { status: 500 });

  const { data: input, error: inputError } = cleanListingInput(await request.json());
  if (inputError) return NextResponse.json({ error: inputError }, { status: 400 });

  const images = await loadListingImages(input.images, userId);
  const result = await moderate({ text: listingText(input), images });
  let status = statusFromVerdict(result);
  // editing a sold listing keeps it sold, as long as it's still fine
  if (existing.status === "sold" && status === "active") status = "sold";

  const { error } = await admin
    .from("listings")
    .update({ ...input, status, ai_verdict: result.verdict, ai_reason: result.reason })
    .eq("id", id);
  if (error) return NextResponse.json({ error: "couldn't save changes" }, { status: 500 });

  return NextResponse.json({ id, status });
}
