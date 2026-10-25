import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Avatar from "@/components/Avatar";
import ChatWindow from "./ChatWindow";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "chat | Campus Bazaar" };

export default async function ChatPage({ params }) {
  const { id } = await params;
  const { supabase, userId } = await requireUser(`/chats/${id}`);

  // if you're not in this chat, row level security returns nothing -> 404
  const { data: convo } = await supabase
    .from("conversations")
    .select(
      `id, buyer_id, seller_id,
       listing:listings(id, title, price, images, status),
       buyer:profiles!conversations_buyer_id_fkey(username, avatar_url),
       seller:profiles!conversations_seller_id_fkey(username, avatar_url)`
    )
    .eq("id", id)
    .maybeSingle();
  if (!convo) notFound();

  // older messages come from the database, new ones arrive live in ChatWindow
  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(300);

  const other = convo.buyer_id === userId ? convo.seller : convo.buyer;

  return (
    <section className="mx-auto flex max-w-3xl flex-col px-4 py-6">
      {/* header */}
      <div className="card flex items-center gap-3 p-3">
        <Link href="/chats" aria-label="back" className="grid h-10 w-10 place-items-center rounded-full hover:bg-paper">
          <ArrowLeft />
        </Link>
        <Avatar profile={other} size={44} />
        <div className="min-w-0 flex-1">
          <Link href={`/u/${other?.username}`} className="font-display text-lg font-bold hover:underline">
            @{other?.username}
          </Link>
          {convo.listing ? (
            <Link href={`/listing/${convo.listing.id}`} className="block truncate text-sm text-ink/60 hover:underline">
              {convo.listing.title} · {formatPrice(convo.listing.price)}
              {convo.listing.status === "sold" && " · sold"}
            </Link>
          ) : (
            <p className="text-sm text-ink/50">listing no longer available</p>
          )}
        </div>
        {convo.listing?.images?.[0] && (
          <div className="relative hidden h-12 w-12 overflow-hidden rounded-lg border-2 border-ink sm:block">
            <Image src={convo.listing.images[0]} alt="" fill sizes="48px" className="object-cover" />
          </div>
        )}
      </div>

      <ChatWindow conversationId={id} userId={userId} initialMessages={messages || []} />
    </section>
  );
}
