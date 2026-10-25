import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Clock, AlertTriangle, PartyPopper, Ban } from "lucide-react";
import Gallery from "@/components/Gallery";
import Avatar from "@/components/Avatar";
import ReportButton from "@/components/ReportButton";
import OwnerActions from "./OwnerActions";
import { startChat } from "./actions";
import { getUser } from "@/lib/auth";
import { getCategory, conditionLabel } from "@/lib/constants";
import { formatPrice, timeAgo, joinedMonth } from "@/lib/format";

// little banner at the top for the seller (or after posting)
function StatusBanner({ status, justPosted, aiReason }) {
  if (status === "active" && justPosted) {
    return (
      <div className="card mb-6 flex items-center gap-3 bg-lime px-5 py-4 font-semibold">
        <PartyPopper /> you&apos;re live! the ai gave it a thumbs up.
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div className="card mb-6 flex items-center gap-3 bg-sun px-5 py-4 font-semibold">
        <Clock /> waiting for a quick review by a mod. only you can see it for now.
      </div>
    );
  }
  if (status === "flagged") {
    return (
      <div className="card mb-6 bg-pink px-5 py-4">
        <p className="flex items-center gap-3 font-semibold">
          <AlertTriangle /> the ai flagged this, so it&apos;s hidden until a mod checks it.
        </p>
        {aiReason && <p className="mt-1 pl-9 text-sm">reason: {aiReason}</p>}
      </div>
    );
  }
  if (status === "removed") {
    return (
      <div className="card mb-6 flex items-center gap-3 bg-ink px-5 py-4 font-semibold text-white">
        <Ban /> a moderator removed this listing.
      </div>
    );
  }
  return null;
}

export default async function ListingPage({ params, searchParams }) {
  const { id } = await params;
  const { posted, error } = await searchParams;
  const { supabase, userId } = await getUser();

  // row level security hides pending/flagged listings from everyone except the seller and mods
  const { data: listing } = await supabase
    .from("listings")
    .select("*, seller:profiles(id, username, avatar_url, created_at)")
    .eq("id", id)
    .maybeSingle();
  if (!listing) notFound();

  const category = getCategory(listing.category);
  const isOwner = userId === listing.seller_id;
  const isHelp = listing.category === "help";

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      {isOwner && <StatusBanner status={listing.status} justPosted={Boolean(posted)} aiReason={listing.ai_reason} />}

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <Gallery images={listing.images} title={listing.title} category={listing.category} color={category.color} />

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Link href={`/browse?category=${category.slug}`} className={`chip ${category.color}`}>{category.name}</Link>
            {listing.type === "request" && <span className="chip bg-white">🙋 {isHelp ? "needs help" : "looking for"}</span>}
            {conditionLabel(listing.condition) && <span className="chip bg-white">{conditionLabel(listing.condition)}</span>}
            {listing.notes_format && <span className="chip bg-white">{listing.notes_format === "softcopy" ? "soft copy" : "hard copy"}</span>}
            {listing.status === "sold" && <span className="chip bg-pink">sold</span>}
          </div>

          <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">{listing.title}</h1>

          <div className="flex items-baseline gap-3">
            <span className="marker -rotate-1 bg-sun font-mono text-3xl font-bold">{formatPrice(listing.price)}</span>
            {listing.negotiable && <span className="font-semibold text-ink/60">negotiable</span>}
          </div>

          {listing.description && (
            <p className="whitespace-pre-line text-lg leading-relaxed text-ink/80">{listing.description}</p>
          )}

          <p className="text-sm text-ink/50">posted {timeAgo(listing.created_at)}</p>

          {/* seller */}
          <Link href={`/u/${listing.seller?.username}`} className="card flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5">
            <Avatar profile={listing.seller} size={48} />
            <div>
              <p className="font-display text-lg font-bold">@{listing.seller?.username}</p>
              <p className="text-sm text-ink/60">on campus bazaar since {joinedMonth(listing.seller?.created_at)}</p>
            </div>
          </Link>

          {/* actions */}
          {isOwner ? (
            <OwnerActions listing={listing} />
          ) : listing.status === "active" ? (
            <div className="space-y-3">
              <form action={startChat.bind(null, listing.id)}>
                <button className="btn w-full bg-lime text-lg">
                  <MessageCircle size={20} />
                  {userId ? (isHelp ? "message them" : "chat with seller") : "log in to chat"}
                </button>
              </form>
              {error === "chat" && <p className="text-sm font-semibold text-red-600">couldn&apos;t start the chat, try again.</p>}
              <p className="text-center text-xs text-ink/50">
                tip: meet in a public spot on campus. never pay before you see the item.
              </p>
            </div>
          ) : (
            <p className="card bg-white px-5 py-4 font-semibold">this one&apos;s already sold 😔</p>
          )}

          {userId && !isOwner && (
            <div className="flex justify-end">
              <ReportButton targetType="listing" targetId={listing.id} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
