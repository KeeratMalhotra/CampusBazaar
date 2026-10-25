import { BadgeCheck, NotebookPen, Guitar, GraduationCap } from "lucide-react";

// the floating "fake listings" on the right side of the home page hero.
// purely decorative, real listings come from the database later.

function MiniListing({ icon: Icon, color, category, title, price, seller, extra, className }) {
  return (
    <div className={`card w-60 p-3 ${className}`}>
      <div className={`grid h-24 place-items-center rounded-xl border-2 border-ink ${color}`}>
        <Icon size={40} strokeWidth={2} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="chip bg-white">{category}</span>
        <span className="font-mono text-sm font-bold">{price}</span>
      </div>
      <p className="mt-2 font-display text-lg font-bold leading-tight">{title}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-ink/60">
        <span>@{seller}</span>
        {extra && <span className="font-semibold text-ink">{extra}</span>}
      </div>
    </div>
  );
}

// spinning round "NSUT ONLY" sticker
function SpinSticker() {
  return (
    <div className="relative grid h-28 w-28 place-items-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 animate-spin-slow">
        <defs>
          <path id="circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <circle cx="50" cy="50" r="48" fill="var(--color-grape)" stroke="var(--color-ink)" strokeWidth="2.5" />
        <text fontSize="11.5" fontWeight="700" fontFamily="var(--font-space-mono)" letterSpacing="1.5">
          <textPath href="#circle">NSUT ONLY ✦ NSUT ONLY ✦ NSUT ONLY ✦</textPath>
        </text>
      </svg>
      <BadgeCheck size={34} strokeWidth={2.5} className="relative" />
    </div>
  );
}

export default function HeroCollage() {
  return (
    // fixed size so the stickers never collide, then shrunk on small phones
    <div className="relative mx-auto h-[540px] w-[448px] origin-top select-none max-sm:left-1/2 max-sm:-mb-28 max-sm:-translate-x-1/2 max-sm:scale-[0.78]">
      <MiniListing
        icon={NotebookPen}
        color="bg-sun"
        category="notes"
        title="DSA handwritten notes, sem 3"
        price="₹150"
        seller="CaffeinatedCompiler_417"
        extra="like new"
        className="absolute left-0 top-4 -rotate-6 animate-floaty"
      />

      <MiniListing
        icon={Guitar}
        color="bg-pink"
        category="other"
        title="yamaha F310 guitar 🎸"
        price="₹4,500"
        seller="SleepyPanda_88"
        extra="negotiable"
        className="absolute right-0 top-[190px] rotate-[5deg] animate-floaty [animation-delay:-2s]"
      />

      {/* chat bubbles */}
      <div className="absolute bottom-6 left-2 w-52 -rotate-2 space-y-2">
        <div className="card w-fit rounded-bl-sm bg-white px-3 py-2 text-sm font-medium">
          is this still available??
        </div>
        <div className="card ml-auto w-fit rounded-br-sm bg-lime px-3 py-2 text-sm font-medium">
          yesss, meet at the canteen at 4?
        </div>
        <div className="card flex w-fit gap-1 rounded-bl-sm bg-white px-3 py-3">
          <span className="h-2 w-2 animate-blink rounded-full bg-ink" />
          <span className="h-2 w-2 animate-blink rounded-full bg-ink [animation-delay:0.2s]" />
          <span className="h-2 w-2 animate-blink rounded-full bg-ink [animation-delay:0.4s]" />
        </div>
      </div>

      {/* help board card */}
      <div className="card absolute -bottom-2 right-2 w-48 rotate-3 bg-sky p-3">
        <span className="chip bg-white">
          <GraduationCap size={12} strokeWidth={3} /> help
        </span>
        <p className="mt-2 font-display font-bold leading-tight">
          need someone to explain signals before the quiz 😭
        </p>
      </div>

      <div className="absolute right-4 top-6">
        <SpinSticker />
      </div>
    </div>
  );
}
