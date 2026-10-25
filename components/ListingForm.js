"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X, Loader2, Sparkles } from "lucide-react";
import CategoryIcon from "./CategoryIcon";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/images";
import { CATEGORIES, CONDITIONS, MAX_IMAGES } from "@/lib/constants";

// the form for posting AND editing a listing.
// `listing` is only passed in when editing.
export default function ListingForm({ userId, listing, defaultCategory }) {
  const router = useRouter();
  const editing = Boolean(listing);

  const [type, setType] = useState(listing?.type || "offer");
  const [category, setCategory] = useState(listing?.category || defaultCategory || "notes");
  const [title, setTitle] = useState(listing?.title || "");
  const [description, setDescription] = useState(listing?.description || "");
  const [price, setPrice] = useState(listing?.price ?? "");
  const [negotiable, setNegotiable] = useState(listing?.negotiable || false);
  const [condition, setCondition] = useState(listing?.condition || "good");
  const [notesFormat, setNotesFormat] = useState(listing?.notes_format || "hardcopy");

  // photos: either already uploaded (url) or new from this device (file + preview)
  const [photos, setPhotos] = useState((listing?.images || []).map((url) => ({ url, preview: url })));
  const [step, setStep] = useState(""); // "", "uploading", "checking"
  const [error, setError] = useState("");

  function addPhotos(event) {
    const files = Array.from(event.target.files || []);
    const room = MAX_IMAGES - photos.length;
    const newOnes = files.slice(0, room).map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPhotos([...photos, ...newOnes]);
    event.target.value = "";
  }

  function removePhoto(index) {
    setPhotos(photos.filter((_, i) => i !== index));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      // 1. upload any new photos straight from the browser to supabase storage
      setStep("uploading");
      const supabase = createClient();
      const imageUrls = [];
      for (const photo of photos) {
        imageUrls.push(photo.url || (await uploadImage(supabase, "listing-images", userId, photo.file)));
      }

      // 2. send everything to our api, which saves it and runs the ai check
      setStep("checking");
      const res = await fetch(editing ? `/api/listings/${listing.id}` : "/api/listings", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          category,
          title,
          description,
          price: Number(price) || 0,
          negotiable,
          condition,
          notes_format: notesFormat,
          images: imageUrls,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "something went wrong");

      router.push(`/listing/${data.id}?posted=${data.status}`);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setStep("");
    }
  }

  const busy = step !== "";
  const isHelp = category === "help";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* offer or request */}
      <div className="flex flex-wrap gap-3">
        {[
          { value: "offer", label: isHelp ? "🧠 i can help" : "💸 selling / giving away" },
          { value: "request", label: isHelp ? "🙋 i need help" : "🔎 looking for something" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setType(option.value)}
            className={`btn ${type === option.value ? "bg-ink text-white" : "bg-white"}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* category */}
      <fieldset>
        <legend className="mb-3 font-display text-xl font-bold">category</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategory(c.slug)}
              className={`flex items-center gap-2 rounded-2xl border-[2.5px] border-ink px-3 py-3 text-left font-bold transition-all ${
                category === c.slug ? `${c.color} -translate-y-0.5 shadow-brutal` : "bg-white hover:bg-paper"
              }`}
            >
              <CategoryIcon slug={c.slug} size={20} /> {c.name}
            </button>
          ))}
        </div>
      </fieldset>

      {/* title + description */}
      <label className="block">
        <span className="mb-2 block font-display text-xl font-bold">title</span>
        <input
          required
          minLength={3}
          maxLength={80}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={isHelp ? "need help with signals & systems before the quiz" : "DSA handwritten notes, sem 3"}
          className="card w-full px-4 py-3 font-semibold outline-none focus:shadow-brutal-lg"
        />
      </label>

      <label className="block">
        <span className="mb-2 block font-display text-xl font-bold">
          description <span className="text-sm font-normal text-ink/50">(optional)</span>
        </span>
        <textarea
          rows={4}
          maxLength={1000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="condition, what's included, where to meet on campus..."
          className="card w-full resize-y px-4 py-3 outline-none focus:shadow-brutal-lg"
        />
        <span className="mt-1 block text-right text-xs text-ink/50">{description.length}/1000</span>
      </label>

      {/* price */}
      <div className="flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="mb-2 block font-display text-xl font-bold">price (₹)</span>
          <input
            type="number"
            min="0"
            max="100000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0 = free"
            className="card w-40 px-4 py-3 font-mono font-bold outline-none focus:shadow-brutal-lg"
          />
        </label>
        <label className="card flex items-center gap-2 px-4 py-3 font-semibold">
          <input
            type="checkbox"
            checked={negotiable}
            onChange={(e) => setNegotiable(e.target.checked)}
            className="h-4 w-4 accent-ink"
          />
          negotiable
        </label>
      </div>

      {/* condition / notes format */}
      {!isHelp && (
        <fieldset>
          <legend className="mb-3 font-display text-xl font-bold">condition</legend>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCondition(c.value)}
                className={`chip px-4 py-2 text-xs ${condition === c.value ? "bg-lime shadow-brutal-sm" : "bg-white"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {category === "notes" && (
        <fieldset>
          <legend className="mb-3 font-display text-xl font-bold">notes type</legend>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "hardcopy", label: "📄 hard copy" },
              { value: "softcopy", label: "💾 soft copy (pdf)" },
            ].map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setNotesFormat(f.value)}
                className={`chip px-4 py-2 text-xs ${notesFormat === f.value ? "bg-sun shadow-brutal-sm" : "bg-white"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {notesFormat === "softcopy" && (
            <p className="mt-2 text-sm text-ink/60">share the pdf in chat once you&apos;ve agreed. only your own notes, no pirated books.</p>
          )}
        </fieldset>
      )}

      {/* photos */}
      <div>
        <span className="mb-3 block font-display text-xl font-bold">
          photos <span className="text-sm font-normal text-ink/50">(up to {MAX_IMAGES})</span>
        </span>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((photo, i) => (
            <div key={photo.preview} className="card relative aspect-square overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.preview} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label="remove photo"
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full border-2 border-ink bg-white"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          ))}

          {photos.length < MAX_IMAGES && (
            <label className="grid aspect-square cursor-pointer place-items-center rounded-[18px] border-[2.5px] border-dashed border-ink bg-white text-center transition-colors hover:bg-lime/40">
              <span className="flex flex-col items-center gap-1 text-sm font-bold">
                <ImagePlus size={28} />
                add photo
              </span>
              <input type="file" accept="image/*" multiple onChange={addPhotos} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-xl border-2 border-ink bg-pink/40 px-4 py-3 font-semibold">{error}</p>
      )}

      <button disabled={busy} className="btn w-full bg-lime text-lg disabled:opacity-70 sm:w-auto">
        {busy ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            {step === "uploading" ? "uploading photos..." : "ai is checking your listing..."}
          </>
        ) : (
          <>
            <Sparkles size={20} /> {editing ? "save changes" : "post it"}
          </>
        )}
      </button>
    </form>
  );
}
