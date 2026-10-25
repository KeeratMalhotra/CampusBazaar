import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t-[2.5px] border-ink bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-xs text-sm text-ink/70">
            made by an nsut student who was tired of 47 whatsapp groups. not affiliated with NSUT.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
          <Link href="/browse" className="hover:underline">browse</Link>
          <Link href="/help" className="hover:underline">help board</Link>
          <Link href="/sell" className="hover:underline">sell something</Link>
          <a
            href="https://github.com/KeeratMalhotra/CampusBazaar"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            github
          </a>
        </div>
      </div>
    </footer>
  );
}
