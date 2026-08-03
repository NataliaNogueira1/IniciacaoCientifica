"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Importa a mesma paleta do picker para manter consistência visual
const AVATAR_PALETTE: Record<string, { bg: string; fg: string }> = {
  Leaf:           { bg: "#4ade80", fg: "#14532d" },
  Sprout:         { bg: "#86efac", fg: "#166534" },
  Flower:         { bg: "#f9a8d4", fg: "#831843" },
  Flower2:        { bg: "#fda4af", fg: "#881337" },
  TreePine:       { bg: "#6ee7b7", fg: "#065f46" },
  TreeDeciduous:  { bg: "#a7f3d0", fg: "#064e3b" },
  Bug:            { bg: "#fde68a", fg: "#78350f" },
  Bird:           { bg: "#93c5fd", fg: "#1e3a8a" },
  Rabbit:         { bg: "#e9d5ff", fg: "#4c1d95" },
  PawPrint:       { bg: "#fdba74", fg: "#7c2d12" },
  Turtle:         { bg: "#bbf7d0", fg: "#14532d" },
  Fish:           { bg: "#7dd3fc", fg: "#0c4a6e" },
  Cat:            { bg: "#fcd34d", fg: "#78350f" },
  Dog:            { bg: "#d4a373", fg: "#451a03" },
  Snail:          { bg: "#c4b5fd", fg: "#3b0764" },
  Worm:           { bg: "#fb923c", fg: "#431407" },
  UserRound:      { bg: "#60a5fa", fg: "#1e3a8a" },
  Crown:          { bg: "#fbbf24", fg: "#78350f" },
  Star:           { bg: "#fde047", fg: "#713f12" },
  Smile:          { bg: "#34d399", fg: "#064e3b" },
  GraduationCap:  { bg: "#818cf8", fg: "#1e1b4b" },
  Glasses:        { bg: "#a78bfa", fg: "#2e1065" },
  HardHat:        { bg: "#fb923c", fg: "#431407" },
  Baby:           { bg: "#fbcfe8", fg: "#831843" },
  Sun:            { bg: "#fef08a", fg: "#713f12" },
  Moon:           { bg: "#1e293b", fg: "#e2e8f0" },
  Flame:          { bg: "#f97316", fg: "#431407" },
  Snowflake:      { bg: "#bae6fd", fg: "#0c4a6e" },
  Waves:          { bg: "#38bdf8", fg: "#0c4a6e" },
  Mountain:       { bg: "#94a3b8", fg: "#0f172a" },
};

const DEFAULT_PALETTE = { bg: "#fbbf24", fg: "#78350f" };

const SIZE_PX = { xs: 36, sm: 48, md: 56, lg: 64 };
const ICON_SIZE = { xs: 16, sm: 22, md: 26, lg: 30 };

interface IconAvatarProps {
  icon?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  rounded?: "full" | "xl";
}

export default function IconAvatar({
  icon,
  size = "md",
  className = "",
  rounded = "full",
}: IconAvatarProps) {
  const px = SIZE_PX[size];
  const iconSize = ICON_SIZE[size];
  const name = icon || "Leaf";
  const { bg, fg } = AVATAR_PALETTE[name] ?? DEFAULT_PALETTE;
  const Icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name] ?? LucideIcons.Leaf;
  const roundedClass = rounded === "full" ? "rounded-full" : "rounded-xl";

  return (
    <div
      className={`${roundedClass} flex items-center justify-center shrink-0 ${className}`}
      style={{ width: px, height: px, backgroundColor: bg }}
      aria-hidden="true"
    >
      <Icon size={iconSize} strokeWidth={1.5} color={fg} />
    </div>
  );
}
