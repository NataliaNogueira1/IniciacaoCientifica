"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Categories, EmojiStyle } from "emoji-picker-react";
import type { EmojiClickData, CategoryConfig } from "emoji-picker-react";
import EmojiAvatar from "@/app/components/EmojiAvatar";

// Dynamic import para evitar SSR (emoji-picker-react é client-only)
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const CATEGORIES: CategoryConfig[] = [
  { category: Categories.ANIMALS_NATURE, name: "Animais e Natureza" },
  { category: Categories.SMILEYS_PEOPLE, name: "Sorrisos e Pessoas" },
  { category: Categories.SYMBOLS,        name: "Símbolos" },
  { category: Categories.TRAVEL_PLACES,  name: "Viagens e Lugares" },
  { category: Categories.ACTIVITIES,     name: "Atividades" },
  { category: Categories.OBJECTS,        name: "Objetos" },
];

interface EmojiPickerFieldProps {
  value: string;
  onChange: (emoji: string) => void;
}

export default function EmojiPickerField({ value, onChange }: EmojiPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleSelect(emojiData: EmojiClickData) {
    onChange(emojiData.emoji);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-1 items-center" ref={containerRef}>
      <span className="text-sm font-semibold text-yellow-950">
        Ícone do perfil
      </span>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 rounded-full"
          aria-label="Escolher emoji do perfil"
          aria-expanded={open}
        >
          <EmojiAvatar emoji={value} size="lg" />
        </button>
        <span className="absolute -bottom-1 -right-1 text-xs bg-white border border-gray-200 rounded-full px-1 shadow select-none pointer-events-none">
          ✏️
        </span>

        {open && (
          <div className="absolute left-0 top-20 z-50">
            <EmojiPicker
              onEmojiClick={handleSelect}
              emojiStyle={EmojiStyle.GOOGLE}
              categories={CATEGORIES}
              searchPlaceHolder="Procurar emoji…"
              previewConfig={{ showPreview: false }}
              skinTonesDisabled
              height={380}
              width={320}
            />
          </div>
        )}
      </div>
    </div>
  );
}
