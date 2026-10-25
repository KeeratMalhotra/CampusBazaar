import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="marker rotate-3 bg-pink font-display text-7xl font-extrabold">404</p>
      <h1 className="mt-8 font-display text-4xl font-extrabold">this page dipped 🫠</h1>
      <p className="mt-3 text-ink/70">either it never existed or someone already bought it.</p>
      <Link href="/" className="btn mt-8 bg-lime">
        take me home
      </Link>
    </section>
  );
}
