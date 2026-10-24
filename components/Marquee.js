// the scrolling black strip on the home page.
// the list is repeated twice so the loop looks seamless.
const items = [
  "handwritten notes",
  "pyqs",
  "books",
  "headphones",
  "cycles",
  "calculators",
  "hostel gear",
  "guitars",
  "chargers",
  "doubt sessions",
];

export default function Marquee() {
  const all = [...items, ...items];

  return (
    <div className="overflow-hidden border-y-[2.5px] border-ink bg-ink py-3 text-lime">
      <div className="flex w-max animate-marquee gap-8 font-display text-2xl font-extrabold uppercase">
        {all.map((item, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            {item} <span className="text-pink">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
