"use client";

import React from "react";

interface EmojiAvatarProps {
  emoji: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_PX = { sm: 48, md: 56, lg: 64 };
const DEFAULT_EMOJI = "🌿";

function emojiToCodepoint(emoji: string): string {
  return Array.from(emoji)
    .map((c) => c.codePointAt(0))
    .filter((cp): cp is number => cp !== undefined && cp !== 0xfe0f)
    .map((cp) => cp.toString(16).toLowerCase())
    .join("-");
}

export default function EmojiAvatar({
  emoji,
  size = "md",
  className = "",
}: EmojiAvatarProps) {
  const px = SIZE_PX[size];
  const safeEmoji = emoji || DEFAULT_EMOJI;
  const codepoint = emojiToCodepoint(safeEmoji);
  // Imagens do Google Noto Emoji servidas pelo emoji-picker-react (bundled, sem CDN externo)
  const src = `https://cdn.jsdelivr.net/npm/emoji-datasource-google@15.1.2/img/google/64/${codepoint}.png`;

  return (
    <div
      className={`rounded-full bg-amber-400 flex items-center justify-center shrink-0 overflow-hidden ${className}`}
      style={{ width: px, height: px }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={codepoint}
        src={src}
        alt={safeEmoji}
        width={Math.round(px * 0.65)}
        height={Math.round(px * 0.65)}
        style={{ display: "block", objectFit: "contain" }}
        draggable={false}
      />
    </div>
  );
}
