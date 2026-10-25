"use server";

import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

// "chat with seller" button. opens the existing chat or starts a new one.
export async function startChat(listingId) {
  const { supabase, userId } = await getUser();
  if (!userId) redirect(`/login?next=/listing/${listingId}`);

  const { data: listing } = await supabase
    .from("listings")
    .select("id, seller_id, status")
    .eq("id", listingId)
    .single();
  if (!listing || listing.seller_id === userId) redirect(`/listing/${listingId}`);

  // already chatting about this listing?
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", userId)
    .maybeSingle();
  if (existing) redirect(`/chats/${existing.id}`);

  // the database double checks the listing is live and the seller is right
  const { data: convo, error } = await supabase
    .from("conversations")
    .insert({ listing_id: listingId, seller_id: listing.seller_id })
    .select("id")
    .single();
  if (error) redirect(`/listing/${listingId}?error=chat`);

  redirect(`/chats/${convo.id}`);
}
