import { notFound } from "next/navigation";
import ListingForm from "@/components/ListingForm";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "edit listing | Campus Bazaar" };

export default async function EditListingPage({ params }) {
  const { id } = await params;
  const { supabase, userId } = await requireUser(`/listing/${id}/edit`);

  const { data: listing } = await supabase.from("listings").select("*").eq("id", id).single();
  if (!listing || listing.seller_id !== userId || listing.status === "removed") notFound();

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">edit listing ✏️</h1>
      <p className="mt-4 text-ink/70">changes get a quick ai check again before they show up.</p>
      <div className="card mt-8 bg-white p-6 sm:p-8">
        <ListingForm userId={userId} listing={listing} />
      </div>
    </section>
  );
}
