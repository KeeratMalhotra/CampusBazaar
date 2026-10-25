import { CATEGORIES, CONDITIONS, MAX_IMAGES } from "./constants";

// checks + cleans the listing form before it touches the database.
// the database has the same rules (check constraints), this just gives nicer error messages.
export function cleanListingInput(body) {
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const price = Math.round(Number(body.price) || 0);
  const category = String(body.category || "");
  const type = body.type === "request" ? "request" : "offer";

  if (title.length < 3 || title.length > 80) return { error: "title should be 3-80 characters" };
  if (description.length > 1000) return { error: "description is too long (max 1000)" };
  if (!CATEGORIES.some((c) => c.slug === category)) return { error: "pick a category" };
  if (price < 0 || price > 100000) return { error: "price should be between ₹0 and ₹1,00,000" };

  const images = Array.isArray(body.images) ? body.images.filter((u) => typeof u === "string") : [];
  if (images.length > MAX_IMAGES) return { error: `max ${MAX_IMAGES} photos` };

  // condition only makes sense for physical stuff
  const condition =
    category !== "help" && CONDITIONS.some((c) => c.value === body.condition) ? body.condition : null;
  const notes_format =
    category === "notes" && ["hardcopy", "softcopy"].includes(body.notes_format) ? body.notes_format : null;

  return {
    data: {
      title,
      description,
      price,
      category,
      type,
      negotiable: Boolean(body.negotiable) && price > 0,
      condition,
      notes_format,
      images,
    },
  };
}

// what gets sent to gemini. no usernames, no ids, just what the student wrote.
export function listingText(listing) {
  return [
    `type: ${listing.type === "request" ? "looking for" : "selling / giving away"}`,
    `category: ${listing.category}`,
    `title: ${listing.title}`,
    `price: ${listing.price === 0 ? "free" : "Rs " + listing.price}`,
    `description: ${listing.description || "(none)"}`,
  ].join("\n");
}

// turn the ai answer into a listing status
export function statusFromVerdict(result) {
  if (result.verdict === "safe" && result.confidence >= 0.6) return "active";
  if (result.verdict === "violates") return "flagged";
  return "pending"; // unsure -> a human mod decides
}
