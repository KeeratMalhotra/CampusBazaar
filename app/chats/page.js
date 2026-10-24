import Link from "next/link";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";
import { requireUser } from "@/lib/auth";
import { timeAgo } from "@/lib/format";

export const metadata = { title: "chats | Campus Bazaar" };

export default async function ChatsPage() {
  const { supabase, userId } = await requireUser("/chats");

  // row level security only returns chats where you're the buyer or the seller
  const { data: convos } = await supabase
    .from("conversations")
    .select(
      `id, created_at, buyer_id,
       listing:listings(id, title),
       buyer:profiles!conversations_buyer_id_fkey(username, avatar_url),
       seller:profiles!conversations_seller_id_fkey(username, avatar_url),
       messages(content, created_at, sender_id)`
    )
    .order("created_at", { referencedTable: "messages", ascending: false })
    .limit(1, { referencedTable: "messages" });

  // newest activity on top
  const chats = (convos || [])
    .map((c) => ({
      ...c,
      other: c.buyer_id === userId ? c.seller : c.buyer,
      iAmBuyer: c.buyer_id === userId,
      last: c.messages?.[0],
      lastAt: c.messages?.[0]?.created_at || c.created_at,
    }))
    .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">
        chats <span className="inline-block rotate-6">💬</span>
      </h1>

      <div className="mt-8 space-y-4">
        {chats.length === 0 ? (
          <EmptyState
            emoji="📭"
            title="no chats yet"
            text="find something you like and hit 'chat with seller'."
            actionHref="/browse"
            actionLabel="go browse"
          />
        ) : (
          chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chats/${chat.id}`}
              className="card flex items-center gap-4 p-4 transition-transform hover:-translate-y-0.5"
            >
              <Avatar profile={chat.other} size={52} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-display text-lg font-bold">@{chat.other?.username}</p>
                  <span className="shrink-0 text-xs text-ink/50">{timeAgo(chat.lastAt)}</span>
                </div>
                <p className="truncate text-sm font-semibold text-ink/70">
                  <span className={`chip mr-2 ${chat.iAmBuyer ? "bg-sky" : "bg-sun"}`}>
                    {chat.iAmBuyer ? "buying" : "selling"}
                  </span>
                  {chat.listing?.title || "listing no longer available"}
                </p>
                <p className="mt-1 truncate text-sm text-ink/60">
                  {chat.last
                    ? `${chat.last.sender_id === userId ? "you: " : ""}${chat.last.content}`
                    : "no messages yet, say hi 👋"}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
