// round profile picture. no photo? show the first letter on a color
// that's always the same for the same username.
const COLORS = ["bg-lime", "bg-pink", "bg-sun", "bg-sky", "bg-grape", "bg-tangerine"];

function colorFor(name = "") {
  let sum = 0;
  for (const char of name) sum += char.charCodeAt(0);
  return COLORS[sum % COLORS.length];
}

export default function Avatar({ profile, size = 40 }) {
  const name = profile?.username || "?";

  if (profile?.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar_url}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full border-[2.5px] border-ink object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full border-[2.5px] border-ink font-display font-extrabold ${colorFor(name)}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name[0].toUpperCase()}
    </span>
  );
}
