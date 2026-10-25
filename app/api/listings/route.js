import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { moderate, loadListingImages } from "@/lib/gemini";
import { cleanListingInput, listingText, statusFromVerdict } from "@/lib/listing-input";
import { MAX_ACTIVE_LISTINGS } from "@/lib/constants";

// POST /api/listings -> create a listing, then let the ai check it
export async function POST(request) {
  const { supabase, userId } = await getUser();
  if (!userId) return NextResponse.json({ error: "log in first" }, { status: 401 });

  const { data: input, error: inputError } = cleanListingInput(await request.json());
  if (inputError) return NextResponse.json({ error: inputError }, { status: 400 });

  // simple spam limit
  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", userId)
    .in("status", ["pending", "active", "flagged"]);
  if (count >= MAX_ACTIVE_LISTINGS) {
    return NextResponse.json(
      { error: `you already have ${MAX_ACTIVE_LISTINGS} listings up. mark some as sold first.` },
      { status: 429 }
    );
  }

  // 1. save it as "pending" using the student's own login, so row level security applies
  const { data: listing, error } = await supabase.from("listings").insert(input).select("id").single();
  if (error) {
    console.error("insert listing failed:", error.message);
    return NextResponse.json({ error: "couldn't save your listing" }, { status: 500 });
  }

  // 2. ai checks the text + photos
  const images = await loadListingImages(input.images, userId);
  const result = await moderate({ text: listingText(input), images });
  const status = statusFromVerdict(result);

  // 3. only the server is allowed to make a listing live
  const admin = createAdminClient();
  if (admin) {
    await admin
      .from("listings")
      .update({ status, ai_verdict: result.verdict, ai_reason: result.reason })
      .eq("id", listing.id);
  }

  return NextResponse.json({ id: listing.id, status: admin ? status : "pending" });
}
