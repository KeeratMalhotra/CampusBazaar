"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, CheckCircle2, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { storagePathFromUrl } from "@/lib/images";

// buttons only the seller sees on their own listing
export default function OwnerActions({ listing }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggleSold() {
    setBusy(true);
    const supabase = createClient();
    // row level security + a database trigger make sure only the seller
    // can do this, and only between "active" and "sold"
    const { error } = await supabase
      .from("listings")
      .update({ status: listing.status === "sold" ? "active" : "sold" })
      .eq("id", listing.id);
    setBusy(false);
    if (error) return setError("couldn't update it, try again");
    router.refresh();
  }

  async function remove() {
    if (!confirm("delete this listing for good?")) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("listings").delete().eq("id", listing.id);
    if (error) {
      setBusy(false);
      return setError("couldn't delete it, try again");
    }
    // clean up the photos too
    const paths = listing.images.map((url) => storagePathFromUrl(url, "listing-images")).filter(Boolean);
    if (paths.length) await supabase.storage.from("listing-images").remove(paths);
    router.push("/me");
    router.refresh();
  }

  const canToggle = listing.status === "active" || listing.status === "sold";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {canToggle && (
          <button onClick={toggleSold} disabled={busy} className="btn bg-lime disabled:opacity-60">
            {listing.status === "sold" ? (
              <><RotateCcw size={18} /> mark available</>
            ) : (
              <><CheckCircle2 size={18} /> mark as sold</>
            )}
          </button>
        )}
        {listing.status !== "removed" && (
          <Link href={`/listing/${listing.id}/edit`} className="btn bg-white">
            <Pencil size={18} /> edit
          </Link>
        )}
        <button onClick={remove} disabled={busy} className="btn bg-pink disabled:opacity-60">
          <Trash2 size={18} /> delete
        </button>
      </div>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}
