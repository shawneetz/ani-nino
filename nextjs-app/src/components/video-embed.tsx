// What this file does: defers YouTube loading until the reader asks for it.
"use client";
import React, { useState } from "react";
export function VideoEmbed({ youtubeId, title, channel, video }: { youtubeId?: string; title?: string; channel?: string; video?: { youtubeId: string; title: string; channel: string } }) {
  const [playing, setPlaying] = useState(false);
  const current = video ?? { youtubeId: youtubeId ?? "", title: title ?? "", channel: channel ?? "" };
  return <figure className="space-y-2"><div className="aspect-video overflow-hidden rounded-lg bg-stone-900">{playing ? <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${current.youtubeId}?autoplay=1`} title={current.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <button type="button" onClick={() => setPlaying(true)} className="h-full w-full text-white">{`Play video: ${current.title}`}</button>}</div><figcaption className="text-sm text-stone-600"><span>{`Video: ${current.title}. `}</span><span>{`Credit: ${current.channel}`}</span><span>.</span></figcaption></figure>;
}
