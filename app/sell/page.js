import ListingForm from "@/components/ListingForm";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "sell something | Campus Bazaar" };

export default async function SellPage({ searchParams }) {
  const { userId } = await requireUser("/sell");
  const { category } = await searchParams;

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">
        post a <span className="marker -rotate-2 bg-sun">listing</span>
      </h1>
      <p className="mt-4 text-ink/70">
        takes a minute. our ai gives it a quick check, then it&apos;s live for everyone at nsut.
      </p>

      <div className="card mt-8 bg-white p-6 sm:p-8">
        <ListingForm userId={userId} defaultCategory={category} />
      </div>
    </section>
  );
}
