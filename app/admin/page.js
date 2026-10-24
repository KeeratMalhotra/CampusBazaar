import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Trash2, X, Bot } from "lucide-react";
import { approveListing, removeListing, dismissReport, actionReport } from "./actions";
import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { REPORT_REASONS } from "@/lib/constants";
import { formatPrice, timeAgo } from "@/lib/format";

export const metadata = { title: "mod dashboard | Campus Bazaar" };

const VERDICT_STYLE = {
  violates: "bg-pink",
  unsure: "bg-sun",
  safe: "bg-lime",
};

// what the ai thought, shown on every card
function AiVerdict({ verdict, reason, confidence }) {
  if (!verdict) return null;
  return (
    <div className="flex items-start gap-2 rounded-xl border-2 border-ink bg-white p-3 text-sm">
      <Bot size={18} className="mt-0.5 shrink-0" />
      <div>
        <span className={`chip ${VERDICT_STYLE[verdict]}`}>
          ai: {verdict}
          {confidence != null && ` · ${Math.round(confidence * 100)}%`}
        </span>
        {reason && <p className="mt-1 text-ink/75">{reason}</p>}
      </div>
    </div>
  );
}

function Section({ title, count, children }) {
  return (
    <div>
      <h2 className="flex items-center gap-3 font-display text-3xl font-extrabold">
        {title} <span className="chip bg-ink text-white">{count}</span>
      </h2>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">{children}</div>
      {count === 0 && <p className="mt-2 text-ink/50">all clear ✨</p>}
    </div>
  );
}

export default async function AdminPage() {
  const { profile } = await requireUser("/admin");
  if (profile?.role !== "admin") notFound();

  const admin = createAdminClient();
  if (!admin) {
    return <p className="p-10 text-center font-semibold">add SUPABASE_SECRET_KEY to your env to use the dashboard.</p>;
  }

  // listings that need a human, flagged ones first
  const { data: listings } = await admin
    .from("listings")
    .select("id, title, description, price, category, status, ai_verdict, ai_reason, created_at, seller:profiles(username)")
    .in("status", ["flagged", "pending"])
    .order("status", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(50);

  // open reports. the ai's opinion decides the order: "violates" first
  const { data: rawReports } = await admin
    .from("reports")
    .select("id, target_type, listing_id, reason, details, content_snapshot, ai_verdict, ai_confidence, ai_reason, created_at, reported:profiles!reports_reported_user_id_fkey(username)")
    .eq("status", "open")
    .order("created_at", { ascending: true })
    .limit(100);

  const rank = { violates: 0, unsure: 1, safe: 2 };
  const reports = (rawReports || []).sort(
    (a, b) => (rank[a.ai_verdict] ?? 1) - (rank[b.ai_verdict] ?? 1) || (b.ai_confidence || 0) - (a.ai_confidence || 0)
  );

  return (
    <section className="mx-auto max-w-6xl space-y-14 px-4 py-10">
      <div>
        <h1 className="font-display text-5xl font-extrabold tracking-tight">
          mod dashboard <span className="inline-block -rotate-12">🛡️</span>
        </h1>
        <p className="mt-2 max-w-2xl text-ink/70">
          the ai only gives an opinion. you make the call. private chats stay private,
          you only see the single message someone reported.
        </p>
      </div>

      <Section title="reports" count={reports.length}>
        {reports.map((report) => (
          <div key={report.id} className="card space-y-3 bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip bg-sky">{report.target_type}</span>
              <span className="chip bg-white">
                {REPORT_REASONS.find((r) => r.value === report.reason)?.label || report.reason}
              </span>
              <span className="ml-auto text-xs text-ink/50">{timeAgo(report.created_at)}</span>
            </div>

            <p className="whitespace-pre-line rounded-xl bg-paper p-3 font-mono text-sm">{report.content_snapshot}</p>
            {report.details && <p className="text-sm"><b>reporter says:</b> {report.details}</p>}
            {report.reported && <p className="text-sm text-ink/60">posted by @{report.reported.username}</p>}

            <AiVerdict verdict={report.ai_verdict} reason={report.ai_reason} confidence={report.ai_confidence} />

            <div className="flex flex-wrap gap-2 pt-1">
              <form action={actionReport.bind(null, report.id)}>
                <button className="btn bg-pink py-2 text-sm">
                  <Trash2 size={16} /> {report.target_type === "listing" ? "remove listing" : "delete message"}
                </button>
              </form>
              <form action={dismissReport.bind(null, report.id)}>
                <button className="btn bg-white py-2 text-sm"><X size={16} /> dismiss</button>
              </form>
              {report.listing_id && (
                <Link href={`/listing/${report.listing_id}`} className="btn bg-white py-2 text-sm">view</Link>
              )}
            </div>
          </div>
        ))}
      </Section>

      <Section title="listings to review" count={listings?.length || 0}>
        {(listings || []).map((listing) => (
          <div key={listing.id} className="card space-y-3 bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`chip ${listing.status === "flagged" ? "bg-pink" : "bg-sun"}`}>{listing.status}</span>
              <span className="chip bg-white">{listing.category}</span>
              <span className="font-mono text-sm font-bold">{formatPrice(listing.price)}</span>
              <span className="ml-auto text-xs text-ink/50">@{listing.seller?.username} · {timeAgo(listing.created_at)}</span>
            </div>
            <Link href={`/listing/${listing.id}`} className="block font-display text-xl font-bold hover:underline">
              {listing.title}
            </Link>
            {listing.description && <p className="line-clamp-3 text-sm text-ink/70">{listing.description}</p>}

            <AiVerdict verdict={listing.ai_verdict} reason={listing.ai_reason} />

            <div className="flex gap-2 pt-1">
              <form action={approveListing.bind(null, listing.id)}>
                <button className="btn bg-lime py-2 text-sm"><Check size={16} /> approve</button>
              </form>
              <form action={removeListing.bind(null, listing.id)}>
                <button className="btn bg-pink py-2 text-sm"><Trash2 size={16} /> remove</button>
              </form>
            </div>
          </div>
        ))}
      </Section>
    </section>
  );
}
