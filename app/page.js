import Link from "next/link";
import {
  ArrowRight,
  Plus,
  Lock,
  Ghost,
  Bot,
  NotebookPen,
  BookOpen,
  Headphones,
  BedDouble,
  GraduationCap,
  Shapes,
  EyeOff,
  ShieldCheck,
  Flag,
  MessageCircle,
} from "lucide-react";
import HeroCollage from "@/components/HeroCollage";
import Marquee from "@/components/Marquee";

const categories = [
  { slug: "notes", name: "notes", line: "handwritten > printed. no debate.", icon: NotebookPen, color: "bg-sun" },
  { slug: "books", name: "books", line: "last sem's books at this sem's budget", icon: BookOpen, color: "bg-sky" },
  { slug: "electronics", name: "electronics", line: "chargers, earphones, calculators", icon: Headphones, color: "bg-pink" },
  { slug: "hostel", name: "hostel gear", line: "kettles, mattresses, extension boards", icon: BedDouble, color: "bg-lime" },
  { slug: "help", name: "academic help", line: "doubt sessions, study buddies, assignments", icon: GraduationCap, color: "bg-grape" },
  { slug: "other", name: "other", line: "skateboards, guitars, random stuff", icon: Shapes, color: "bg-tangerine" },
];

const steps = [
  {
    title: "log in with your nsut id",
    text: "only @nsut.ac.in emails get in. no randoms, no outsiders.",
    color: "bg-lime",
  },
  {
    title: "get a secret identity",
    text: "you show up as something like @SleepyPanda_88. your real name stays hidden.",
    color: "bg-pink",
  },
  {
    title: "post, chat, meet up",
    text: "list stuff in a minute, chat live with buyers, swap it on campus.",
    color: "bg-sky",
  },
];

const safety = [
  { icon: EyeOff, title: "your email stays hidden", text: "other students only ever see your username." },
  { icon: Bot, title: "ai checks every listing", text: "scams and sketchy stuff get flagged before anyone sees them." },
  { icon: ShieldCheck, title: "humans make the call", text: "the ai only flags. real moderators decide what gets removed." },
  { icon: Flag, title: "report in one tap", text: "something feels off? report it and it goes straight to the mods." },
];

export default function Home() {
  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
        <div>
          <span className="chip bg-white">
            <Lock size={12} strokeWidth={3} /> only for nsut students
          </span>

          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="marker -rotate-2 bg-lime">buy.</span>{" "}
            <span className="marker rotate-1 bg-pink">sell.</span>{" "}
            <span className="marker -rotate-1 bg-sun">swap.</span>
            <br />
            <span className="mt-3 inline-block">all inside campus.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-ink/75">
            your senior&apos;s notes, your batchmate&apos;s guitar, that charger you forgot at home.
            post it in a minute, chat anonymously, meet on campus.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/browse" className="btn bg-ink text-white">
              start browsing <ArrowRight size={18} strokeWidth={3} />
            </Link>
            <Link href="/sell" className="btn bg-white">
              <Plus size={18} strokeWidth={3} /> sell something
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-ink/70">
            <span className="flex items-center gap-1.5"><Lock size={15} /> nsut emails only</span>
            <span className="flex items-center gap-1.5"><Ghost size={15} /> anonymous usernames</span>
            <span className="flex items-center gap-1.5"><MessageCircle size={15} /> live chat</span>
          </div>
        </div>

        <div className="min-w-0 overflow-x-clip">
          <HeroCollage />
        </div>
      </section>

      <Marquee />

      {/* ---------- categories ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          what&apos;s on the shelf <span className="inline-block rotate-12">👀</span>
        </h2>
        <p className="mt-3 text-ink/70">pick a lane, or just scroll everything.</p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={cat.slug === "help" ? "/help" : `/browse?category=${cat.slug}`}
                className={`card group flex items-start gap-4 p-5 transition-all hover:-translate-y-1 hover:-rotate-1 hover:shadow-brutal-lg ${cat.color}`}
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-[2.5px] border-ink bg-white transition-transform group-hover:rotate-12">
                  <Icon size={26} strokeWidth={2.25} />
                </span>
                <span>
                  <span className="block font-display text-2xl font-extrabold">{cat.name}</span>
                  <span className="mt-1 block text-sm font-medium text-ink/75">{cat.line}</span>
                </span>
                <ArrowRight
                  size={20}
                  strokeWidth={3}
                  className="ml-auto mt-1 shrink-0 transition-transform group-hover:translate-x-1"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          how it works
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="card relative p-6 pt-10">
              <span
                className={`absolute -top-6 left-5 grid h-12 w-12 place-items-center rounded-full border-[2.5px] border-ink font-display text-2xl font-extrabold shadow-brutal-sm ${step.color}`}
              >
                {i + 1}
              </span>
              <h3 className="font-display text-2xl font-extrabold leading-tight">{step.title}</h3>
              <p className="mt-2 text-ink/70">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- safety ---------- */}
      <section className="border-y-[2.5px] border-ink bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <span className="chip border-lime bg-lime text-ink">safety first</span>
          <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            no creeps. no scams. <span className="text-lime">no cap.</span>
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {safety.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border-[2.5px] border-white/80 p-5">
                  <Icon size={28} className="text-lime" />
                  <h3 className="mt-4 font-display text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- final cta ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="card flex flex-col items-start gap-6 bg-lime p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              got stuff lying around?
            </h2>
            <p className="mt-2 text-lg font-medium text-ink/75">
              someone on campus probably needs it. turn it into chai money ☕
            </p>
          </div>
          <Link href="/sell" className="btn shrink-0 bg-white text-lg">
            post a listing <ArrowRight size={20} strokeWidth={3} />
          </Link>
        </div>
      </section>
    </>
  );
}
