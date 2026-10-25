import { notFound } from "next/navigation";
import Avatar from "@/components/Avatar";
import ListingCard from "@/components/ListingCard";
import { createClient } from "@/lib/supabase/server";
import { joinedMonth } from "@/lib/format";

export default async function PublicProfilePage({ params }) {
  const { username } = await params;
  const supabase = await createClient();

  // only public stuff here: username, bio, photo, join date. never the email.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, bio, avatar_url, created_at")
    .eq("username", decodeURIComponent(username))
    .maybeSingle();
  if (!profile) notFound();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, price, category, type, condition, images, status, created_at")
    .eq("seller_id", profile.id)
    .in("status", ["active", "sold"])
    .order("status", { ascending: true }) // active before sold
    .order("created_at", { ascending: false })
    .limit(40);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="card flex flex-col items-center gap-5 bg-white p-8 text-center sm:flex-row sm:text-left">
        <Avatar profile={profile} size={112} />
        <div>
          <h1 className="font-display text-4xl font-extrabold">@{profile.username}</h1>
          {profile.bio && <p className="mt-2 text-lg text-ink/75">{profile.bio}</p>}
          <p className="mt-3 text-sm text-ink/50">
            joined {joinedMonth(profile.created_at)} · {listings?.length || 0} listings
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {listings?.map((listing) => (
          <ListingCard key={listing.id} listing={{ ...listing, seller: profile }} />
        ))}
      </div>
      {!listings?.length && <p className="mt-10 text-center text-ink/60">no listings yet.</p>}
    </section>
  );
}
