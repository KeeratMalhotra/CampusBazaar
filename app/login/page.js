import { redirect } from "next/navigation";
import { Lock, Ghost, ShieldCheck } from "lucide-react";
import GoogleButton from "./GoogleButton";
import { getUser } from "@/lib/auth";
import { safeNext } from "@/lib/format";

export const metadata = { title: "log in | Campus Bazaar" };

const ERRORS = {
  nsut: "only @nsut.ac.in accounts can join. try again with your college email.",
  failed: "login didn't go through. give it another shot.",
};

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const next = safeNext(params.next);

  // already logged in? skip this page
  const { userId } = await getUser();
  if (userId) redirect(next);

  const error = ERRORS[params.error];

  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="card relative bg-white p-8">
        <span className="absolute -top-4 right-6 rotate-6 chip bg-pink">nsut only</span>

        <h1 className="font-display text-4xl font-extrabold leading-tight">
          hey you 👋 <br /> welcome in
        </h1>
        <p className="mt-3 text-ink/70">log in with your college google account to buy, sell and chat.</p>

        {error && (
          <p className="mt-6 rounded-xl border-2 border-ink bg-pink/40 px-4 py-3 text-sm font-semibold">
            {error}
          </p>
        )}

        <div className="mt-8">
          <GoogleButton next={next} />
        </div>

        <ul className="mt-8 space-y-3 text-sm font-medium text-ink/75">
          <li className="flex gap-2"><Lock size={18} className="shrink-0" /> only @nsut.ac.in emails can sign up</li>
          <li className="flex gap-2"><Ghost size={18} className="shrink-0" /> you get a random username. your name and email stay hidden</li>
          <li className="flex gap-2"><ShieldCheck size={18} className="shrink-0" /> we never see your google password</li>
        </ul>
      </div>
    </section>
  );
}
