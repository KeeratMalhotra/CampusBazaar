"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, MessageCircle, GraduationCap } from "lucide-react";

// app-style tab bar at the bottom, only on phones
const tabs = [
  { href: "/", label: "home", icon: Home },
  { href: "/browse", label: "browse", icon: Search },
  { href: "/sell", label: "sell", icon: Plus, big: true },
  { href: "/help", label: "help", icon: GraduationCap },
  { href: "/chats", label: "chats", icon: MessageCircle },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-full border-[2.5px] border-ink bg-white px-2 py-1.5 shadow-brutal sm:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

        if (tab.big) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              className="-mt-6 grid h-14 w-14 place-items-center rounded-full border-[2.5px] border-ink bg-sun shadow-brutal-sm active:translate-y-0.5"
            >
              <Icon size={26} strokeWidth={3} />
            </Link>
          );
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center rounded-full px-3 py-1 text-[10px] font-bold ${active ? "bg-lime" : ""}`}
          >
            <Icon size={20} strokeWidth={active ? 2.75 : 2} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
