import Link from "next/link";

export default function EmptyState({ emoji = "🫥", title, text, actionHref, actionLabel }) {
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center gap-3 bg-white px-6 py-12 text-center">
      <span className="text-5xl">{emoji}</span>
      <h3 className="font-display text-2xl font-extrabold">{title}</h3>
      {text && <p className="text-ink/70">{text}</p>}
      {actionHref && (
        <Link href={actionHref} className="btn mt-2 bg-lime">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
