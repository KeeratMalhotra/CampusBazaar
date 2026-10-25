import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, timeAgo } from "@/lib/format";

export const metadata = { title: "help board | Campus Bazaar" };

const NOTE_COLORS = ["bg-sun", "bg-pink", "bg-sky", "bg-lime", "bg-grape", "bg-tangerine"];
const TILTS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

// one sticky note on the board
function HelpNote({ post, index }) {
  return (
    <Link
      href={`/listing/${post.id}`}
      className={`card block p-5 transition-transform hover:rotate-0 hover:scale-[1.02] ${NOTE_COLORS[index % NOTE_COLORS.length]} ${TILTS[index % TILTS.length]}`}
    >
      <p className="font-display text-xl font-bold leading-snug">{post.title}</p>
      {post.description && <p className="mt-2 line-clamp-3 text-sm text-ink/75">{post.description}</p>}
      <div className="mt-4 flex items-center justify-between text-xs font-semibold">
        <span>@{post.seller?.username}</span>
        <span className="font-mono">
          {formatPrice(post.price)} · {timeAgo(post.created_at)}
        </span>
      </div>
    </Link>
  );
}

export default async function HelpPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("listings")
    .select("id, title, description, price, type, created_at, seller:profiles(username)")
    .eq("status", "active")
    .eq("category", "help")
    .order("created_at", { ascending: false })
    .limit(60);

  const asking = (posts || []).filter((p) => p.type === "request");
  const offering = (posts || []).filter((p) => p.type === "offer");

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-5xl font-extrabold tracking-tight">
            help board <span className="inline-block -rotate-12">📌</span>
          </h1>
          <p className="mt-2 max-w-lg text-ink/70">
            stuck before a quiz? good at something? ask for help or offer doubt sessions.
            tutoring is cool, doing someone&apos;s assignment for them isn&apos;t.
          </p>
        </div>
        <Link href="/sell?category=help" className="btn shrink-0 bg-sun">
          <Plus size={18} strokeWidth={3} /> pin a note
        </Link>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="marker -rotate-1 bg-white font-display text-2xl font-extrabold">🙋 asking for help</h2>
          <div className="mt-6 space-y-5">
            {asking.length === 0 && <p className="text-ink/60">no one&apos;s asking yet. lucky them.</p>}
            {asking.map((post, i) => (
              <HelpNote key={post.id} post={post} index={i} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="marker rotate-1 bg-white font-display text-2xl font-extrabold">🧠 offering help</h2>
          <div className="mt-6 space-y-5">
            {offering.length === 0 && <p className="text-ink/60">nobody&apos;s offering yet. be the hero.</p>}
            {offering.map((post, i) => (
              <HelpNote key={post.id} post={post} index={i + 3} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
