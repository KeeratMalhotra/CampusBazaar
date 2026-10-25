import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { moderate, loadListingImages } from "@/lib/gemini";
import { listingText } from "@/lib/listing-input";
import { REPORT_REASONS, MAX_REPORTS_PER_DAY } from "@/lib/constants";

// the ai check can take a few seconds, so give this route up to 60s on vercel
export const maxDuration = 60;

// POST /api/reports -> a student reports a listing or a chat message.
// gemini gives a first opinion so mods see the worst stuff first.
// the ai never bans anyone. it can only hide a listing until a human looks at it.
export async function POST(request) {
  const { supabase, userId } = await getUser();
  if (!userId) return NextResponse.json({ error: "log in first" }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "reports aren't set up yet" }, { status: 500 });

  const body = await request.json();
  const { targetType, targetId } = body;
  const reason = String(body.reason || "");
  const details = String(body.details || "").trim().slice(0, 500);

  if (!["listing", "message"].includes(targetType) || !targetId) {
    return NextResponse.json({ error: "what are you reporting?" }, { status: 400 });
  }
  if (!REPORT_REASONS.some((r) => r.value === reason)) {
    return NextResponse.json({ error: "pick a reason" }, { status: 400 });
  }

  // spam limit: 10 reports a day
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("reporter_id", userId)
    .gte("created_at", since);
  if (count >= MAX_REPORTS_PER_DAY) {
    return NextResponse.json({ error: "that's a lot of reports today. try again tomorrow." }, { status: 429 });
  }

  // load the reported thing WITH THE STUDENT'S OWN LOGIN.
  // row level security means you can only report stuff you're actually allowed to see
  // (so nobody can report random private messages by guessing ids).
  let report;
  let images = [];

  if (targetType === "listing") {
    const { data: listing } = await supabase
      .from("listings")
      .select("id, seller_id, type, category, title, description, price, images")
      .eq("id", targetId)
      .maybeSingle();
    if (!listing) return NextResponse.json({ error: "listing not found" }, { status: 404 });
    if (listing.seller_id === userId) return NextResponse.json({ error: "you can't report yourself" }, { status: 400 });

    images = await loadListingImages(listing.images.slice(0, 2), listing.seller_id);
    report = {
      listing_id: listing.id,
      reported_user_id: listing.seller_id,
      content_snapshot: listingText(listing),
    };
  } else {
    const { data: message } = await supabase
      .from("messages")
      .select("id, sender_id, content")
      .eq("id", targetId)
      .maybeSingle();
    if (!message) return NextResponse.json({ error: "message not found" }, { status: 404 });
    if (message.sender_id === userId) return NextResponse.json({ error: "you can't report yourself" }, { status: 400 });

    // only this one message goes to the ai and the mods, never the whole chat
    report = {
      message_id: message.id,
      reported_user_id: message.sender_id,
      content_snapshot: message.content,
    };
  }

  const reasonLabel = REPORT_REASONS.find((r) => r.value === reason).label;
  const ai = await moderate({
    text: `A student reported this ${targetType} for: ${reasonLabel}.\n\n${report.content_snapshot}`,
    images,
  });

  const { error } = await admin.from("reports").insert({
    ...report,
    reporter_id: userId,
    target_type: targetType,
    reason,
    details,
    ai_verdict: ai.verdict,
    ai_category: ai.category,
    ai_confidence: ai.confidence,
    ai_reason: ai.reason,
  });
  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "you already reported this one" }, { status: 409 });
    }
    console.error("save report failed:", error.message);
    return NextResponse.json({ error: "couldn't save the report" }, { status: 500 });
  }

  // very sure it breaks the rules? hide the listing until a mod reviews it
  if (targetType === "listing" && ai.verdict === "violates" && ai.confidence >= 0.85) {
    await admin
      .from("listings")
      .update({ status: "flagged", ai_verdict: ai.verdict, ai_reason: ai.reason })
      .eq("id", targetId)
      .in("status", ["active", "pending"]);
  }

  return NextResponse.json({ ok: true });
}
