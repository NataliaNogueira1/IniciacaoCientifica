"use client";

import React, { useState } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Pencil } from "lucide-react";

export const DEFAULT_ICON = "Leaf";

// Cada avatar tem um ícone e uma cor de fundo — estilo Netflix
const AVATARS: { icon: string; bg: string; fg: string }[] = [
  // Natureza / abelha-temático
  { icon: "Leaf",           bg: "#4ade80", fg: "#14532d" },
  { icon: "Sprout",         bg: "#86efac", fg: "#166534" },
  { icon: "Flower",         bg: "#f9a8d4", fg: "#831843" },
  { icon: "Flower2",        bg: "#fda4af", fg: "#881337" },
  { icon: "TreePine",       bg: "#6ee7b7", fg: "#065f46" },
  { icon: "TreeDeciduous",  bg: "#a7f3d0", fg: "#064e3b" },
  { icon: "Bug",            bg: "#fde68a", fg: "#78350f" }, // mais próximo de abelha
  { icon: "Bird",           bg: "#93c5fd", fg: "#1e3a8a" },
  { icon: "Rabbit",         bg: "#e9d5ff", fg: "#4c1d95" },
  { icon: "PawPrint",       bg: "#fdba74", fg: "#7c2d12" },
  { icon: "Turtle",         bg: "#bbf7d0", fg: "#14532d" },
  { icon: "Fish",           bg: "#7dd3fc", fg: "#0c4a6e" },
  { icon: "Cat",            bg: "#fcd34d", fg: "#78350f" },
  { icon: "Dog",            bg: "#d4a373", fg: "#451a03" },
  { icon: "Snail",          bg: "#c4b5fd", fg: "#3b0764" },
  { icon: "Worm",           bg: "#fb923c", fg: "#431407" },
  // Perfil / pessoas
  { icon: "UserRound",      bg: "#60a5fa", fg: "#1e3a8a" },
  { icon: "Crown",          bg: "#fbbf24", fg: "#78350f" },
  { icon: "Star",           bg: "#fde047", fg: "#713f12" },
  { icon: "Smile",          bg: "#34d399", fg: "#064e3b" },
  { icon: "GraduationCap",  bg: "#818cf8", fg: "#1e1b4b" },
  { icon: "Glasses",        bg: "#a78bfa", fg: "#2e1065" },
  { icon: "HardHat",        bg: "#fb923c", fg: "#431407" },
  { icon: "Baby",           bg: "#fbcfe8", fg: "#831843" },
  // Natureza/símbolos extras
  { icon: "Sun",            bg: "#fef08a", fg: "#713f12" },
  { icon: "Moon",           bg: "#1e293b", fg: "#e2e8f0" },
  { icon: "Flame",          bg: "#f97316", fg: "#431407" },
  { icon: "Snowflake",      bg: "#bae6fd", fg: "#0c4a6e" },
  { icon: "Waves",          bg: "#38bdf8", fg: "#0c4a6e" },
  { icon: "Mountain",       bg: "#94a3b8", fg: "#0f172a" },
];

interface IconPickerFieldProps {
  value: string;
  onChange: (iconName: string) => void;
}

function IconComponent({ name, size = 24, color }: { name: string; size?: number; color?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  if (!Icon) return null;
  return <Icon size={size} strokeWidth={1.5} color={color} />;
}

export default function IconPickerField({ value, onChange }: IconPickerFieldProps) {
  const [open, setOpen] = useState(false);

  const safeValue = value || DEFAULT_ICON;
  const current = AVATARS.find((a) => a.icon === safeValue) ?? AVATARS[0];

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-semibold text-yellow-950">Ícone do perfil</span>

      <div className="relative">
        {/* Botão avatar atual */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-20 h-20 rounded-full flex items-center justify-center shadow-md ring-2 ring-yellow-800 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
          style={{ backgroundColor: current.bg }}
          aria-label="Escolher ícone do perfil"
          aria-expanded={open}
        >
          <IconComponent name={safeValue} size={38} color={current.fg} />
        </button>
        <span className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center shadow pointer-events-none">
          <Pencil size={12} strokeWidth={2} className="text-gray-500" />
        </span>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute z-50 bg-gray-950 rounded-2xl shadow-2xl p-4 w-80"
            style={{ top: "6.5rem", left: "50%", transform: "translateX(-50%)" }}
          >
            <p className="text-white text-xs font-semibold mb-3 text-center tracking-widest uppercase opacity-70 hidden">
              Escolha seu perfil
            </p>
            <div className="grid grid-cols-5 gap-3">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.icon}
                  type="button"
                  title={avatar.icon}
                  onClick={() => {
                    onChange(avatar.icon);
                    setOpen(false);
                  }}
                  className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all hover:scale-110 focus:outline-none ${
                    safeValue === avatar.icon
                      ? "ring-4 ring-white scale-110"
                      : "ring-0 opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: avatar.bg }}
                  aria-label={avatar.icon}
                  aria-pressed={safeValue === avatar.icon}
                >
                  <IconComponent name={avatar.icon} size={22} color={avatar.fg} />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
