"use client";

import { useState } from "react";
import Image from "next/image";
import CategoryIcon from "./CategoryIcon";

export default function Gallery({ images, title, category, color }) {
  const [current, setCurrent] = useState(0);

  if (!images?.length) {
    return (
      <div className={`card grid aspect-square place-items-center ${color}`}>
        <CategoryIcon slug={category} size={96} strokeWidth={1.75} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="card relative aspect-square overflow-hidden bg-white">
        <Image src={images[current]} alt={title} fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" priority />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setCurrent(i)}
              className={`relative h-20 w-20 overflow-hidden rounded-xl border-[2.5px] border-ink transition-all ${
                i === current ? "-translate-y-1 shadow-brutal" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
