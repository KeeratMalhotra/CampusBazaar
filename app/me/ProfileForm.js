"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Shuffle } from "lucide-react";
import Avatar from "@/components/Avatar";
import { createClient } from "@/lib/supabase/client";
import { uploadImage, storagePathFromUrl } from "@/lib/images";

const ADJECTIVES = ["Sleepy", "Caffeinated", "Chaotic", "Lowkey", "Spicy", "Midnight", "Cosmic", "Feral", "Turbo", "Sneaky"];
const NOUNS = ["Panda", "Compiler", "Mango", "Pigeon", "Samosa", "Byte", "Otter", "Kernel", "Noodle", "Chai"];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

export default function ProfileForm({ profile }) {
  const router = useRouter();
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  async function changePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy("photo");
    setMessage({ type: "", text: "" });
    try {
      const supabase = createClient();
      const url = await uploadImage(supabase, "avatars", profile.id, file);
      const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", profile.id);
      if (error) throw error;
      // remove the old photo so storage doesn't fill up
      const oldPath = avatarUrl && storagePathFromUrl(avatarUrl, "avatars");
      if (oldPath) await supabase.storage.from("avatars").remove([oldPath]);
      setAvatarUrl(url);
      router.refresh();
    } catch {
      setMessage({ type: "error", text: "couldn't upload that photo" });
    }
    setBusy("");
  }

  async function save(event) {
    event.preventDefault();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
      return setMessage({ type: "error", text: "username: 3-20 letters, numbers or _" });
    }
    setBusy("save");
    const supabase = createClient();
    // row level security only lets you update your own row,
    // and column permissions stop you from touching "role"
    const { error } = await supabase.from("profiles").update({ username, bio: bio.trim() }).eq("id", profile.id);
    setBusy("");

    if (error) {
      const taken = error.code === "23505";
      return setMessage({ type: "error", text: taken ? "that username is taken 😬" : "that username isn't allowed" });
    }
    setMessage({ type: "ok", text: "saved ✨" });
    router.refresh();
  }

  return (
    <form onSubmit={save} className="card space-y-6 bg-white p-6">
      <div className="flex items-center gap-5">
        <label className="group relative cursor-pointer">
          <Avatar profile={{ ...profile, username, avatar_url: avatarUrl }} size={96} />
          <span className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border-[2.5px] border-ink bg-sun transition-transform group-hover:scale-110">
            {busy === "photo" ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          </span>
          <input type="file" accept="image/*" onChange={changePhoto} className="hidden" />
        </label>
        <div className="text-sm text-ink/60">
          <p className="font-semibold text-ink">your profile pic</p>
          <p>tip: don&apos;t use a selfie if you want to stay anonymous 👀</p>
        </div>
      </div>

      <label className="block">
        <span className="mb-2 block font-display text-lg font-bold">username</span>
        <div className="flex gap-2">
          <div className="card flex flex-1 items-center px-4 py-3">
            <span className="text-ink/40">@</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
              maxLength={20}
              className="w-full bg-transparent font-semibold outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setUsername(`${pick(ADJECTIVES)}${pick(NOUNS)}_${10 + Math.floor(Math.random() * 990)}`)}
            title="random username"
            className="btn bg-grape px-4"
          >
            <Shuffle size={18} />
          </button>
        </div>
      </label>

      <label className="block">
        <span className="mb-2 block font-display text-lg font-bold">bio</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={160}
          rows={2}
          placeholder="2nd year IT · will trade notes for chai"
          className="card w-full resize-none px-4 py-3 outline-none"
        />
        <span className="mt-1 block text-right text-xs text-ink/50">{bio.length}/160</span>
      </label>

      <div className="flex items-center gap-4">
        <button disabled={busy === "save"} className="btn bg-lime disabled:opacity-60">
          {busy === "save" ? <Loader2 size={18} className="animate-spin" /> : null} save profile
        </button>
        {message.text && (
          <span className={`font-semibold ${message.type === "error" ? "text-red-600" : ""}`}>{message.text}</span>
        )}
      </div>
    </form>
  );
}
