// What this file does: shows a YouTube video as a "click to load" button.
// No iframe (and no request to YouTube) exists until the reader clicks.
// It uses the privacy-friendly youtube-nocookie.com domain, and the credit
// line under the video is always visible.
"use client";

import React, { useState } from "react";
import type { PinDetail } from "@/lib/api-schemas";

type Video = PinDetail["videos"][number];

export function VideoEmbed({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);

  // Build the embed URL only when needed: autoplay after the click, optional start time.
  const params = new URLSearchParams({ autoplay: "1", rel: "0" });
  if (video.startSeconds) params.set("start", String(video.startSeconds));
  const src = `https://www.youtube-nocookie.com/embed/${video.youtubeId}?${params.toString()}`;

  return (
    <figure className="mt-3">
      <div className="aspect-video overflow-hidden rounded-lg bg-neutral-900">
        {playing ? (
          <iframe
            src={src}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${video.title}`}
            className="flex h-full w-full flex-col items-center justify-center gap-1 p-4 text-center text-white hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
          >
            <span aria-hidden="true" className="text-3xl">▶</span>
            <span className="text-sm font-medium">Play video</span>
            <span className="text-xs text-neutral-300">{video.title}</span>
          </button>
        )}
      </div>
      <figcaption className="mt-1 text-xs text-neutral-600">
        {video.creditLine}
        {video.note ? ` ${video.note}` : ""}
      </figcaption>
    </figure>
  );
}
