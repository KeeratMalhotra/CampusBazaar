import Link from "next/link";
import Image from "next/image";
import CategoryIcon from "./CategoryIcon";
import { getCategory, conditionLabel } from "@/lib/constants";
import { formatPrice, timeAgo } from "@/lib/format";

// a slight random-looking tilt on hover, based on the listing id
const TILTS = ["hover:-rotate-1", "hover:rotate-1", "hover:-rotate-[0.5deg]", "hover:rotate-[0.5deg]"];

export default function ListingCard({ listing }) {
  const category = getCategory(listing.category);
  const photo = listing.images?.[0];
  const tilt = TILTS[listing.id.charCodeAt(0) % TILTS.length];

  return (
    <Link
      href={`/listing/${listing.id}`}
      className={`card group flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-brutal-lg ${tilt}`}
    >
      <div className={`relative aspect-[4/3] border-b-[2.5px] border-ink ${category.color}`}>
        {photo ? (
          <Image
            src={photo}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, 300px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <CategoryIcon slug={listing.category} size={48} strokeWidth={2} />
          </div>
        )}

        {listing.type === "request" && (
          <span className="chip absolute left-3 top-3 bg-white">🙋 looking for</span>
        )}

        {listing.status === "sold" && (
          <div className="absolute inset-0 grid place-items-center bg-ink/40">
            <span className="marker -rotate-6 bg-pink font-display text-3xl font-extrabold">SOLD</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="chip bg-white">{category.name}</span>
          <span className="font-mono text-base font-bold">{formatPrice(listing.price)}</span>
        </div>

        <h3 className="line-clamp-2 font-display text-lg font-bold leading-tight">{listing.title}</h3>

        <div className="mt-auto flex items-center justify-between pt-1 text-xs text-ink/60">
          <span className="truncate">@{listing.seller?.username || "someone"}</span>
          <span className="shrink-0">
            {conditionLabel(listing.condition) ? `${conditionLabel(listing.condition)} · ` : ""}
            {timeAgo(listing.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}
