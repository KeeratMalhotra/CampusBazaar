import Link from "next/link";
import { Plus } from "lucide-react";
import Logo from "./Logo";

const links = [
  { href: "/browse", label: "browse" },
  { href: "/help", label: "help board" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b-[2.5px] border-ink bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />

        <div className="hidden items-center gap-6 font-semibold md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="underline-offset-4 hover:underline hover:decoration-[3px] hover:decoration-pink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/sell" className="btn hidden bg-sun py-2 text-sm sm:inline-flex">
            <Plus size={16} strokeWidth={3} /> sell
          </Link>
          <Link href="/login" className="btn bg-ink py-2 text-sm text-white">
            log in
          </Link>
        </div>
      </nav>
    </header>
  );
}
