import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import ProfileForm from "./ProfileForm";
import ListingCard from "@/components/ListingCard";
import EmptyState from "@/components/EmptyState";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "your profile | Campus Bazaar" };

const STATUS_LABEL = {
  pending: { text: "in review", color: "bg-sun" },
  flagged: { text: "flagged", color: "bg-pink" },
  removed: { text: "removed", color: "bg-ink text-white" },
};

export default async function MePage() {
  const { supabase, userId, profile } = await requireUser("/me");

  // you can see ALL your own listings, even ones still in review
  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price, category, type, condition, images, status, created_at")
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-5xl font-extrabold tracking-tight">
          hey, <span className="marker -rotate-1 bg-pink">@{profile.username}</span>
        </h1>
        <div className="flex gap-3">
          <Link href={`/u/${profile.username}`} className="btn bg-white text-sm">
            <ExternalLink size={16} /> public profile
          </Link>
          <form action="/auth/signout" method="post">
            <button className="btn bg-white text-sm">
              <LogOut size={16} /> log out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[380px_1fr]">
        <ProfileForm profile={profile} />

        <div>
          <h2 className="font-display text-3xl font-extrabold">your listings</h2>
          <div className="mt-6">
            {listings?.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing) => (
                  <div key={listing.id} className="relative">
                    {STATUS_LABEL[listing.status] && (
                      <span className={`chip absolute -top-3 right-3 z-10 ${STATUS_LABEL[listing.status].color}`}>
                        {STATUS_LABEL[listing.status].text}
                      </span>
                    )}
                    <ListingCard listing={{ ...listing, seller: profile }} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState emoji="🧺" title="nothing posted yet" actionHref="/sell" actionLabel="post your first listing" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
