"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// every action checks you're an admin first.
// never trust the button just because it's only shown to admins.
async function adminOnly() {
  const { userId, profile } = await getUser();
  if (profile?.role !== "admin") throw new Error("admins only");
  return { userId, admin: createAdminClient() };
}

export async function approveListing(listingId) {
  const { admin } = await adminOnly();
  await admin.from("listings").update({ status: "active" }).eq("id", listingId);
  revalidatePath("/admin");
}

export async function removeListing(listingId) {
  const { admin } = await adminOnly();
  await admin.from("listings").update({ status: "removed" }).eq("id", listingId);
  revalidatePath("/admin");
}

export async function dismissReport(reportId) {
  const { userId, admin } = await adminOnly();
  await admin
    .from("reports")
    .update({ status: "dismissed", reviewed_by: userId, reviewed_at: new Date().toISOString() })
    .eq("id", reportId);
  revalidatePath("/admin");
}

// agree with the report: take the listing down or delete the message
export async function actionReport(reportId) {
  const { userId, admin } = await adminOnly();

  const { data: report } = await admin
    .from("reports")
    .select("id, target_type, listing_id, message_id")
    .eq("id", reportId)
    .single();
  if (!report) return;

  if (report.target_type === "listing" && report.listing_id) {
    await admin.from("listings").update({ status: "removed" }).eq("id", report.listing_id);
  }
  if (report.target_type === "message" && report.message_id) {
    await admin.from("messages").delete().eq("id", report.message_id);
  }

  // close every open report about the same thing
  const column = report.target_type === "listing" ? "listing_id" : "message_id";
  const targetId = report.listing_id || report.message_id;
  await admin
    .from("reports")
    .update({ status: "actioned", reviewed_by: userId, reviewed_at: new Date().toISOString() })
    .or(`id.eq.${report.id}${targetId ? `,${column}.eq.${targetId}` : ""}`)
    .eq("status", "open");

  revalidatePath("/admin");
}
