import Link from "next/link";
import { Tag } from "lucide-react";

export default function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl border-[2.5px] border-ink bg-lime shadow-brutal-sm transition-transform group-hover:-rotate-12">
        <Tag size={18} strokeWidth={2.5} />
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight">
        campus<span className="text-pink [-webkit-text-stroke:1px_var(--color-ink)]">bazaar</span>
      </span>
    </Link>
  );
}
