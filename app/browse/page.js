import Link from "next/link";
import { Search } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import EmptyState from "@/components/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/constants";

export const metadata = { title: "browse | Campus Bazaar" };

const SORTS = {
  newest: { column: "created_at", ascending: false },
  cheap: { column: "price", ascending: true },
  pricey: { column: "price", ascending: false },
};

export default async function BrowsePage({ searchParams }) {
  const params = await searchParams;
  const q = (params.q || "").trim().slice(0, 100);
  const category = CATEGORIES.some((c) => c.slug === params.category) ? params.category : "";
  const type = ["offer", "request"].includes(params.type) ? params.type : "";
  const maxPrice = Number(params.max) > 0 ? Number(params.max) : null;
  const free = params.free === "1";
  const sort = SORTS[params.sort] ? params.sort : "newest";

  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select("id, title, price, category, type, condition, images, status, created_at, seller:profiles(username)")
    .eq("status", "active")
    .order(SORTS[sort].column, { ascending: SORTS[sort].ascending })
    .limit(60);

  // full text search in postgres ("websearch" understands things like "dsa notes" or "-hardcopy")
  if (q) query = query.textSearch("search", q, { type: "websearch", config: "english" });
  if (category) query = query.eq("category", category);
  if (type) query = query.eq("type", type);
  if (free) query = query.eq("price", 0);
  else if (maxPrice) query = query.lte("price", maxPrice);

  const { data: listings, error } = await query;

  // builds a link that keeps the other filters but changes one
  function linkWith(changes) {
    const next = { q, category, type, sort, max: maxPrice || "", free: free ? "1" : "", ...changes };
    const search = new URLSearchParams(Object.entries(next).filter(([, value]) => value));
    return `/browse?${search.toString()}`;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">
        {category ? CATEGORIES.find((c) => c.slug === category).name : "everything"}
        <span className="text-pink">.</span>
      </h1>

      {/* a plain html form: submitting it just changes the url, no javascript needed */}
      <form action="/browse" className="mt-6 flex flex-col gap-3 lg:flex-row">
        <label className="card flex flex-1 items-center gap-2 px-4 py-2.5">
          <Search size={20} />
          <input
            name="q"
            defaultValue={q}
            placeholder="search 'dsa notes', 'cycle', 'casio'..."
            className="w-full bg-transparent font-medium outline-none placeholder:text-ink/40"
          />
        </label>
        {category && <input type="hidden" name="category" value={category} />}

        <div className="flex flex-wrap gap-3">
          <select name="type" defaultValue={type} className="card px-3 py-2.5 font-semibold">
            <option value="">offers + requests</option>
            <option value="offer">for sale / free</option>
            <option value="request">looking for</option>
          </select>
          <select name="sort" defaultValue={sort} className="card px-3 py-2.5 font-semibold">
            <option value="newest">newest</option>
            <option value="cheap">cheapest</option>
            <option value="pricey">priciest</option>
          </select>
          <input
            name="max"
            type="number"
            min="1"
            defaultValue={maxPrice || ""}
            placeholder="max ₹"
            className="card w-28 px-3 py-2.5 font-semibold"
          />
          <label className="card flex items-center gap-2 px-3 py-2.5 font-semibold">
            <input type="checkbox" name="free" value="1" defaultChecked={free} className="h-4 w-4 accent-ink" />
            free only
          </label>
          <button className="btn bg-ink text-white">go</button>
        </div>
      </form>

      {/* category chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={linkWith({ category: "" })} className={`chip px-3 py-1 text-xs ${!category ? "bg-ink text-white" : "bg-white"}`}>
          all
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={linkWith({ category: c.slug })}
            className={`chip px-3 py-1 text-xs ${category === c.slug ? `${c.color} shadow-brutal-sm` : "bg-white"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        {error ? (
          <EmptyState emoji="😵" title="something broke" text="couldn't load listings. try refreshing." />
        ) : listings.length === 0 ? (
          <EmptyState
            emoji="🦗"
            title="nothing here yet"
            text={q ? `no results for "${q}". try fewer words?` : "be the first one to post something."}
            actionHref="/sell"
            actionLabel="post a listing"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
