// everything here has to match the check() rules in supabase/schema.sql

export const CATEGORIES = [
  { slug: "notes", name: "notes", color: "bg-sun" },
  { slug: "books", name: "books", color: "bg-sky" },
  { slug: "electronics", name: "electronics", color: "bg-pink" },
  { slug: "hostel", name: "hostel gear", color: "bg-lime" },
  { slug: "help", name: "academic help", color: "bg-grape" },
  { slug: "other", name: "other", color: "bg-tangerine" },
];

export const CONDITIONS = [
  { value: "new", label: "brand new" },
  { value: "like_new", label: "like new" },
  { value: "good", label: "good" },
  { value: "used", label: "well used" },
];

export const REPORT_REASONS = [
  { value: "scam", label: "scam or fake listing" },
  { value: "prohibited", label: "not allowed on campus (drugs, weapons...)" },
  { value: "academic_dishonesty", label: "cheating (selling assignments, leaked papers)" },
  { value: "harassment", label: "harassment or hate" },
  { value: "sexual", label: "sexual content" },
  { value: "spam", label: "spam" },
  { value: "other", label: "something else" },
];

export const MAX_IMAGES = 4;
export const MAX_ACTIVE_LISTINGS = 20;
export const MAX_REPORTS_PER_DAY = 10;

export function getCategory(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || CATEGORIES[CATEGORIES.length - 1];
}

export function conditionLabel(value) {
  return CONDITIONS.find((c) => c.value === value)?.label;
}
